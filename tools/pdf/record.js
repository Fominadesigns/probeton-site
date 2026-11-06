// Запис екрана всього сайту: плавна прокрутка, кліки з видимим курсором, віконце дзвінка, усі сторінки.
// Кадри знімаються через CDP screencast з мітками часу → rec/frames/*.jpg + rec/frames.json
const puppeteer = require("puppeteer-core"), fs = require("fs"), path = require("path");
const BASE = "http://127.0.0.1:8776/";
const W = 1440, H = 900;
const DIR = path.join(__dirname, "rec", "frames");
fs.rmSync(path.join(__dirname, "rec"), { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const INJECT = `
(() => {
  const css = '#__cur{position:fixed;left:0;top:0;width:26px;height:26px;z-index:2147483647;pointer-events:none;transform:translate(-3px,-2px);filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}'
   + '.__rip{position:fixed;z-index:2147483646;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%!important;border:3px solid #F46322;animation:__rip .6s ease-out forwards}'
   + '@keyframes __rip{from{transform:scale(.2);opacity:1}to{transform:scale(1.4);opacity:0}}'
   + 'html{scroll-behavior:auto!important}::-webkit-scrollbar{display:none}';
  const add = () => {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const c = document.createElement('div'); c.id = '__cur';
    c.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.9L4 19z" fill="#fff" stroke="#141517" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c);
    let p = {x: 760, y: 470}; try { p = JSON.parse(sessionStorage.__cur || '0') || p } catch (e) {}
    const mv = (x, y) => { c.style.left = x + 'px'; c.style.top = y + 'px'; try { sessionStorage.__cur = JSON.stringify({x, y}) } catch (e) {} };
    mv(p.x, p.y);
    addEventListener('mousemove', e => mv(e.clientX, e.clientY), true);
    addEventListener('mousedown', e => { const r = document.createElement('div'); r.className = '__rip'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700) }, true);
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', add); else add();
  // плавна прокрутка з м'яким розгоном і гальмуванням
  window.__ss = (y, ms) => new Promise(res => {
    const y0 = scrollY, max = document.documentElement.scrollHeight - innerHeight, y1 = Math.max(0, Math.min(max, y)), t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / ms), e = 0.5 - Math.cos(Math.PI * k) / 2; scrollTo(0, y0 + (y1 - y0) * e); k < 1 ? requestAnimationFrame(step) : res() };
    requestAnimationFrame(step);
  });
})();`;

(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars", `--window-size=${W},${H}`] });
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await p.evaluateOnNewDocument(INJECT);
  const cdp = await p.createCDPSession();
  const frames = [], marks = [];
  cdp.on("Page.screencastFrame", async f => {
    const n = frames.length;
    fs.writeFileSync(path.join(DIR, String(n).padStart(5, "0") + ".jpg"), Buffer.from(f.data, "base64"));
    frames.push(f.metadata.timestamp);
    try { await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }); } catch (e) {}
  });

  let mx = 760, my = 470;
  const move = async (x, y, ms = 700) => { const steps = Math.max(8, Math.round(ms / 16)); await p.mouse.move(x, y, { steps }); mx = x; my = y; };
  const top = async sel => p.evaluate(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY : null; }, sel);
  const scrollTo = async (y, ms) => { await p.evaluate((y, ms) => window.__ss(y, ms), y, ms); };
  const scrollToSel = async (sel, ms = 2200, off = 72) => { const y = await top(sel); if (y != null) await scrollTo(y - off, ms); };
  const center = async (sel, i = 0) => p.evaluate((s, i) => { const e = document.querySelectorAll(s)[i]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: r.top, b: r.bottom }; }, sel, i);
  const click = async (sel, i = 0, { pre = 350, post = 900, nav = false } = {}) => {
    let c = await center(sel, i);
    if (!c) { console.log("нема", sel); return; }
    // ціль під шапкою або внизу біля кнопок дзвінка/«нагору» — спершу м'яко підкручуємо її до середини екрана
    const fixed = await p.evaluate((s, i) => !!document.querySelectorAll(s)[i].closest(".cb-fab,.totop,.top,.cb"), sel, i);
    if (!fixed && (c.t < 110 || c.b > H - 190)) { await p.evaluate((y, ms) => window.__ss(scrollY + y - 420, ms), c.y, 1200); c = await center(sel, i); }
    await move(c.x, c.y, 650); await sleep(pre);
    if (nav) await Promise.all([p.waitForNavigation({ waitUntil: "networkidle0" }), p.mouse.click(c.x, c.y)]);
    else await p.mouse.click(c.x, c.y);
    await sleep(post);
  };
  const hover = async (sel, i = 0, ms = 900) => { const c = await center(sel, i); if (c) { await move(c.x, c.y, 600); await sleep(ms); } };
  const ready = async () => { await p.evaluate(() => document.fonts.ready); await sleep(300); };

  await p.goto(BASE, { waitUntil: "networkidle0" }); await ready();
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  const t0 = Date.now();

    marks.push(["Перший екран і калькулятор", Date.now()/1000]);
// 1. Перший екран: заголовок перемикає слова, калькулятор
  await sleep(3200);
  await click("#kinds > *", 3, { post: 900 });
  await click("#t-bruk", 0, { post: 1000 });
  await click("#kinds > *", 1, { post: 900 });
  await click("#t-beton", 0, { post: 900 });
  await hover(".hero .ctas .btn", 0, 1000);
    marks.push(["Цифри й партнери", Date.now()/1000]);
// 2. Цифри, партнери
  await scrollToSel(".stats-band", 2600, 140); await sleep(2200);
  await scrollToSel(".partners", 1800, 200); await sleep(1500);
    marks.push(["Бетон", Date.now()/1000]);
// 3. Бетон: міксер заїжджає, перемикаємо марки
  await scrollToSel("#beton", 2400); await sleep(3600);
  await click("#gscale .g", 2, { post: 700 }); await click("#gscale .g", 5, { post: 1200 });
    marks.push(["Каталог", Date.now()/1000]);
// 4. Каталог категорій — наведення на картки
  await scrollToSel("#cats", 2200); await sleep(800);
  for (const i of [0, 1, 2, 3]) await hover(".catc", i, 650);
    marks.push(["Двір: модель і колір", Date.now()/1000]);
// 5. Двір: моделі й кольори
  await scrollToSel("#bruk", 2200); await sleep(1000);
  await click("#sws > *", 2, { post: 1100 }); await click("#sws > *", 4, { post: 1100 });
  await click("#msel > *", 2, { post: 1300 }); await click("#sws > *", 1, { post: 1200 });
    marks.push(["Доставка маніпулятором", Date.now()/1000]);
// 6. Доставка: маніпулятор заїжджає
  await scrollToSel("#dostavka", 2400); await move(300, 820, 500); await sleep(4200);
    marks.push(["Акції", Date.now()/1000]);
// 7. Акції
  await scrollToSel("#akcii", 2200); await sleep(600);
  for (const i of [0, 1, 2]) await hover(".pcard", i, 600);
    marks.push(["Переваги", Date.now()/1000]);
// 8. Переваги
  await scrollToSel("#perevagy", 2200); await sleep(2800);
    marks.push(["Спецтехніка", Date.now()/1000]);
// 9. Спецтехніка: навантажувач заїжджає, наведення на техніку
  await scrollToSel("#tekhnika", 2400); await sleep(3800);
  for (const i of [1, 2]) await hover(".mach", i, 800);
    marks.push(["Калькулятор і питання", Date.now()/1000]);
// 10. Питання
  await scrollToSel("#faq", 2200); await sleep(500);
  await click("#faq summary", 0, { post: 1400 }); await click("#faq summary", 2, { post: 1400 });
    marks.push(["Як ми працюємо", Date.now()/1000]);
// 11. Як ми працюємо: кроки
  await scrollToSel("#flow", 2200); await sleep(1500);
  await click(".stp-tab", 2, { post: 1800 }); await click(".stp-tab", 3, { post: 1800 });
    marks.push(["Контакти", Date.now()/1000]);
// 12. Контакти
  await scrollToSel("#kontakty", 2200); await sleep(2200);
    marks.push(["Віконце дзвінка", Date.now()/1000]);
// 13. Зворотний дзвінок: відкриваємо віконце, вводимо номер, обираємо час, закриваємо
  await click("#cbOpen", 0, { post: 1200 });
  await click("#cbPhone", 0, { post: 300 });
  await p.keyboard.type("+380 67 123 45 67", { delay: 90 }); await sleep(700);
  await hover("#cbDay", 0, 600); await hover("#cbTime", 0, 900);
  await hover("#cbForm button[type=submit], #cbForm .btn", 0, 900);
  await click("#cbClose", 0, { post: 1000 });
  // 14. Кнопка «нагору»
  await click(".totop", 0, { post: 2600 });

    marks.push(["Каталог з фільтрами", Date.now()/1000]);
// 15. Сторінки: бруківка з фільтрами
  await click('#mnav a[href="bruk/"]', 0, { nav: true, post: 0 }); await ready(); await sleep(1600);
  await scrollToSel("#katalog", 2000, 80); await sleep(600);
  await click("#kcat input", 1, { post: 1500 });
  await scrollTo((await top("#kgrid")) + 300, 2200); await sleep(1000);
  await click("#kcat input", 1, { post: 900 });
  marks.push(["Сторінка «Бетон»", Date.now()/1000]);
  // бетон
  await scrollTo(0, 1600);
  await click('#mnav a[href="../beton/"]', 0, { nav: true, post: 0 }); await ready(); await sleep(1400);
  await scrollToSel("#beton", 2200); await sleep(3000);
  marks.push(["Сторінка «ЗБВ»", Date.now()/1000]);
  // ЗБВ
  await scrollTo(0, 1400);
  await click('#mnav a[href="../zbv/"]', 0, { nav: true, post: 0 }); await ready(); await sleep(1400);
  await scrollToSel("#zbv", 2200); await sleep(2000);
  marks.push(["Сторінка «Спецтехніка»", Date.now()/1000]);
  // спецтехніка
  await scrollTo(0, 1400);
  await click('#mnav a[href="../tekhnika/"]', 0, { nav: true, post: 0 }); await ready(); await sleep(1400);
  await scrollToSel("#tekhnika", 2200); await sleep(3200);
  marks.push(["Сторінка «Про нас»", Date.now()/1000]);
  // про нас
  await scrollTo(0, 1400);
  await click('#mnav a[href="../pro-nas/"]', 0, { nav: true, post: 0 }); await ready(); await sleep(1400);
  await scrollToSel("#about", 2200); await sleep(1200);
  await hover(".person", 0, 1200); await hover(".person", 1, 1200);
  marks.push(["Контакти й карта", Date.now()/1000]);
  // контакти з картою
  await scrollTo(0, 1400);
  await click('#mnav a[href="../kontakty/"]', 0, { nav: true, post: 0 }); await ready(); await sleep(1600);
  await scrollToSel("#mapa", 2600); await sleep(2600);
  // назад на головну через логотип
  await scrollTo(0, 1600);
  await click(".logo", 0, { nav: true, post: 0 }); await ready(); await sleep(3500);

  await cdp.send("Page.stopScreencast");
  await sleep(300);
  fs.writeFileSync(path.join(__dirname, "rec", "frames.json"), JSON.stringify(frames));
  fs.writeFileSync(path.join(__dirname, "rec", "marks.json"), JSON.stringify(marks.map(([n, t]) => [n, Math.max(0, +(t - frames[0]).toFixed(1))])));
  const span = frames[frames.length - 1] - frames[0];
  console.log("кадрів", frames.length, "тривалість", span.toFixed(1), "с", "сер. fps", (frames.length / span).toFixed(1), "стіна", ((Date.now() - t0) / 1000).toFixed(1));
  await b.close();
})();
