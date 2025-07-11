const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { spawn } = require('child_process');
const { Canvas, Image } = require('canvas');
const lottie = require('lottie-nodejs');

// Setup
lottie.setCanvas({ Canvas, Image });
const width = 512, height = 512;
const canvas = new Canvas(width, height);

fs.mkdirSync("./data", { recursive: true });

(async () => {
  const url = "https://gifts.coffin.meme/bundles/525878182.json";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Lottie JSON: ${res.statusText}`);
  const animationData = await res.json();
  fs.writeFileSync("./data/lottie.json",JSON.stringify(animationData))

  // Load Lottie
  const anim = lottie.loadAnimation({
    container: canvas,
    loop: false,
    animationData,
  });

  (async () => {
    const totalFrames = anim.totalFrames;
    const fps = 30;
    const ffmpeg = spawn("ffmpeg", [
      '-y',
      '-f', 'image2pipe',
      '-framerate', `${fps}`,
      '-i', '-',
      '-c:v', 'libvpx-vp9',
      '-pix_fmt', 'yuva420p',
      './data/output.webm',
    ]);
    ffmpeg.stderr.on('data', (data) => {
      console.error(`ffmpeg: ${data}`);
    });
    ffmpeg.on('close', (code) => {
      console.log(`FFmpeg exited with code ${code}`);
    });
    for (let i = 0; i < totalFrames; i++) {
      if (i==0) fs.writeFileSync('./data/frame0.png', buffer);
      anim.goToAndStop(i,true);
      const buffer = canvas.toBuffer('image/png');
      ffmpeg.stdin.write(buffer);
    }
    ffmpeg.stdin.end();
  });
})();
