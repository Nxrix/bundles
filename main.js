/*const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { spawn } = require('child_process');
const { Canvas, Image } = require('canvas');
const lottie = require('lottie-nodejs');

lottie.setCanvas({ Canvas, Image });
const width = 512, height = 512;
const canvas = new Canvas(width, height);

fs.mkdirSync("./data", { recursive: true });

(async () => {
  const url = "https://gifts.coffin.meme/bundles/525878182.json";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Lottie JSON: ${res.statusText}`);
  const animationData = await res.json();
  //fs.writeFileSync("./data/lottie.json",JSON.stringify(animationData))

  const anim = lottie.loadAnimation({
    container: canvas,
    loop: false,
    animationData,
  });

  const totalFrames = anim.totalFrames;
  console.log(totalFrames);
  const fps = 30;
  const ffmpeg = spawn("ffmpeg",[
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
    //anim.render();
    anim.goToAndStop(i,true);
    const buffer = canvas.toBuffer('image/png');
    ffmpeg.stdin.write(buffer);
    if (i==0) fs.writeFileSync('./data/frame0.png', buffer);
  }
  ffmpeg.stdin.end();
})();
*/
/*const converter = require('lottie-converter');
const fs = require('fs');

async function main() {
  let converted = await converter({
    file: Buffer.from(await(await fetch("https://gifts.coffin.meme/bundles/525878182.json")).arrayBuffer()),//await fs.readFileSync('lottie.json'),
    //filename: 'hi.json',//optional
    format: "webm",
    width: 256,
    height: 256
  })
  fs.writeFileSync('converted.webm',converted,'base64')
}
main()
*/

const fs = require("fs");
//const fetch = require("node-fetch");

function optimizeLottie(obj, precision = 2) {
  const keysToRemove = new Set(['nm', 'id', 'mn', 'cl', 'ddd']);
  function roundSmart(num) {
    if (typeof num !== 'number') return num;
    if (Math.abs(num) < 1e-8) return 0;
    const fixed = Number(num.toPrecision(15)); 
    const digits = Math.floor(Math.log10(Math.abs(fixed)));
    const scale = Math.pow(10, digits - precision + 1);
    return Math.round(fixed / scale) * scale;
  }
  function deepClean(value) {
    if (Array.isArray(value)) {
      return value
        .map(deepClean)
        .filter(v => v !== undefined);
    } else if (value && typeof value === 'object') {
      const newObj = {};
      for (const key in value) {
        if (keysToRemove.has(key)) continue;
        if (key === 'hd' && value[key] === true) return undefined;
        const cleaned = deepClean(value[key]);
        if (cleaned !== undefined) {
          newObj[key] = cleaned;
        }
      }
      return newObj;
    } else if (typeof value === 'number') {
      return roundSmart(value);
    }
    return value;
  }

  return deepClean(obj);
}
(async()=>{
  const l = await(await fetch("https://gifts.coffin.meme/bundles/525878182.json")).json();
  fs.writeFileSync("./data/lottie0.json",JSON.stringify(l),"utf8");
  fs.writeFileSync("./data/lottie1.json",JSON.stringify(optimizeLottie(l)),"utf8");
})();
