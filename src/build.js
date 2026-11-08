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
["beton", "akcii", "bruk", "faq", "zbv", "tekhnika", "perevagy", "flow", "about", "kontakty", "katalog", "cats", "mapa", "dostavka"].forEach(id => S[id] = sec(id));
const tailSrc = s.slice(s.indexOf("<!-- Зворотний дзвінок"));

const NAV = [["beton/", "Бетон"], ["bruk/", "Бруківка"], ["zbv/", "ЗБВ"], ["tekhnika/", "Спецтехніка"], ["pro-nas/", "Про нас"], ["kontakty/", "Контакти"]];
const PAGE_OF = { beton: "beton/", bruk: "bruk/", katalog: "bruk/", zbv: "zbv/", tekhnika: "tekhnika/", about: "pro-nas/" };

// Адреса сайту для canonical, sitemap і розмітки. Під час переїзду на probeton.com.ua — змінити тут один рядок.
// З 09.11.2026 основна адреса — Vercel (там robots.txt, sitemap і llms.txt у корені домену). GitHub Pages лишається дзеркалом.
const SITE = "https://probeton-site-beta.vercel.app/";

// Заголовки (title) — до ~60 знаків, ключові слова спереду; описи — 140–160 знаків, з причиною подзвонити.
// Факти — лише ті, що вже є на сайті (марки, Ковальська, своя техніка, 5 хвилин, від 100 м² доставка безкоштовна).
const PAGES = [
  { dir: "", title: "Бетон з доставкою в Києві, бруківка Ковальська, ЗБВ — ПроБетон",
    desc: "Бетон В7,5–В35 з доставкою міксером і подачею насосом, тротуарна плитка Ковальська, ЗБВ і спецтехніка по Києву та області. Передзвонимо за 5 хвилин.",
    // три машини рознесені через два блоки: міксер (beton) → маніпулятор (dostavka) → навантажувач (tekhnika)
    parts: ["hero", "ticker", "stats", "partners", "beton", "cats", "bruk", "dostavka", "akcii", "perevagy", "tekhnika", "faq", "flow", "kontakty"] },
  { dir: "beton/", crumb: "Бетон", title: "Купити бетон В7,5–В35 у Києві з доставкою — ПроБетон",
    desc: "Бетон сімох марок, від В7,5 до В35: доставка міксером у будь-яку точку Києва й області, подача бетононасосом за паркан, на поверх, у котлован.",
    eyebrow: "Бетон", h1: "Бетон В7,5–В35 з&nbsp;доставкою по&nbsp;Києву",
    lead: "Сім марок — від стяжки до перекриття. Привеземо міксером у будь-яку точку Києва та області й подамо насосом.",
    parts: ["beton", "faq", "kontakty"] },
  { dir: "bruk/", crumb: "Тротуарна плитка та бруківка", title: "Тротуарна плитка Ковальська в Києві: ціни й доставка — ПроБетон",
    desc: "Лайнстоун, Подвійна «Т», Старе місто, бордюри й лотки заводу Ковальська з цінами з прайсу. Від 100 м² доставка безкоштовна, укладання під ключ.",
    eyebrow: "Каталог", h1: "Тротуарна плитка й&nbsp;бруківка Ковальська",
    lead: "Плитка, бордюри й лотки заводу Ковальська з доставкою на об'єкт. Ціни — з чинного прайсу ПроБетон.",
    parts: ["katalog", "bruk", "dostavka", "faq", "kontakty"] },
  { dir: "zbv/", crumb: "ЗБВ", title: "Бетонні кільця, плити перекриття, балки в Києві — ПроБетон",
    desc: "Залізобетонні вироби: бетонні кільця, плити перекриття й балки. Привеземо й вивантажимо краном-маніпулятором на ваш об'єкт у Києві та області.",
    eyebrow: "ЗБВ", h1: "Залізобетонні вироби: кільця, плити, балки",
    lead: "Кільця, плити перекриття й балки — привеземо й подамо краном-маніпулятором на ваш об'єкт.",
    parts: ["zbv", "perevagy", "kontakty"] },
  { dir: "tekhnika/", crumb: "Спецтехніка", title: "Оренда бетононасоса й спецтехніки в Києві — ПроБетон",
    desc: "Бетононасос, кран-маніпулятор, самоскид, екскаватор і гідромолот в оренду: свій автопарк, подача в будь-яку точку Києва та Київської області.",
    eyebrow: "Спецтехніка", h1: "Оренда спецтехніки в&nbsp;Києві та&nbsp;області",
    lead: "Оренда й подача техніки в будь-яку точку Києва та Київської області — від бетононасоса до екскаватора.",
    parts: ["tekhnika", "flow", "kontakty"] },
  { dir: "pro-nas/", crumb: "Про нас", title: "Про компанію ПроБетон — бетон і бруківка в Києві",
    desc: "Починали з кількох міксерів і співпраці із заводом Ковальська. Тепер — свій автопарк спецтехніки, сертифікати якості й команда, що веде замовлення.",
    eyebrow: "Про нас", h1: "Про компанію ПроБетон",
    lead: "Від кількох автобетонозмішувачів до свого автопарку й команди, яка веде замовлення від дзвінка до об'єкта.",
    parts: ["about", "stats", "partners", "perevagy", "flow", "kontakty"] },
  { dir: "kontakty/", crumb: "Контакти", title: "Контакти ПроБетон — телефони й адреса в Києві",
    desc: "Відділ продажу: +380 97 315 15 20, +380 93 250 40 41. Офіс — вулиця Сім'ї Кульженків, 14, Київ. Telegram, Instagram, Facebook, TikTok.",
    eyebrow: "Контакти", h1: "Контакти ПроБетон у&nbsp;Києві",
    lead: "Маєте питання щодо продукції, цін або доставки? Подзвоніть або залиште заявку — менеджер зв'яжеться протягом 5 хвилин.",
    parts: ["kontakty", "mapa"] },
];

const esc = t => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const plain = t => t.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&mdash;/g, "—").replace(/\s+/g, " ").trim();

// ---- Розмітка для Google і нейромереж (schema.org) ----
const ORG = {
  "@type": "HomeAndConstructionBusiness", "@id": SITE + "#org",
  name: "ПроБетон", alternateName: ["ProBeton", "Про Бетон"], url: SITE, logo: SITE + "img/logo.png", image: SITE + "img/og.jpg",
  description: "Бетон В7,5–В35 з доставкою міксером і подачею бетононасосом, тротуарна плитка й бордюри заводу Ковальська, залізобетонні вироби та оренда спецтехніки в Києві й Київській області.",
  telephone: "+380973151520", email: "probeton.com.ua@gmail.com",
  address: { "@type": "PostalAddress", streetAddress: "вулиця Сім'ї Кульженків, 14", addressLocality: "Київ", addressCountry: "UA" },
  areaServed: [{ "@type": "City", name: "Київ" }, { "@type": "AdministrativeArea", name: "Київська область" }],
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", telephone: ["+380973151520", "+380932504041", "+380733151520"], availableLanguage: "uk" }],
  sameAs: ["https://t.me/Probeton0973151520", "https://www.instagram.com/pro_beton_kyiv/", "https://www.tiktok.com/@pro_beton_kyiv", "https://www.facebook.com/ProBeton.Kiev"],
  knowsAbout: ["бетон", "товарний бетон", "тротуарна плитка", "бруківка", "бордюри", "бетонні кільця", "плити перекриття", "бетононасос", "кран-маніпулятор"],
  makesOffer: [
    ["Бетон В7,5–В35 з доставкою", "beton/"], ["Тротуарна плитка й бордюри Ковальська", "bruk/"],
    ["Залізобетонні вироби: кільця, плити перекриття, балки", "zbv/"], ["Оренда спецтехніки: бетононасос, кран-маніпулятор, самоскид, екскаватор", "tekhnika/"],
    ["Укладання тротуарної плитки під ключ", "bruk/"],
  ].map(([n, u]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n, url: SITE + u }, areaServed: "Київ і Київська область" })),
};
function faqLd(html) {
  const qa = [...html.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)];
  if (!qa.length) return null;
  return { "@type": "FAQPage", mainEntity: qa.map(m => ({ "@type": "Question", name: plain(m[1]), acceptedAnswer: { "@type": "Answer", text: plain(m[2]) } })) };
}
function seoHead(p, mainHtml) {
  const url = SITE + p.dir;
  const graph = [ORG, { "@type": "WebPage", "@id": url + "#page", url, name: p.title, description: p.desc, inLanguage: "uk", isPartOf: { "@id": SITE + "#site" }, about: { "@id": SITE + "#org" } }];
  if (!p.dir) graph.push({ "@type": "WebSite", "@id": SITE + "#site", url: SITE, name: "ПроБетон", inLanguage: "uk", publisher: { "@id": SITE + "#org" } });
  else graph.push({ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Головна", item: SITE }, { "@type": "ListItem", position: 2, name: p.crumb, item: url }] });
  const faq = faqLd(mainHtml); if (faq) graph.push(faq);
  return `<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#141517">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ПроБетон">
<meta property="og:locale" content="uk_UA">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:image" content="${SITE}img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="img/logo.png">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
`;
}
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
  // два блоки з фото поспіль виглядають важко: контакти після «Як ми працюємо» — на суцільному тлі
  p.parts.forEach((k, i) => { if (k === "kontakty" && p.parts[i - 1] === "flow") parts[i] = parts[i].replace('class="band dark lzbg" id="kontakty"', 'class="band dark plain" id="kontakty"'); });
  // світлий блок одразу після темного не може «прилипати» до нього: повертаємо верхній відступ
  p.parts.forEach((k, i) => { if (i && /class="band (dark|photo)/.test(parts[i - 1])) parts[i] = parts[i].replace(' style="padding-top:0"', ""); });
  // перший розділ після шапки сторінки — з повним відступом зверху
  if (p.dir) parts[0] = parts[0].replace(' style="padding-top:0"', "");
  let main = (p.dir ? phead(p, pre) + "\n\n" : "") + parts.join("\n\n");
  const preload = p.dir ? "" : `<link rel="preload" as="image" href="img/fon-heroi-3.webp" fetchpriority="high">\n`;
  let head = preload + seoHead(p, main) + `<script>if("IntersectionObserver"in window)document.documentElement.classList.add("lzb")</script>\n` + headSrc
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

// ---- карта сайту, robots і llms.txt (коротка довідка для ChatGPT, Gemini, Perplexity, Claude) ----
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(p => `  <url><loc>${SITE}${p.dir}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `# Пошуковики й ІІ-асистенти — ласкаво просимо
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${SITE}sitemap.xml
`);
const faqAll = faqLd(S.faq).mainEntity.map(q => `- **${q.name}** ${q.acceptedAnswer.text}`).join("\n");
fs.writeFileSync(path.join(OUT, "llms.txt"), `# ПроБетон

> ${ORG.description} Дилер заводу Ковальська. Свій автопарк: міксери, бетононасос, кран-маніпулятор, самоскид. Менеджер передзвонює протягом 5 хвилин після заявки.

## Контакти
- Телефони відділу продажу: +380 97 315 15 20, +380 93 250 40 41, +380 73 315 15 20
- Офіс: вулиця Сім'ї Кульженків, 14, Київ
- Пошта: probeton.com.ua@gmail.com
- Telegram: https://t.me/Probeton0973151520
- Працюємо по Києву та Київській області

## Сторінки
${PAGES.map(p => `- [${plain(p.h1 || "Головна")}](${SITE}${p.dir}): ${p.desc}`).join("\n")}

## Що варто знати
- Бетон: марки В7,5, В10, В15, В20, В25, В30, В35. Доставка міксером у будь-яку точку Києва й області, подача бетононасосом туди, куди міксер не під'їде.
- Тротуарна плитка й бордюри заводу Ковальська: Лайнстоун, Подвійна «Т», Старе місто, бруківка, бордюри, лотки. Від 100 м² плитки доставка безкоштовна.
- Укладання плитки під ключ: від продажу й доставки до готової бруківки.
- На всю продукцію є сертифікати якості.
- Точну ціну з доставкою для конкретної адреси називає менеджер.

## Часті питання
${faqAll}
`);
console.log("sitemap.xml · robots.txt · llms.txt");
