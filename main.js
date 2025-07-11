/*const fs = require('fs');
const path = require('path');
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

function optimizeLottie(lottieObj, decimalDigits = 2) {
  const keysToRemove = ["nm", "id", "mn", "cl"];
  function roundNumberCustom(num, digits) {
    if (typeof num !== "number") return num;
    const str = num.toString();
    if (!str.includes('.')) return num;
    const match = str.match(/^-?0*\.(0*)(\d+)/);
    if (match) {
      const leadingZeros = match[1].length;
      const significant = match[2].substring(0, digits);
      return parseFloat(`0.${"0".repeat(leadingZeros)}${significant}`);
    } else {
      const intPart = str.split('.')[0];
      const decPart = str.split('.')[1].substring(0, digits - 1);
      return parseFloat(`${intPart}.${decPart}`);
    }
  }
  function deepClean(obj) {
    if (Array.isArray(obj)) {
      return obj
        .map(deepClean)
        .filter(item => !(item && item.hd === true));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj = {};
      for (const key in obj) {
        if (keysToRemove.includes(key)) continue;
        if (key === "ddd" && obj[key] === 1) continue;
        if (key === "hd" && obj[key] === true) continue;

        const value = obj[key];
        if (typeof value === "number") {
          newObj[key] = roundNumberCustom(value, decimalDigits);
        } else {
          newObj[key] = deepClean(value);
        }
      }
      return newObj;
    } else {
      return obj;
    }
  }
  return deepClean(lottieObj);
}

(async()=>{
  const l = await(await fetch("https://gifts.coffin.meme/bundles/525878182.json")).json();
  fs.writeFileSync("./data/lottie0.json",JSON.stringify(l),"utf8");
  fs.writeFileSync("./data/lottie1.json",JSON.stringify(optimizeLottie(l)),"utf8");
})();
