// Стискання картинок через canvas у Chrome: навантажувач PNG→WebP, фон команди легше, мініатюри кольорів 96×96
const puppeteer = require("puppeteer-core"), fs = require("fs"), path = require("path");
const IMG = "C:/Users/Acer/Desktop/projects/probeton-site/img/";
const ORIG = "C:/Users/Acer/Desktop/projects/probeton-site/originals/";
const jobs = [
  { src: "navantazhuvach.png", out: "navantazhuvach.webp", q: 0.86 },
  { src: "fon-komanda.webp", out: "fon-komanda.webp", q: 0.68, w: 1920, backup: true },
  { src: "fon-krany-2.webp", out: "fon-krany-2.webp", q: 0.7, w: 2000, backup: true },
  { src: "betonozmishuvach.webp", out: "betonozmishuvach.webp", q: 0.8, backup: true },
];
const names = ["ls-terra", "ls-porto", "ls-palermo", "ls-platyna", "ls-granat", "ls-everest", "ls-nuar", "pt-siryi", "pt-vyshnia", "pt-perlyna", "pt-sakhara", "sm-siryi", "sm-hrafit", "sm-malibu", "sm-espreso", "bruk-siryi"];
// .sw показував центральну третину (background-size:300%) — ріжемо її ж
for (const n of names) jobs.push({ src: n + ".webp", out: "sw/" + n + ".webp", q: 0.8, crop: 1 / 3, w: 96 });
(async () => {
  fs.mkdirSync(IMG + "sw", { recursive: true }); fs.mkdirSync(ORIG, { recursive: true });
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage();
  for (const j of jobs) {
    const from = IMG + j.src;
    if (j.backup && !fs.existsSync(ORIG + j.src)) fs.copyFileSync(from, ORIG + j.src);
    const srcFile = j.backup ? ORIG + j.src : from;
    const before = fs.statSync(srcFile).size;
    await p.goto("file:///" + srcFile);
    const data = await p.evaluate(async j => {
      const i = document.querySelector("img"); await i.decode();
      let sx = 0, sy = 0, sw = i.naturalWidth, sh = i.naturalHeight;
      if (j.crop) { sw = Math.round(i.naturalWidth * j.crop); sh = Math.round(i.naturalHeight * j.crop); sx = (i.naturalWidth - sw) / 2; sy = (i.naturalHeight - sh) / 2; }
      const w = Math.min(j.w || sw, sw), h = Math.round(sh * w / sw);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(i, sx, sy, sw, sh, 0, 0, w, h);
      return c.toDataURL("image/webp", j.q);
    }, j);
    const buf = Buffer.from(data.split(",")[1], "base64");
    if (!j.crop && j.out === j.src && buf.length >= before) { console.log("skip", j.src); continue; }
    fs.writeFileSync(IMG + j.out, buf);
    console.log(j.out, Math.round(before / 1024) + "KB →", Math.round(buf.length / 1024) + "KB");
  }
  await b.close();
})();
