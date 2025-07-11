const lottie = require('lottie-nodejs');
const { Canvas, Image } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

lottie.setCanvas({ Canvas, Image });

const width = 512, height = 512;
const canvas = new Canvas(width, height);
const ctx = canvas.getContext('2d');

const anim = lottie.loadAnimation({
  container: canvas,
  loop: false,
  path: path.join(__dirname, './assets/data.json'),
});

fs.ensureDirSync(path.join(__dirname, 'data'));

const ffmpeg = spawn('ffmpeg', [
  '-y',
  '-f', 'image2pipe',
  '-r', '30',
  '-i', '-',
  '-c:v', 'libvpx-vp9',
  '-b:v', '2M',
  path.join(__dirname, 'data/output.webm')
]);

ffmpeg.stderr.on('data', data => {
  console.error(`ffmpeg stderr: ${data}`);
});

anim.addEventListener('DOMLoaded', async () => {
  const totalFrames = Math.floor(anim.getDuration(true));
  console.log(`Total frames: ${totalFrames}`);

  for (let i = 0; i < totalFrames; i++) {
    anim.goToAndStop(i, true);
    const buffer = canvas.toBuffer('image/png');
    ffmpeg.stdin.write(buffer);
  }

  ffmpeg.stdin.end();
  console.log('Rendering complete. Video saved to /data/output.webm');
});
