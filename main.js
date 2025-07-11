const lottie = require("lottie-nodejs");
const { Canvas, Image } = require("canvas");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

lottie.setCanvas({ Canvas, Image });

const canvas = new Canvas(512,512);
const outputDir = path.join(__dirname,"./data/");
const fps = 30;
async function renderFramesToPNGs() {
  await fs.ensureDir(outputDir);
  const anim = await lottie.loadAnimation({
    container: canvas,
    loop: false,
    path: path.join(__dirname, './assets/data.json'),
  });
  const totalFrames = anim.totalFrames;
  for (let frame = 0; frame < totalFrames; frame++) {
    anim.goToAndStop(frame, true);
    anim.render();
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(outputDir, `frame_${String(frame).padStart(4, '0')}.png`);
    await fs.outputFile(filePath, buffer);
  }
  console.log(`Rendered ${totalFrames} frames.`);
}
function createWebMFromPNGs() {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -framerate ${fps} -i ${outputDir}/frame_%04d.png -c:v libvpx-vp9 -b:v 1M output.webm`;
    exec(cmd,(error, stdout, stderr) => {
      if (error) return reject(error);
      console.log(stdout || stderr);
      resolve();
    });
  });
}
(async () => {
  await renderFramesToPNGs();
  await createWebMFromPNGs();
  console.log('✅ WebM video created.');
})();
