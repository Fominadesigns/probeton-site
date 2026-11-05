// Знімки сторінок PDF-верстки для перевірки на око
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage();
  await p.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  await p.emulateMediaType("print");
  await p.goto("file:///" + path.join(__dirname, "prezentatsiya.html").split(path.sep).join("/"), { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.join(__dirname, "prev"), { recursive: true });
  const pgs = await p.$$(".pg");
  for (let i = 0; i < pgs.length; i++) await pgs[i].screenshot({ path: path.join(__dirname, "prev", "p" + String(i + 1).padStart(2, "0") + ".jpg"), type: "jpeg", quality: 70 });
  await b.close(); console.log(pgs.length);
})();
