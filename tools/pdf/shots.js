// Знімки блоків сайту ПроБетон для PDF-презентації (без анімацій: prefers-reduced-motion)
const puppeteer = require("puppeteer-core");
const fs = require("fs"), path = require("path");
const BASE = "http://127.0.0.1:8776/";
const OUT = path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars"] });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const open = async (url, w, h, dpr = 2) => {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
    await page.goto(BASE + url, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    // прибрати плаваючі кнопки й таймер дзвінка, щоб не заважали на знімках
    await page.addStyleTag({ content: ".cb-fab,.totop{display:none!important}" + (w > 700 ? ".top{position:relative!important}" : "") });
    await new Promise(r => setTimeout(r, 600));
  };
  const shot = async (name, sel, opts = {}) => {
    const el = await page.$(sel);
    if (!el) { console.log("НЕМА", sel); return; }
    // прокрутити до блоку (щоб підвантажились картинки), потім рахувати координати від початку сторінки
    await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: "start" }), sel);
    await new Promise(r => setTimeout(r, 700));
    const clip = await page.evaluate((s, ext, maxH) => {
      const r = document.querySelector(s).getBoundingClientRect();
      let h = r.height;
      if (ext) { const r2 = document.querySelector(ext).getBoundingClientRect(); h = r2.bottom - r.top; }
      if (maxH) h = Math.min(h, maxH);
      return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: h };
    }, sel, opts.extendTo || null, opts.maxH || null);
    await page.screenshot({ path: path.join(OUT, name + ".jpg"), type: "jpeg", quality: 84, clip, captureBeyondViewport: true });
    console.log(name, Math.round(clip.width) + "x" + Math.round(clip.height));
  };
  // головна, 1440
  await open("", 1440, 900);
  await page.screenshot({ path: path.join(OUT, "hero.jpg"), type: "jpeg", quality: 84 });
  console.log("hero viewport");
  // далі знімаємо блоки з захопленням поза вікном — перший екран не має розтягуватися на всю висоту сторінки
  await page.addStyleTag({ content: ".hero{min-height:827px!important}" });
  await shot("stats", ".ticker", { extendTo: ".stats-band" });
  await shot("partners", "section.partners");
  await shot("beton", "#beton");
  await shot("cats", "#cats");
  await shot("bruk", "#bruk");
  await shot("akcii", "#akcii");
  await shot("perevagy", "#perevagy");
  await shot("flow", "#flow");
  await shot("faq", "#faq");
  await shot("kontakty", "#kontakty");

  // інші сторінки
  await open("bruk/", 1440, 900); await page.addStyleTag({ content: ".hero{min-height:827px!important}" });
  await shot("katalog", "#katalog", { maxH: 1250 });
  await open("tekhnika/", 1440, 900); await page.addStyleTag({ content: ".hero{min-height:827px!important}" });
  await shot("tekhnika", "#tekhnika");
  await open("kontakty/", 1440, 900); await page.addStyleTag({ content: ".hero{min-height:827px!important}" });
  await page.screenshot({ path: path.join(OUT, "page-kontakty.jpg"), type: "jpeg", quality: 84 });
  await open("beton/", 1440, 900); await page.addStyleTag({ content: ".hero{min-height:827px!important}" });
  await page.screenshot({ path: path.join(OUT, "page-beton.jpg"), type: "jpeg", quality: 84 });
  await open("pro-nas/", 1440, 900); await page.addStyleTag({ content: ".hero{min-height:827px!important}" });
  await shot("about", "#about");

  // телефон 390
  await open("", 390, 844, 3);
  await page.screenshot({ path: path.join(OUT, "m-hero.jpg"), type: "jpeg", quality: 84 });
  await page.click(".burger"); await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, "m-menu.jpg"), type: "jpeg", quality: 84 });
  await page.click(".burger");
  await open("bruk/", 390, 844, 3);
  await page.evaluate(() => { const r = document.querySelector("#kgrid").getBoundingClientRect(); scrollTo(0, scrollY + r.top - 120); });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, "m-katalog.jpg"), type: "jpeg", quality: 84 });
  await page.evaluate(() => { const r = document.querySelector(".show").getBoundingClientRect(); scrollTo(0, scrollY + r.top - 80); });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, "m-dvir.jpg"), type: "jpeg", quality: 84 });

  await browser.close();
})();
