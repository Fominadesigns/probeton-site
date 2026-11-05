// PDF-презентація нового сайту ПроБетон: A4 горизонтально, щільна верстка без порожніх місць.
// Блок: зліва знімок (ширина — під його пропорції, щоб заповнив висоту), справа «Що це / Чому саме так / Як продає».
// Якщо знімок невисокий — «Як продає» стоїть під ним. Кегль у кожній колонці підбирається, щоб текст заповнив її до низу.
const puppeteer = require("puppeteer-core");
const fs = require("fs"), path = require("path");
const B = require("./blocks.js");
const OUT_PDF = process.env.OUT_PDF || path.join(__dirname, "../../probeton-sait-prezentatsiya.pdf");
const OUT_HTML = path.join(__dirname, "prezentatsiya-h.html");
const SITE = "fominadesigns.github.io/probeton-site";
const LOGO = path.join(__dirname, "../../img/logo.png").split(path.sep).join("/");

const jpgSize = f => { const b = fs.readFileSync(f); let i = 2; while (i < b.length) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1], L = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + L; } return [16, 9]; };
const ratio = id => { const [w, h] = jpgSize(path.join(__dirname, "shots", id + ".jpg")); return h / w; };

const NB = "\u00a0";
const short = "і|й|а|в|у|з|о|та|на|до|за|по|від|під|над|для|про|при|без|із|зі|що|як|не|ні|чи|це|або|але|ми|є";
const re1 = new RegExp("(^|[\\s(«\u00a0])(" + short + ") ", "giu");
const esc = t => { for (let k = 0; k < 3; k++) t = t.replace(re1, (m, a, b) => a + b + NB); return t.replace(/ ([—–→])/g, NB + "$1").replace(/(\d) (?=[^\d\s—–·<])/g, "$1" + NB); };

const BODY_H = 172, MAX_W = 196;
const foot = n => `<footer><span>ПроБетон · новий сайт</span><span>${String(n).padStart(2, "0")}</span></footer>`;
const head = (lbl, t, sub) => `<header><p class="lbl">${lbl}</p><h2>${esc(t)}</h2><p class="sub">${esc(sub)}</p></header>`;
const sec = (h, p, cls = "") => `<div class="sec ${cls}"><h3>${h}</h3><p>${esc(p)}</p></div>`;

const MK = require("./mockups.js")({ esc, sec, head, foot, BODY_H });
const { blockSlide, pairSlide, mobileSlide } = MK;

const funnel = [["Побачив", "Перший екран, стрічка"], ["Довірився", "Цифри, партнери, переваги"], ["Обрав", "Бетон, каталог, двір, акції"], ["Порахував", "Калькулятор, процес"], ["Залишив заявку", "Форма, дзвінок у зручний час"]];
const principles = [["Ціни видно одразу", "Ціни з прайсу на картках, в акціях і в калькуляторі — без «ціну уточнюйте» скрізь."],
  ["У кожного блоку є дія", "Кнопка, дзвінок або калькулятор: людина ніде не «застрягає»."],
  ["Окремі сторінки для Google", "Бетон, бруківка, ЗБВ, техніка — кожна шукається окремо."],
  ["Телефон — головний екран", "Усе перевірено на телефоні: меню, каталог, кнопки дзвінка."]];

let n = 0, num = 0;
const slides = [];
n++;
slides.push(`<section class="pg cover">
  <div class="cl">
    <div class="lg"><img src="file:///${LOGO}"></div>
    <p class="meta">ПРЕЗЕНТАЦІЯ НОВОГО САЙТУ · ЛИСТОПАД 2026</p>
    <h1>Сайт, що продає <em><span>бетон</span></em></h1>
    <p class="cp">${esc("Розбираємо кожен блок нового сайту ПроБетон: що це, чому зроблено саме так і як він перетворює відвідувача на заявку.")}</p>
    <div class="cm"><p class="meta">${SITE}</p><p class="meta mut">${B.length} БЛОКІВ · ЩО ЦЕ · ЧОМУ ТАК · ЯК ПРОДАЄ</p></div>
  </div>
  <div class="cr"></div>
</section>`);
n++;
slides.push(`<section class="pg">
  <div class="bar"></div>
  ${head("Логіка сайту", "Сайт — це шлях покупця", "Кожен блок веде людину на один крок ближче до заявки")}
  <div class="logic">
    <p class="lead2">${esc("Головна сторінка збудована не як вітрина, а як розмова з покупцем. Спочатку він бачить, що ви продаєте, потім — чому вам можна довіряти, далі обирає товар, рахує обсяг і лише тоді залишає заявку. Кожен блок цієї презентації відповідає за свій крок.")}</p>
    <div class="flow5">${funnel.map((f, i) => `<div><i>0${i + 1}</i><b>${f[0]}</b><span>${esc(f[1])}</span></div>`).join("")}</div>
    <p class="lbl">Чотири правила, на яких тримається сайт</p>
    <div class="pr4">${principles.map(p => `<div><b>${esc(p[0])}</b><p>${esc(p[1])}</p></div>`).join("")}</div>
  </div>
  ${foot(n)}
</section>`);
for (let i = 0; i < B.length; i++) {
  const b = B[i];
  if (b.id === "stats" && B[i + 1] && B[i + 1].id === "partners") { n++; slides.push(pairSlide(b, B[i + 1], n, num + 1)); num += 2; i++; continue; }
  n++; num++;
  slides.push(b.id === "mobile" ? mobileSlide(b, n, num) : blockSlide(b, n, num));
}
n++;
slides.push(`<section class="pg dk">
  <div class="bar"></div>
  ${head("Пропозиція", "Вартість і запуск", "Сайт уже зібраний і працює як демо — після брифу наповнюємо його вашими даними")}
  <div class="price">
    <div class="price3">
      <div><h3>Сайт + фірмовий стиль</h3><p>${esc("Сім сторінок, каталог з фільтрами, калькулятор, двір, акції, питання, мобільна версія, перенесення домену. Брендбук і шаблони.")}</p><div class="v">400 $<small>7 ДНІВ ПІСЛЯ БРИФУ</small></div></div>
      <div class="bonus"><h3>Підтримка</h3><p>${esc("Оновлення цін і акцій, нові об'єкти, аналітика заявок щомісяця.")}</p><div class="v">0 $<small>БОНУС ВІД НАС</small></div></div>
      <div><h3>Далі — реклама</h3><p>${esc("Таргет в Instagram і Facebook, реклама в Google, контент для соцмереж — коли сайт почне збирати заявки.")}</p><div class="v sm">Обговоримо<small>ОКРЕМО</small></div></div>
    </div>
    <div class="pr">
      <p class="lbl">Від брифу до запуску</p>
      <div class="steps4">
        <div><i>01</i><b>Бриф</b><span>${esc("Відповіді, прайс з одиницями, документи")}</span></div>
        <div><i>02</i><b>Фотосесія</b><span>${esc("Техніка, об'єкти, склад, команда")}</span></div>
        <div><i>03</i><b>Наповнення</b><span>${esc("Ваші ціни, партнери, об'єкти на сайті")}</span></div>
        <div><i>04</i><b>Запуск</b><span>${esc("Домен probeton.com.ua, аналітика, заявки")}</span></div>
      </div>
      <p class="lbl">Що потрібно від вас</p>
      <div class="need">${["Ціни з одиницями виміру (м², шт, м³)", "Оптові умови й знижки від обсягу", "Назви й логотипи партнерів", "Фото 10–20 ваших об'єктів", "Графік роботи відділу продажу", "Розміри й ціни кілець, плит, балок"].map(t => `<span>${esc(t)}</span>`).join("")}</div>
    </div>
  </div>
  ${foot(n)}
</section>`);

const css = `
@page{size:297mm 210mm;margin:0}
*{box-sizing:border-box;margin:0}
body{font-family:Onest,sans-serif;color:#141517;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:297mm;height:210mm;padding:10mm 12mm 9mm;display:flex;flex-direction:column;gap:5mm;background:#F4F4F1;position:relative;overflow:hidden;page-break-after:always}
.pg.dk{background:#141517;color:#F4F4F1}
.bar{position:absolute;left:0;top:0;width:100%;height:2.6mm;background:repeating-linear-gradient(-45deg,#F46322 0 3mm,#141517 3mm 6mm)}
header{display:grid;grid-template-columns:auto 1fr;column-gap:6mm;row-gap:1.2mm;align-items:end}
header .lbl{grid-column:1/-1}
header h2{font:400 22pt/1 'Dela Gothic One',sans-serif;letter-spacing:-.02em}
header .sub{font-size:10.5pt;color:#61656A;padding-bottom:1mm}
.dk header .sub{color:#9EA2A7}
.lbl{font:700 8pt/1 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#067A87}
.dk .lbl{color:#3DB7C2}
.split{display:grid;gap:7mm;height:${BODY_H}mm;min-height:0}
.l{display:flex;flex-direction:column;gap:4mm;min-height:0}
.shot{width:100%;height:auto;max-height:${BODY_H}mm;object-fit:cover;object-position:top;border:1px solid #CDCFCA;display:block;flex:none}
.dk .shot{border-color:#2C2F33}
.two{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.two img{width:100%;height:auto;border:1px solid #CDCFCA;display:block}
.r,.sell{font-size:11pt}
.sell{flex:1;background:#F46322;padding:5mm 6mm;min-height:0;display:flex;flex-direction:column;justify-content:flex-start}
.sell .sec{border:0;padding:0}.sell .sec.hot h3{color:#fff}.sell .sec p{color:#1A0E06;font-weight:500}
.r{display:flex;flex-direction:column;gap:.9em;min-height:0}
.sec{display:grid;gap:.45em;padding-top:.9em;border-top:1px solid #CDCFCA}
.r .sec:first-child{border-top:0;padding-top:0}
.dk .sec{border-top-color:#2C2F33}
.sec h3{font:400 1.08em/1.15 'Dela Gothic One',sans-serif}
.sec p{font-size:1em;line-height:1.5;color:#33363A}
.dk .sec p{color:#C9CCD0}
.sec.hot h3{color:#F46322}
/* «Чому саме так» — картка на всю решту висоти колонки */
.split .r .sec:nth-child(2){background:#fff;border:0;padding:.9em 1.1em;flex:1;align-content:start}
.dk .split .r .sec:nth-child(2){background:#1F2124}
.r .sec.hot{background:#F46322;border:0;padding:.9em 1.1em;flex:1;align-content:start}.r .sec.hot h3{color:#fff}.r .sec.hot p{color:#1A0E06;font-weight:500}
footer{position:absolute;left:12mm;right:12mm;bottom:3.5mm;display:flex;justify-content:space-between;font:500 7.5pt/1 'JetBrains Mono',monospace;color:#8F949A}
.pair{gap:5mm;padding-top:9mm}
.prow{flex:1;display:grid;grid-template-columns:178mm 1fr;gap:7mm;min-height:0}
.prow + .prow{border-top:1px solid #CDCFCA;padding-top:5mm}
.prow .r{gap:.6em}.prow .r .sec{padding-top:.6em}.prow .sec p{line-height:1.42}
.pt{font:400 17pt/1.05 'Dela Gothic One',sans-serif;letter-spacing:-.01em}
.mob{display:grid;grid-template-rows:auto 1fr;gap:5mm;height:${BODY_H}mm;min-height:0}

.phones img{height:100%;width:auto;border:1.4mm solid #141517;display:block}
.mob .r{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6mm;align-items:stretch}
.mob .r .sec{border-top:0;padding-top:0}.mob .r .sec.hot{margin-top:0}
.cover{display:grid;grid-template-columns:132mm 1fr;padding:0;gap:0;background:#141517;color:#F4F4F1}
.cl{padding:14mm 12mm 12mm 14mm;display:flex;flex-direction:column;gap:7mm}
.cl .lg{align-self:flex-start;background:#F4F4F1;padding:3mm 5mm}.cl .lg img{height:12mm;display:block}
.cover h1{font:400 38pt/1.02 'Dela Gothic One',sans-serif;letter-spacing:-.02em;margin-top:auto}
.cover h1 em{font-style:normal;background:#F46322;padding:0 2mm;display:inline-block;transform:skewX(-10deg);margin-top:1mm}.cover h1 em span{display:inline-block;transform:skewX(10deg)}
.cp{font-size:12pt;line-height:1.5;color:#B9BDC2}
.cm{display:grid;gap:2mm}
.meta{font:700 8.5pt/1.5 'JetBrains Mono',monospace;letter-spacing:.08em;color:#3DB7C2}.meta.mut{color:#8F949A}
.cr{background:url(file:///${LOGO.replace("logo.png", "fon-heroi-3.webp")}) 42% center/cover;border-left:2.6mm solid #F46322}
.logic{flex:1;display:grid;grid-template-rows:auto 1fr auto 1fr;gap:5mm;min-height:0}
.lead2{font-size:12.5pt;line-height:1.55;color:#33363A;max-width:250mm}
.flow5{display:grid;grid-template-columns:repeat(5,1fr);gap:2.5mm}
.flow5 div{background:#141517;color:#fff;padding:6mm;display:flex;flex-direction:column;gap:3mm}
.flow5 div:nth-child(5){background:#F46322}
.flow5 b{font:400 16pt/1.15 'Dela Gothic One',sans-serif}.flow5 span{font-size:12pt;line-height:1.4;color:#C9CCD0}.flow5 div:nth-child(5) span{color:#FFE5D6}
.flow5 i{font:700 10pt/1 'JetBrains Mono',monospace;font-style:normal;color:#F46322}.flow5 div:nth-child(5) i{color:#141517}
.pr4{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm}
.pr4 div{border-top:1.2mm solid #067A87;background:#fff;padding:6mm;display:flex;flex-direction:column;gap:3mm}
.pr4 b{font:400 15pt/1.2 'Dela Gothic One',sans-serif}.pr4 p{font-size:12.5pt;line-height:1.5;color:#33363A}
.price{flex:1;display:grid;grid-template-columns:150mm 1fr;gap:8mm;min-height:0}
.price3{display:grid;grid-template-rows:1fr 1fr 1fr;gap:4mm}
.price3 > div{display:grid;grid-template-columns:1fr auto;gap:2mm 6mm;align-content:center;padding:5mm 6mm;background:#1F2124}
.price3 h3{font:400 14pt/1.1 'Dela Gothic One',sans-serif}
.price3 p{grid-column:1;font-size:10pt;line-height:1.45;color:#B9BDC2}
.price3 .v{grid-column:2;grid-row:1/3;align-self:center;font:400 28pt/1 'Dela Gothic One',sans-serif;color:#F46322;text-align:right}
.price3 .v.sm{font-size:15pt}
.price3 .v small{display:block;font:700 8pt/1.4 'JetBrains Mono',monospace;color:#9EA2A7;margin-top:2mm}
.price3 > div.bonus{background:#F46322;color:#141517}.price3 .bonus p{color:#2A1A10}.price3 .bonus .v,.price3 .bonus .v small{color:#141517}
.pr{display:flex;flex-direction:column;gap:4mm}
.steps4{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.steps4 div{border-top:1mm solid #F46322;padding-top:3mm;display:grid;gap:1.5mm}
.steps4 i{font:700 9pt/1 'JetBrains Mono',monospace;font-style:normal;color:#F46322}.steps4 b{font:400 12pt/1.2 'Dela Gothic One',sans-serif}.steps4 span{font-size:10pt;line-height:1.4;color:#B9BDC2}
.need{display:grid;gap:2mm;font-size:10.5pt;line-height:1.4;color:#C9CCD0;background:#1F2124;padding:5mm 6mm;flex:1;align-content:center}
.need span::before{content:"— ";color:#F46322}
`;

const CSS_ALL = css + MK.css;
const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<style>${CSS_ALL}</style></head><body>${slides.join("\n")}</body></html>`;
fs.writeFileSync(OUT_HTML, html);

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1123, height: 794 });
  await page.emulateMediaType("print");
  await page.goto("file:///" + OUT_HTML.split(path.sep).join("/"), { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  // кегль у кожній колонці — найбільший, при якому текст ще вміщається; так колонки заповнені до низу
  await page.evaluate(() => {
    const fit = (el, lo, hi) => { for (let k = 0; k < 10; k++) { const mid = (lo + hi) / 2; el.style.fontSize = mid + "pt"; if (el.scrollHeight <= el.clientHeight + 1) lo = mid; else hi = mid; } el.style.fontSize = lo + "pt"; };
    document.querySelectorAll(".split .r,.prow .r").forEach(el => fit(el, 8.5, 14));
    document.querySelectorAll(".mob .r .sec").forEach(el => { el.style.height = "100%"; });
    document.querySelectorAll(".mob .r").forEach(el => fit(el, 8.5, 13));
    document.querySelectorAll(".sell").forEach(el => fit(el, 9, 18));
  });
  // знімки сторінок після підбору кегля — для перевірки на око
  if (process.env.PREVIEW) {
    fs.mkdirSync(path.join(__dirname, "prev"), { recursive: true });
    const pgs = await page.$$(".pg");
    for (let i = 0; i < pgs.length; i++) await pgs[i].screenshot({ path: path.join(__dirname, "prev", "p" + String(i + 1).padStart(2, "0") + ".jpg"), type: "jpeg", quality: 72 });
  }
  const rep = await page.evaluate(() => [...document.querySelectorAll(".pg")].map((p, i) => {
    const out = [];
    p.querySelectorAll(".r,.l,.sell").forEach(c => { if (c.scrollHeight > c.clientHeight + 2) out.push("OVER " + c.className + " +" + Math.round((c.scrollHeight - c.clientHeight) / 3.78) + "mm"); });
    const r = p.querySelector(".split .r"); if (r) { const kids = [...r.children]; const last = kids[kids.length - 1].getBoundingClientRect(); const gap = (r.getBoundingClientRect().bottom - last.bottom) / 3.78; out.push("кегль " + r.style.fontSize + (gap > 8 ? " порожньо " + Math.round(gap) + "мм" : "")); }
    const l = p.querySelector(".split .l"); if (l) { const kids = [...l.children]; const gap = (l.getBoundingClientRect().bottom - kids[kids.length - 1].getBoundingClientRect().bottom) / 3.78; if (gap > 8) out.push("ліворуч порожньо " + Math.round(gap) + "мм"); }
    return out.length ? (i + 1) + ": " + out.join("; ") : null; }).filter(Boolean));
  console.log("slides", await page.evaluate(() => document.querySelectorAll(".pg").length));
  console.log(rep.join("\n"));
  await page.pdf({ path: OUT_PDF, width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(OUT_PDF, (fs.statSync(OUT_PDF).size / 1048576).toFixed(1) + " MB");
})();
