// PNG з прозорістю → обрізати порожні поля → WebP заданої ширини
const puppeteer = require("puppeteer-core"), fs = require("fs"), path = require("path");
const [src, dst, w] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage();
  await p.goto("file:///" + path.resolve(src).split(path.sep).join("/"));
  const r = await p.evaluate(async (W) => {
    const i = document.querySelector("img"); await i.decode();
    const c0 = document.createElement("canvas"); c0.width = i.naturalWidth; c0.height = i.naturalHeight;
    const x0 = c0.getContext("2d"); x0.drawImage(i, 0, 0);
    const d = x0.getImageData(0, 0, c0.width, c0.height).data;
    let L = c0.width, T = c0.height, R = 0, B = 0;
    for (let y = 0; y < c0.height; y++) for (let x = 0; x < c0.width; x++) if (d[(y * c0.width + x) * 4 + 3] > 12) { if (x < L) L = x; if (x > R) R = x; if (y < T) T = y; if (y > B) B = y; }
    const cw = R - L + 1, ch = B - T + 1;
    const c = document.createElement("canvas"); c.width = W; c.height = Math.round(ch * W / cw);
    const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(c0, L, T, cw, ch, 0, 0, c.width, c.height);
    return { data: c.toDataURL("image/webp", 0.82), w: c.width, h: c.height };
  }, +w);
  fs.writeFileSync(dst, Buffer.from(r.data.split(",")[1], "base64"));
  await b.close(); console.log(dst, r.w + "x" + r.h, fs.statSync(dst).size);
})();
