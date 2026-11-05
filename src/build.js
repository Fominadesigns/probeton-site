// Збирає багатосторінковий сайт ПроБетон з одного джерела probeton-site.html.
// Джерело — «бібліотека» розділів; тут вирішуємо, які розділи йдуть на яку сторінку.
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "site.html");
const OUT = path.join(__dirname, "..");
const s = fs.readFileSync(SRC, "utf8");

const grab = re => { const m = s.match(re); if (!m) throw new Error("немає розділу: " + re); return m[0]; };
const sec = id => grab(new RegExp('<!--[^\\n]*-->\\n<section[^>]*id="' + id + '"[\\s\\S]*?</section>|<section[^>]*id="' + id + '"[\\s\\S]*?</section>'));

const headSrc = s.slice(0, s.indexOf("</style>") + 8);
const S = {
  hero: grab(/<section class="hero">[\s\S]*?<\/section>/),
  ticker: grab(/<div class="ticker"[\s\S]*?<\/div><\/div>/),
  stats: grab(/<section class="stats-band"[\s\S]*?<\/section>/),
  partners: grab(/<!-- НАМ ДОВІРЯЮТЬ[^\n]*\n<section class="partners"[\s\S]*?<\/section>/),
};
["beton", "akcii", "bruk", "faq", "zbv", "tekhnika", "perevagy", "flow", "about", "kontakty", "katalog", "cats", "mapa"].forEach(id => S[id] = sec(id));
const tailSrc = s.slice(s.indexOf("<!-- Зворотний дзвінок"));

const NAV = [["beton/", "Бетон"], ["bruk/", "Бруківка"], ["zbv/", "ЗБВ"], ["tekhnika/", "Спецтехніка"], ["pro-nas/", "Про нас"], ["kontakty/", "Контакти"]];
const PAGE_OF = { beton: "beton/", bruk: "bruk/", katalog: "bruk/", zbv: "zbv/", tekhnika: "tekhnika/", about: "pro-nas/" };

const PAGES = [
  { dir: "", title: "ПроБетон — бетон, бруківка Ковальська, ЗБВ і спецтехніка в Києві",
    desc: "Бетон В7,5–В35, тротуарна плитка Ковальська, ЗБВ і спецтехніка з доставкою по Києву та області.",
    parts: ["hero", "ticker", "stats", "partners", "beton", "cats", "bruk", "akcii", "perevagy", "flow", "faq", "kontakty"] },
  { dir: "beton/", crumb: "Бетон", title: "Бетон В7,5–В35 з доставкою по Києву — ПроБетон",
    desc: "Бетон усіх марок від В7,5 до В35: доставка міксером і подача бетононасосом по Києву та Київській області.",
    eyebrow: "Бетон", h1: "Бетон В7,5–В35 з доставкою",
    lead: "Сім марок — від стяжки до перекриття. Привеземо міксером у будь-яку точку Києва та області й подамо насосом.",
    parts: ["beton", "faq", "kontakty"] },
  { dir: "bruk/", crumb: "Тротуарна плитка та бруківка", title: "Тротуарна плитка та бруківка Ковальська — ПроБетон",
    desc: "Лайнстоун, Подвійна «Т», Старе місто, бордюри й лотки заводу Ковальська. Ціни з прайсу, доставка й укладання під ключ.",
    eyebrow: "Каталог", h1: "Тротуарна плитка та бруківка",
    lead: "Плитка, бордюри й лотки заводу Ковальська з доставкою на об'єкт. Ціни — з чинного прайсу ПроБетон.",
    parts: ["katalog", "bruk", "faq", "kontakty"] },
  { dir: "zbv/", crumb: "ЗБВ", title: "Залізобетонні вироби: кільця, плити, балки — ПроБетон",
    desc: "Бетонні кільця, плити перекриття й балки з доставкою краном-маніпулятором по Києву та області.",
    eyebrow: "ЗБВ", h1: "Залізобетонні вироби",
    lead: "Кільця, плити перекриття й балки — привеземо й подамо краном-маніпулятором на ваш об'єкт.",
    parts: ["zbv", "perevagy", "kontakty"] },
  { dir: "tekhnika/", crumb: "Спецтехніка", title: "Оренда спецтехніки в Києві — ПроБетон",
    desc: "Бетононасос, кран-маніпулятор, самоскид, екскаватор: подача техніки в будь-яку точку Києва та Київської області.",
    eyebrow: "Спецтехніка", h1: "Оренда спецтехніки",
    lead: "Оренда й подача техніки в будь-яку точку Києва та Київської області — від бетононасоса до екскаватора.",
    parts: ["tekhnika", "flow", "kontakty"] },
  { dir: "pro-nas/", crumb: "Про нас", title: "Про компанію ПроБетон",
    desc: "Починали з кількох міксерів і співпраці із заводом Ковальська. Свій автопарк, сертифікати якості, команда менеджерів.",
    eyebrow: "Про нас", h1: "Про компанію ПроБетон",
    lead: "Від кількох автобетонозмішувачів до свого автопарку й команди, яка веде замовлення від дзвінка до об'єкта.",
    parts: ["about", "stats", "partners", "perevagy", "flow", "kontakty"] },
  { dir: "kontakty/", crumb: "Контакти", title: "Контакти ПроБетон — телефони й адреса в Києві",
    desc: "Відділ продажу, телефони й офіс на вулиці Сім'ї Кульженків, 14, Київ. Telegram, Instagram, Facebook, TikTok.",
    eyebrow: "Контакти", h1: "Зв'яжіться з нами",
    lead: "Маєте питання щодо продукції, цін або доставки? Подзвоніть або залиште заявку — менеджер зв'яжеться протягом 5 хвилин.",
    parts: ["kontakty", "mapa"] },
];

const esc = t => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const ids = html => new Set([...html.matchAll(/\sid="([\w-]+)"/g)].map(m => m[1]));

function header(pre, cur) {
  return `<header class="top">
  <div class="in">
    <a class="logo" href="${pre || "./"}"><img src="${pre}img/logo.png" alt="ProBeton — на головну" width="80" height="48"></a>
    <nav aria-label="Розділи" id="mnav">
      ${NAV.map(([h, l]) => `<a href="${pre}${h}"${cur === h ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
    </nav>
    <div class="r">
      <a class="tel" href="tel:+380973151520">097 315 15 20</a>
      <a class="btn btn-or" href="#calc">Прорахувати</a>
    </div>
    <button class="burger" type="button" aria-label="Меню" aria-expanded="false" aria-controls="mnav"><svg class="b" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
</header>`;
}

function phead(p, pre) {
  return `<section class="phead">
  <div class="in">
    <nav class="crumbs" aria-label="Ви тут"><a href="${pre}">Головна</a><span aria-hidden="true">/</span><span aria-current="page">${p.crumb}</span></nav>
    <span class="eyebrow">${p.eyebrow}</span>
    <h1>${p.h1}</h1>
    <p class="lead">${p.lead}</p>
  </div>
</section>`;
}

function footer(pre) {
  return `<footer><div class="in"><span>© ПроБетон, Київ</span><nav class="fnav" aria-label="Сторінки сайту"><a href="${pre || "./"}">Головна</a>${NAV.map(([h, l]) => `<a href="${pre}${h}">${l}</a>`).join("")}</nav><span>Концепт редизайну, 2026</span></div></footer>`;
}

function fixLinks(html, pre, have) {
  return html.replace(/href="#([\w-]+)"/g, (m, id) => {
    if (have.has(id)) return m;
    if (PAGE_OF[id]) return `href="${pre}${PAGE_OF[id]}"`;
    if (id === "calc") return have.has("calc2") ? 'href="#calc2"' : 'href="#kontakty"';
    if (id === "calc2") return 'href="#kontakty"';
    if (id === "top") return `href="${pre || "./"}"`;
    return m;
  });
}

let n = 0;
for (const p of PAGES) {
  const pre = p.dir ? "../" : "";
  let parts = p.parts.map(k => S[k]);
  // перший розділ після шапки сторінки — з повним відступом зверху
  if (p.dir) parts[0] = parts[0].replace(' style="padding-top:0"', "");
  let main = (p.dir ? phead(p, pre) + "\n\n" : "") + parts.join("\n\n");
  let head = headSrc
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${p.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(p.desc)}">`);
  let html = `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>
${header(pre, p.dir)}

<main id="top">
${main}
</main>

${footer(pre)}

${tailSrc}
</body>
</html>
`;
  const have = ids(html);
  html = fixLinks(html, pre, have);
  if (pre) html = html.replace(/(["'(])img\//g, "$1../img/");
  const dst = path.join(OUT, p.dir, "index.html");
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, html);
  n++;
  console.log((p.dir || "/").padEnd(12), (html.length / 1024).toFixed(0) + " KB", p.parts.join(" · "));
}
console.log(n, "pages");
