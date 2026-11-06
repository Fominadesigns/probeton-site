// Знімки «як у вікні браузера» (1440×900): блок прокручено під шапку — для макета ноутбука
const puppeteer = require("puppeteer-core");
const fs = require("fs"), path = require("path");
const BASE = "http://127.0.0.1:8776/";
const OUT = path.join(__dirname, "views");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars"] });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  const open = async url => {
    await page.goto(BASE + url, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ".cb-fab,.totop{display:none!important}" });
    await new Promise(r => setTimeout(r, 500));
  };
  const view = async (name, sel, extra = 0) => {
    if (sel) await page.evaluate((s, ex) => { const el = document.querySelector(s); const hh = document.querySelector(".top").offsetHeight; scrollTo(0, el.getBoundingClientRect().top + scrollY - hh + ex); }, sel, extra);
    else await page.evaluate(() => scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: path.join(OUT, name + ".jpg"), type: "jpeg", quality: 85 });
    console.log(name);
  };
  await open("");
  await view("hero", null);
  await view("stats", ".ticker");
  for (const id of ["beton", "cats", "bruk", "dostavka", "akcii", "perevagy", "tekhnika", "faq", "flow", "kontakty"]) await view(id, "#" + id);
  // віконце дзвінка
  await view("callback", "#perevagy", -40);
  await page.addStyleTag({ content: ".cb-fab{display:grid!important}" });
  await page.click("#cbOpen"); await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT, "callback.jpg"), type: "jpeg", quality: 85 });
  // інші сторінки
  await open("bruk/"); await view("page-bruk", null); await view("katalog", "#katalog", -10);
  await open("beton/"); await view("page-beton", null);
  await open("tekhnika/"); await view("page-tekhnika", null);
  await open("kontakty/"); await view("page-kontakty", null);
  await browser.close();
})();
