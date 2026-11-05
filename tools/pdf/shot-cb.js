// Знімок віконця «Передзвонимо у зручний час» поверх сайту
const puppeteer = require("puppeteer-core"), path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars"] });
  const p = await b.newPage();
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await p.goto("http://127.0.0.1:8776/", { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { const r = document.querySelector("#perevagy").getBoundingClientRect(); scrollTo(0, scrollY + r.top - 40); });
  await new Promise(r => setTimeout(r, 500));
  await p.click("#cbOpen");
  await new Promise(r => setTimeout(r, 700));
  await p.screenshot({ path: path.join(__dirname, "shots", "callback.jpg"), type: "jpeg", quality: 84 });
  await b.close(); console.log("ok");
})();
