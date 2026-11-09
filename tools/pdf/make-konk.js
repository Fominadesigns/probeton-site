// Презентація «Аналіз конкурентів» для ПроБетону: A4 горизонтально, той самий стиль, що й презентація сайту.
// Мета: корисний клієнту звіт про ринок, який підводить до запуску нового сайту.
// Дані — з перевірки 09.11.2026 (видача Google, сайти конкурентів, PageSpeed). Нічого не вигадувати.
const puppeteer = require("puppeteer-core");
const fs = require("fs"), path = require("path");
const OUT_PDF = process.env.OUT_PDF || "C:/Users/Acer/Desktop/projects/probeton-site/probeton-analiz-konkurentiv.pdf";
const OUT_HTML = path.join(__dirname, "konk.html");
const ROOT = "C:/Users/Acer/Desktop/projects/probeton-site";
const SH = f => "file:///" + path.join(__dirname, "shots", f).split(path.sep).join("/");
const LOGO = ROOT + "/img/logo.png";

const NB = "\u00a0";
const short = "і|й|а|в|у|з|о|та|на|до|за|по|від|під|над|для|про|при|без|із|зі|що|як|не|ні|чи|це|або|але|ми|є|їх|вас|вам";
const re1 = new RegExp("(^|[\\s(«\u00a0])(" + short + ") ", "giu");
const esc = t => { for (let k = 0; k < 3; k++) t = t.replace(re1, (m, a, b) => a + b + NB); return t.replace(/ ([—–→])/g, NB + "$1").replace(/(\d) (?=[^\d\s—–·<])/g, "$1" + NB); };

const foot = n => `<footer><span>ПроБетон · аналіз конкурентів · 09.11.2026</span><span>${String(n).padStart(2, "0")}</span></footer>`;
const head = (lbl, t, sub) => `<header><p class="lbl">${lbl}</p><h2>${esc(t)}</h2>${sub ? `<p class="sub">${esc(sub)}</p>` : ""}</header>`;
const S = [];
let n = 0;
const page = (cls, body) => { n++; S.push(`<section class="pg ${cls}">${cls.includes("cover") ? "" : '<div class="bar"></div>'}${body}${cls.includes("cover") ? "" : foot(n)}</section>`); };

// 1. Обкладинка
page("cover", `<div class="cl">
  <div class="lg"><img src="file:///${LOGO}"></div>
  <p class="meta">АНАЛІЗ КОНКУРЕНТІВ · КИЇВ І ОБЛАСТЬ · ЛИСТОПАД 2026</p>
  <h1>Хто забирає <em><span>ваших клієнтів</span></em></h1>
  <p class="cp">${esc("Видача Google за вашими запитами, 12 сайтів конкурентів, ціни на бетон, плитку Ковальська, ЗБВ і техніку. І що з цього може взяти ПроБетон.")}</p>
  <div class="cm"><p class="meta">БЕТОН · БРУКІВКА · ЗБВ · СПЕЦТЕХНІКА</p><p class="meta mut">ДАНІ ПЕРЕВІРЕНО 9 ЛИСТОПАДА 2026</p></div>
</div><div class="cr"></div>`);

// 2. Головне
const key = [
  ["0 з 6", "Google вас майже не бачить", "За «бетон Київ», «плитка Ковальська Київ», «плити перекриття», «оренда бетононасоса» сайту немає навіть у перших 40 результатах. За назвою «ProBeton» першою виходить фарба для підлог.", "hot"],
  ["№ 2", "Ваш завод — ваш конкурент", "Магазин Ковальської стоїть другим за «бетон Київ» і займає п'ять перших місць за «плиткою Ковальська». Дилерові треба продавати те, чого завод не дає.", ""],
  ["−17%", "Ваша плитка дешевша за завод", "Старе місто 40 сірий: 612 ₴ у вас проти 739 ₴ у магазині заводу. Подвійна «Т» 80: 855 проти 1 095 ₴. Зараз цього ніде не сказано.", ""],
  ["1 з 12", "Ринок застарів — це шанс", "Сучасно себе подає лише один конкурент. Решта — шаблони, ціни 2021–2022 років, частина сайтів російською. Сильний сайт тут виділяється одразу.", ""],
];
page("", `${head("Коротко", "Чотири головні висновки", "Усе, що далі в презентації, розгортає ці чотири пункти")}
<div class="key4">${key.map(k => `<div class="${k[3]}"><b class="kn">${k[0]}</b><h3>${esc(k[1])}</h3><p>${esc(k[2])}</p></div>`).join("")}</div>`);

// 3. Карта ринку
const groups = [
  ["Виробники", "Свої заводи й лабораторії, великі обсяги, тиснуть цифрами довіри.", [["Гранд Бетон", "Гореничі · 6 майданчиків · 18 років"], ["Бетон Київщини", "Буча · 85+ машин · відкритий прайс"], ["Стромат", "7 заводів · з 2009 року"], ["Ковальська", "сам завод · shop.kovalska.com"]]],
  ["Магазини-перепродавці", "Великі каталоги «від фундаменту до даху», часто продають ту саму Ковальську.", [["Kievstroy", "бетон, ЗБВ, плитка"], ["ЕкоБетон Плюс", "бетон Ковальської, ЗБВ"], ["PL2T", "бетон, плитка «Авеню», укладання"], ["Бетон-компані", "бетон Ковальської, насоси"]]],
  ["Оренда техніки", "Тільки насоси й крани. Конкурують за окремі замовлення техніки.", [["РТС Плюс", "найпрозоріший прайс на насоси"], ["Трест Буд", "насоси, приїзд за 2 години"], ["ВК Сервіс", "насоси й бетон"], ["ДіПі Транс", "насоси, маніпулятори"]]],
];
page("", `${head("Карта ринку", "Три типи конкурентів", "Розібрали сайти, що стоять у топ-10 Google за вашими запитами")}
<div class="g3">${groups.map((g, i) => `<div class="grp g${i}"><p class="lbl">${g[0]}</p><p class="gd">${esc(g[1])}</p>${g[2].map(c => `<div class="co"><b>${c[0]}</b><span>${esc(c[1])}</span></div>`).join("")}</div>`).join("")}</div>
<div class="callout">${esc("ПроБетон — єдиний, хто поєднує все: бетон, плитку Ковальська, ЗБВ, свою техніку й укладання. Найближчий за набором — PL2T, але це велика будбаза, а не компанія зі своїм автопарком і бригадою.")}</div>`);

// 4. Видача Google
const serp = [
  ["бетон Київ", ["grandbeton.com.ua", "shop.kovalska.com", "betonkiev.com", "kievstroy.org", "prombudcentr.ua", "pl2t.com", "s-beton.com.ua", "vkservice.com.ua"]],
  ["тротуарна плитка Ковальська Київ", ["shop.kovalska.com", "shop.kovalska.com", "zavod-brukivky.kyiv.ua", "shop.kovalska.com", "shop.kovalska.com", "zavodfem.com.ua", "okplytka.com.ua", "kanyon.com.ua"]],
  ["плити перекриття купити Київ", ["kievstroy.org", "uabeton.com.ua", "shop.kovalska.com", "olx.ua", "beton-company.com.ua", "t-b-k.com.ua", "bkstromat.com.ua", "rtsplus.com.ua"]],
  ["оренда бетононасоса Київ", ["vkservice.com.ua", "olx.ua", "grandbeton.com.ua", "arenda-betononasos.com.ua", "kievstroy.org", "dptrans.com.ua", "pl2t.com", "royalbud.com.ua"]],
];
page("", `${head("Google · Україна · 9 листопада 2026", "Клієнт шукає вас — і знаходить їх", "Перші 8 результатів за запитами, з якими до вас приходять покупці")}
<div class="serp">${serp.map(q => `<div class="q"><p class="qq">«${q[0]}»</p><ol>${q[1].map(d => `<li${/kovalska/.test(d) ? ' class="kv"' : ""}>${d}</li>`).join("")}</ol><p class="miss">probeton.com.ua — немає в топ-40</p></div>`).join("")}</div>
<div class="note2"><span><i class="sw kv"></i>${esc("магазин заводу Ковальська")}</span><span>${esc("Реклами Google за цими запитами не було — платне місце над видачею зараз вільне. OLX є в топі майже скрізь: частину покупців досі переконують оголошення, а не сайти.")}</span></div>`);

// 5. Нинішній сайт
const now = [
  ["Три сторінки на весь бізнес", "Головна, «Послуги» й «Продукція». Окремої сторінки під бетон, ЗБВ чи техніку немає — Google нема що показати за «бетон Київ» чи «оренда бетононасоса»."],
  ["Заголовки — номери телефонів", "Підзаголовки сторінки — це два телефони, а на «Послугах» і «Продукції» головного заголовка немає зовсім. Пошуковик не розуміє, про що сторінка."],
  ["Назва без міста й послуги", "«ПроБетон тротуарна плитка, бетон, ціни зі знижками» — без «Київ», «доставка», «ЗБВ», «спецтехніка». Саме за цими словами шукають."],
  ["Перший екран — форма", "Гість бачить три поля «Прорахуємо бетон і бруківку». Не видно, що ви дилер Ковальської, маєте свою техніку й возите по області."],
  ["Ціни без одиниць", "«Лайнстоун 20 — ₴813UAH»: за м², штуку чи піддон? Людина не розуміє суму й іде порівнювати."],
  ["Немає доказів", "Написано «100 тис. м² плитки», але немає жодного фото об'єкта, техніки чи відгуку."],
];
page("", `${head("Нинішній сайт · probeton.com.ua", "Чому Google вас не показує", "Технічно сайт швидкий — 98 балів PageSpeed. Проблема в іншому: йому нема чим відповісти на запит покупця")}
<div class="nowg"><div class="oldshot"><img src="${SH("old-hero.jpg")}"><p class="cap">${esc("probeton.com.ua, перший екран, 9.11.2026")}</p></div>
<div class="iss">${now.map((x, i) => `<div><i>${String(i + 1).padStart(2, "0")}</i><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div>`).join("")}</div></div>`);

// 6. Що роблять сильні конкуренти
const strong = [
  ["Гранд Бетон", "Цифри довіри на першому екрані", "18 років, 6 майданчиків, 800 тис. м³ на рік, 12 тис. клієнтів, власна лабораторія. Таблиця доставки на 1–80 км, прозорий прайс насоса: мінімум і кожна наступна година."],
  ["Бетон Київщини", "Повний прайс відкрито", "Ціна кожної марки з розбивкою за рухливістю Р1–Р5 і PDF-прайс із датою. Покупець порівнює, не дзвонячи."],
  ["РТС Плюс", "Живий менеджер на кожен напрям", "Ім'я й телефон відповідального біля кожної послуги, Viber, WhatsApp і Telegram. Вимоги до майданчика для насоса — щоб не було сюрпризів на об'єкті."],
  ["Стромат", "Месенджери й розстрочка", "Кнопки Viber і Telegram, позначка «в наявності», розстрочка на 4 місяці й кредит на рік."],
  ["Kievstroy", "Характеристики для прораба", "У картці плити — вага, клас бетону й скільки штук влазить у фуру на 20 т. Купити в один клік."],
];
page("", `${head("Що варто перейняти", "Що в конкурентів зроблено добре", "Кожен робить добре щось одне. Новий сайт ПроБетону збирає найкраще разом")}
<div class="st5">${strong.map(s => `<div><p class="lbl">${s[0]}</p><b>${esc(s[1])}</b><p>${esc(s[2])}</p></div>`).join("")}
<div class="hot"><p class="lbl">Слабкі місця всіх</p><b>${esc("Шаблони, старі ціни, жодної повної суми")}</b><p>${esc("Половина сайтів має прайси 2021–2022 років або «ціна за запитом». Ніхто не рахує суму з доставкою. Фото своєї техніки й відгуки — майже ні в кого.")}</p></div></div>`);

// 7. Ціни: бетон і насос
const b25 = [["ЕкоБетон Плюс", "магазин", "4 539", "—"], ["PL2T", "магазин", "4 970", "5 290"], ["Бетон Київщини", "завод", "5 000", "5 310"], ["Kievstroy", "магазин", "5 455", "5 802"], ["Гранд Бетон", "завод", "—", "6 035"]];
const pump = [["РТС Плюс", "16–24 м", "7 000 / 2 год", "2 300", "20 800"], ["Гранд Бетон", "20 м", "11 000 / 2 год", "3 500", "—"], ["Трест Буд", "16–24 м", "від 11 000", "—", "—"], ["Kievstroy", "—", "від 11 990", "—", "—"], ["ВК Сервіс", "16 м", "12 000", "—", "—"]];
page("", `${head("Ціни ринку · бетон і насос", "Скільки беруть конкуренти", "Ціни з сайтів 9.11.2026, гривні. Доставку майже всі рахують окремо за кілометри, мінімум 7 м³")}
<div class="t2"><div><p class="lbl">Бетон В25 (М350) за м³, без доставки</p><table><tr><th>Компанія</th><th>Тип</th><th class="n">Р3</th><th class="n">Р4</th></tr>${b25.map(r => `<tr><td>${r[0]}</td><td class="mut">${r[1]}</td><td class="n">${r[2].replace(" ", NB)}</td><td class="n">${r[3].replace(" ", NB)}</td></tr>`).join("")}</table>
<p class="tn2">${esc("В25 Р4 — від 5 290 до 6 035 ₴. Застарілий прайс ВК Сервіс (3 189 ₴, сайт не оновлювався з 2021) і «ціну за запитом» S-Beton не враховано.")}</p>
<div class="big"><b>4,5–5,5</b><span>${esc("тис. ₴ за м³ — ринок В25 Р3 у Києві зараз")}</span></div></div>
<div><p class="lbl">Автобетононасос</p><table><tr><th>Компанія</th><th>Стріла</th><th class="n">Мінімум</th><th class="n">Далі / год</th><th class="n">Зміна</th></tr>${pump.map(r => `<tr><td>${r[0]}</td><td class="mut">${r[1].replace(" ", NB)}</td><td class="n">${r[2].replace(/ /g, NB)}</td><td class="n">${r[3].replace(" ", NB)}</td><td class="n">${r[4].replace(" ", NB)}</td></tr>`).join("")}</table>
<p class="tn2">${esc("Найзрозуміліше показує РТС Плюс: мінімум, кожна наступна година й зміна. Решта пишуть «від» або «уточнити ціну».")}</p>
<div class="big alt"><b>0</b><span>${esc("конкурентів рахують на сайті повну суму «бетон + доставка + насос» за адресою")}</span></div></div></div>`);

// 8. Плитка
const tile = [["ПроБетон", "612", "від 813", "855", "348 (вишня)", 1], ["Магазин заводу Ковальська", "739", "990", "1 095", "318 сірий · 423 колір", 0], ["omo.ua", "702", "990", "1 095–1 443", "—", 0], ["Alex Group", "—", "940", "—", "—", 0], ["АКБР", "628", "—", "944 без фаски", "—", 0], ["Megabruk", "630", "—", "—", "—", 0], ["Fempro", "—", "793 (h60)", "—", "—", 0], ["Завод Бруківки", "534–675", "772", "854", "—", 0], ["P-bud", "—", "743", "—", "—", 0]];
page("", `${head("Ціни ринку · бруківка Ковальська", "Ваша плитка дешевша, ніж у заводу", "Та сама плитка в різних продавців, ₴ за м² (бордюр — за штуку). Ціни з карток у Google, 9.11.2026")}
<div class="tl"><table class="tt"><tr><th>Продавець</th><th class="n">Старе місто 40 сірий</th><th class="n">Лайнстоун 20</th><th class="n">Подвійна «Т» 80 сірий</th><th class="n">Бордюр парковий</th></tr>${tile.map(r => `<tr${r[5] ? ' class="us"' : ""}><td>${r[0]}</td>${r.slice(1, 5).map(v => `<td class="n">${v.replace(/ /g, NB)}</td>`).join("")}</tr>`).join("")}</table>
<div class="side"><div class="big"><b>−17…22%</b><span>${esc("ПроБетон проти магазину самого заводу на ту саму плитку")}</span></div>
<p>${esc("Дешевше за вас — лише кілька дилерів, на 5–15%. Вони продають і інші бренди, а своєї техніки й укладання не показують.")}</p>
<p class="warn">${esc("Треба підтвердити: ціни у вашому прайсі — за м²? На нинішньому сайті одиниць немає.")}</p></div></div>`);

// 9. ЗБВ і укладання
const zbv = [["Стромат", "7 227", "700", "не пропонують"], ["Kievstroy", "7 392", "2 432", "маніпулятор +700–1 000 ₴"], ["ЕкоБетон Плюс", "8 502", "1 688", "не вказано"]];
const lay = [["Завод Бруківки", "від 200", "«під ключ»"], ["Apex-bud", "250", "плитка 60–80 мм"], ["Coliseum", "300–400", "пішохідна зона / заїзд"], ["PL2T", "400", "на готову основу, основа ще 250"]];
page("", `${head("Ціни ринку · ЗБВ і укладання", "Один товар — три різні ціни", "Покупець бачить розкид і не довіряє нікому. Свіжий прайс із датою вже вирізняє сайт")}
<div class="t2"><div><p class="lbl">ЗБВ, ₴ за штуку</p><table><tr><th>Компанія</th><th class="n">ПК 60-12-8</th><th class="n">КС 10-9</th><th>Розвантаження краном</th></tr>${zbv.map(r => `<tr><td>${r[0]}</td><td class="n">${r[1].replace(" ", NB)}</td><td class="n">${r[2].replace(" ", NB)}</td><td class="mut">${esc(r[3])}</td></tr>`).join("")}</table>
<p class="tnote">${esc("Плита одного заводу — від 7,2 до 8,5 тис. ₴, кільце — від 700 до 2 432 ₴. Продати плиту разом із розвантаженням своїм краном пропонує лише один магазин.")}</p></div>
<div><p class="lbl">Укладання бруківки, ₴ за м²</p><table><tr><th>Компанія</th><th class="n">Ціна</th><th>Що входить</th></tr>${lay.map(r => `<tr><td>${r[0]}</td><td class="n">${r[1].replace(" ", NB)}</td><td class="mut">${esc(r[2])}</td></tr>`).join("")}</table>
<p class="tnote">${esc("Пакета «плитка + доставка + укладання = сума за м²» немає ні в кого. У ПроБетону все це своє — залишилось показати ціну.")}</p></div></div>`);

// 10. Прогалини → новий сайт
const gaps = [
  ["Повна сума за адресою", "Скрізь «від 45 ₴/км» і «уточнюйте в менеджера».", "Калькулятор бетону й площі плитки вже на сайті. Після брифу покаже суму з доставкою й насосом.", "◐"],
  ["Усе в одному замовленні", "Завод продає товар, магазини — каталог, орендарі — техніку.", "Бетон, бруківка, ЗБВ і техніка — окремі сторінки й одна заявка. Головна відмінність на першому екрані.", "✓"],
  ["Ціни видно одразу", "Половина — прайси 2021–2022 або «за запитом».", "Ціни з прайсу на картках, в акціях і калькуляторі, з одиницями. Каталог з фільтрами.", "✓"],
  ["Побачити плитку до покупки", "Ніхто не показує, як колір ляже у дворі.", "Візуалізатор двору: обираєш колір і модель — бачиш свій двір.", "✓"],
  ["Знайтися в Google і нейромережах", "Шаблонні тексти, заголовки «для робота».", "Сім сторінок під запити, розмітка для Google, файл для ChatGPT і Gemini. SEO 100 з 100.", "✓"],
  ["Докази й швидкий зв'язок", "Фото техніки й відгуки — майже ні в кого.", "Блоки під об'єкти, техніку й команду, дзвінок у зручний час. Фото й месенджери — після брифу.", "◐"],
];
page("", `${head("Як забрати клієнтів", "Шість прогалин ринку — і як їх закриває новий сайт", "")}
<table class="gt"><tr><th>Чого бракує ринку</th><th>Як у конкурентів</th><th>Новий сайт ПроБетону</th><th></th></tr>${gaps.map(g => `<tr><td><b>${esc(g[0])}</b></td><td class="mut">${esc(g[1])}</td><td>${esc(g[2])}</td><td class="mk ${g[3] === "✓" ? "ok" : "half"}">${g[3]}</td></tr>`).join("")}</table>
<p class="legend"><span class="mk ok">✓</span> вже зроблено <span class="mk half">◐</span> ${esc("готово, чекає ваших цін, фото й контактів")}</p>`);

// 11. Новий сайт — знімки
page("", `${head("Новий сайт · probeton-site-beta.vercel.app", "Що побачить ваш клієнт", "Демоверсія вже працює — з вашими цінами, плиткою Ковальська й фото з нинішнього сайту")}
<div class="shots3"><figure><img src="${SH("hero.jpg")}"><figcaption>${esc("Перший екран: що продаєте, дилер Ковальської, своя техніка")}</figcaption></figure>
<figure><img src="${SH("katalog.jpg")}"><figcaption>${esc("Каталог з фільтрами й цінами з прайсу")}</figcaption></figure>
<figure class="ph"><img src="${SH("m-dvir.jpg")}"><figcaption>${esc("Візуалізатор двору на телефоні")}</figcaption></figure></div>`);

// 12. Порівняння
const cols = ["Гранд Бетон", "Бетон Київщини", "Kievstroy", "PL2T", "Нинішній probeton", "Новий сайт"];
const rows = [
  ["Ціни відкрито на сайті", ["✓", "✓", "✓", "✓", "◐", "✓"]],
  ["Окремі сторінки під кожну послугу", ["✓", "✓", "✓", "✓", "—", "✓"]],
  ["Калькулятор на сайті", ["✓", "—", "◐", "—", "—", "✓"]],
  ["Бетон + плитка + ЗБВ + своя техніка", ["◐", "—", "◐", "◐", "✓", "✓"]],
  ["Візуалізатор кольору плитки", ["—", "—", "—", "—", "—", "✓"]],
  ["Укладання плитки під ключ", ["—", "—", "—", "✓", "✓", "✓"]],
  ["Українська мова, сучасний дизайн", ["✓", "◐", "◐", "◐", "◐", "✓"]],
];
page("", `${head("Порівняння", "Новий сайт проти сильних конкурентів", "За тим, що видно на сайтах 9.11.2026")}
<table class="cmp"><tr><th></th>${cols.map((c, i) => `<th class="${i === 5 ? "us" : i === 4 ? "old" : ""}">${c}</th>`).join("")}</tr>${rows.map(r => `<tr><td>${esc(r[0])}</td>${r[1].map((v, i) => `<td class="c ${v === "✓" ? "ok" : v === "◐" ? "half" : "no"}${i === 5 ? " us" : ""}">${v}</td>`).join("")}</tr>`).join("")}</table>
<p class="legend"><span class="mk ok">✓</span> є <span class="mk half">◐</span> частково <span class="mk no">—</span> ${esc("не знайшли на сайті")}</p>`);

// 13. Пропозиція й кроки
page("dk", `${head("Що далі", "План: від сайту до заявок", "Сайт уже зібраний — після брифу наповнюємо його вашими даними й запускаємо на probeton.com.ua")}
<div class="price"><div class="price3">
  <div><h3>Сайт + фірмовий стиль</h3><p>${esc("Сім сторінок під пошук, каталог з фільтрами, калькулятор, візуалізатор двору, мобільна версія, перенесення домену.")}</p><div class="v">400 $<small>7 ДНІВ ПІСЛЯ БРИФУ</small></div></div>
  <div class="bonus"><h3>Підтримка</h3><p>${esc("Оновлення цін і акцій, нові об'єкти, аналітика заявок щомісяця.")}</p><div class="v">0 $<small>БОНУС ВІД НАС</small></div></div>
  <div><h3>Далі — реклама</h3><p>${esc("Google за вузькими запитами, де зараз немає жодного оголошення. Таргет в Instagram і Facebook.")}</p><div class="v sm">Обговоримо<small>ОКРЕМО</small></div></div>
</div><div class="pr"><p class="lbl">Чотири кроки після запуску</p><div class="steps4">
  <div><i>01</i><b>Домен</b><span>${esc("Новий сайт на probeton.com.ua, старі адреси перенаправлені — позиції не губляться")}</span></div>
  <div><i>02</i><b>Google</b><span>${esc("Search Console і картка в Google Картах з фото техніки та відгуками")}</span></div>
  <div><i>03</i><b>Ціни</b><span>${esc("Бетон по марках, доставка, насос, ЗБВ — калькулятор показує повну суму")}</span></div>
  <div><i>04</i><b>Реклама</b><span>${esc("«бетон з насосом Київ», «плитка Ковальська з укладанням», «плити з розвантаженням»")}</span></div>
</div><div class="need"><span>${esc("Ціни з одиницями виміру (м², шт, м³)")}</span><span>${esc("Тарифи доставки, насоса й маніпулятора")}</span><span>${esc("Фото 10–20 ваших об'єктів і техніки")}</span><span>${esc("Viber і Telegram для заявок")}</span></div></div></div>`);

// 14. Джерела
page("", `${head("Як збирали дані", "Методика й обмеження", "")}
<div class="meth">${[
  ["Видача Google", "Перевірена 9.11.2026 з налаштуваннями «Україна, українська мова», перші 40 результатів. У кожного користувача видача трохи інша — залежно від місця й історії пошуку."],
  ["Сайти конкурентів", "12 сайтів відкрито й прочитано вручну того ж дня: grandbeton.com.ua, betonkiev.com, kievstroy.org, vkservice.com.ua, s-beton.com.ua, pl2t.com, uabeton.com.ua, beton-company.com.ua, bkstromat.com.ua, rtsplus.com.ua, arenda-betononasos.com.ua, dptrans.com.ua."],
  ["Ціни на плитку", "З карток товарів у видачі Google. Магазин Ковальської й t-b-k.com.ua не відкриваються для автоматичної перевірки. Підозріло низькі ціни (357–507 ₴), схожі на застарілі, не враховано."],
  ["Нинішній сайт", "probeton.com.ua перевірено 9.11.2026: сторінки, заголовки, назва для Google. PageSpeed Insights: 98 на телефоні, SEO 100 — швидкість не проблема."],
  ["Застарілі ціни", "Прайси ВК Сервіс (2021) і Бетон-компані (2022) у порівняння не включено."],
  ["Ціни з ПДВ чи без", "Як на кожному сайті. Ціни ПроБетону — з нинішнього сайту, одиниці виміру треба підтвердити."],
].map(m => `<div><b>${esc(m[0])}</b><p>${esc(m[1])}</p></div>`).join("")}</div>`);

const css = `
@page{size:297mm 210mm;margin:0}
*{box-sizing:border-box;margin:0}
body{font-family:Onest,sans-serif;color:#141517;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:297mm;height:210mm;padding:10mm 12mm 13mm;display:flex;flex-direction:column;gap:6mm;background:#F4F4F1;position:relative;overflow:hidden;page-break-after:always}
.pg.dk{background:#141517;color:#F4F4F1}
.bar{position:absolute;left:0;top:0;width:100%;height:2.6mm;background:repeating-linear-gradient(-45deg,#F46322 0 3mm,#141517 3mm 6mm)}
header{display:grid;gap:1.6mm}
header h2{font:400 24pt/1.05 'Dela Gothic One',sans-serif;letter-spacing:-.02em}
header .sub{font-size:11pt;color:#61656A;max-width:230mm}
.dk header .sub{color:#9EA2A7}
.lbl{font:700 8pt/1.2 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#067A87}
.dk .lbl{color:#3DB7C2}
footer{position:absolute;left:12mm;right:12mm;bottom:4mm;display:flex;justify-content:space-between;font:500 7.5pt/1 'JetBrains Mono',monospace;color:#8F949A}
.mut{color:#61656A}
/* обкладинка */
.cover{display:grid;grid-template-columns:140mm 1fr;padding:0;gap:0;background:#141517;color:#F4F4F1}
.cl{padding:14mm 12mm 12mm 14mm;display:flex;flex-direction:column;gap:7mm}
.cl .lg{align-self:flex-start;background:#F4F4F1;padding:3mm 5mm}.cl .lg img{height:12mm;display:block}
.cover h1{font:400 38pt/1.04 'Dela Gothic One',sans-serif;letter-spacing:-.02em;margin-top:auto}
.cover h1 em{font-style:normal;background:#F46322;padding:0 2mm;display:inline-block;transform:skewX(-10deg);margin-top:2mm}.cover h1 em span{display:inline-block;transform:skewX(10deg)}
.cp{font-size:12.5pt;line-height:1.5;color:#B9BDC2}
.cm{display:grid;gap:2mm}
.meta{font:700 8.5pt/1.5 'JetBrains Mono',monospace;letter-spacing:.08em;color:#3DB7C2}.meta.mut{color:#8F949A}
.cr{background:url(file:///${ROOT}/img/fon-heroi-3.webp) 42% center/cover;border-left:2.6mm solid #F46322}
/* головне */
.key4{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;min-height:0}
.key4 > div{background:#fff;border-top:1.4mm solid #067A87;padding:7mm 6mm;display:flex;flex-direction:column;gap:4mm}
.key4 > div.hot{background:#F46322;border-top-color:#141517}
.kn{font:400 34pt/1 'Dela Gothic One',sans-serif;color:#F46322}
.key4 .hot .kn{color:#141517}
.key4 h3{font:400 17pt/1.15 'Dela Gothic One',sans-serif}
.key4 p{font-size:13.5pt;line-height:1.5;color:#33363A}
.key4 .hot p{color:#1A0E06}
/* карта ринку */
.g3{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;min-height:0}
.grp{background:#fff;padding:6mm;display:flex;flex-direction:column;gap:3mm}
.grp.g0{border-top:1.4mm solid #067A87}.grp.g1{border-top:1.4mm solid #F46322}.grp.g2{border-top:1.4mm solid #141517}
.gd{font-size:11pt;line-height:1.45;color:#61656A;margin-bottom:1mm}
.co{display:grid;gap:.6mm;padding-top:2.6mm;border-top:1px solid #DDDFDA}
.co b{font:400 13pt/1.15 'Dela Gothic One',sans-serif}.co span{font-size:10.5pt;color:#33363A}
.callout{background:#141517;color:#F4F4F1;padding:5mm 7mm;font-size:12pt;line-height:1.5;border-left:2mm solid #F46322}
/* видача */
.serp{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;min-height:0}
.q{background:#fff;padding:5mm;display:flex;flex-direction:column;gap:3mm}
.qq{font:400 12pt/1.2 'Dela Gothic One',sans-serif}
.q ol{padding-left:6mm;font:500 11pt/2.05 'JetBrains Mono',monospace;color:#33363A;flex:1}
.q li.kv{color:#067A87;font-weight:700}
.miss{background:#F46322;color:#141517;font:700 9pt/1.3 'JetBrains Mono',monospace;padding:2.5mm 3mm}
.note2{display:grid;grid-template-columns:auto 1fr;gap:8mm;font-size:10.5pt;line-height:1.45;color:#33363A;align-items:start}
.note2 span:first-child{font:700 8.5pt/1.4 'JetBrains Mono',monospace;color:#067A87;white-space:nowrap}
.sw{display:inline-block;width:3mm;height:3mm;background:#067A87;margin-right:2mm;vertical-align:-.4mm}
/* нинішній сайт */
.nowg{flex:1;display:grid;grid-template-columns:118mm 1fr;gap:7mm;min-height:0}
.oldshot{display:flex;flex-direction:column;gap:2mm}
.oldshot img{width:100%;border:1px solid #CDCFCA;display:block}
.cap{font:500 8pt/1.3 'JetBrains Mono',monospace;color:#8F949A}
.iss{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:3.5mm}
.iss > div{background:#fff;padding:3.5mm 4.5mm;display:grid;grid-template-columns:9mm 1fr;grid-template-rows:auto 1fr;column-gap:2mm;row-gap:1.5mm;align-content:start}
.iss i{grid-row:1/3;font:700 10pt/1.3 'JetBrains Mono',monospace;font-style:normal;color:#F46322}
.iss b{font:400 12pt/1.2 'Dela Gothic One',sans-serif}
.iss p{font-size:9.6pt;line-height:1.4;color:#33363A}
/* сильні */
.st5{flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:4mm;min-height:0}
.st5 > div{background:#fff;padding:5.5mm 6mm;display:flex;flex-direction:column;gap:2.5mm;border-top:1.2mm solid #067A87}
.st5 b{font:400 14pt/1.15 'Dela Gothic One',sans-serif}
.st5 p:not(.lbl){font-size:11pt;line-height:1.5;color:#33363A}
.st5 > div.hot{background:#141517;color:#F4F4F1;border-top-color:#F46322}.st5 .hot .lbl{color:#F46322}.st5 .hot p:not(.lbl){color:#C9CCD0}
/* таблиці */
table{border-collapse:collapse;width:100%;font-size:10.5pt;background:#fff}
th,td{text-align:left;padding:2.4mm 3mm;border-bottom:1px solid #E3E4E0;vertical-align:top}
th{font:700 7.5pt/1.3 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#61656A;background:#ECECE8}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tr:last-child td{border-bottom:0}
.t2{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:7mm;min-height:0}
.t2 > div{display:flex;flex-direction:column;gap:3.5mm}
.big{background:#141517;color:#F4F4F1;padding:5mm 6mm;display:flex;align-items:center;gap:5mm;margin-top:auto}
.big b{font:400 30pt/1 'Dela Gothic One',sans-serif;color:#F46322;white-space:nowrap}
.big span{font-size:11pt;line-height:1.4;color:#C9CCD0}
.big.alt{background:#F46322}.big.alt b{color:#141517}.big.alt span{color:#1A0E06}
.tnote{font-size:11pt;line-height:1.5;color:#33363A;background:#fff;padding:4mm 5mm;border-left:1.4mm solid #F46322;margin-top:auto}
.tl{flex:1;display:grid;grid-template-columns:1fr 70mm;gap:6mm;min-height:0}
.tt td,.tt th{padding:2.1mm 3mm}
.tt tr.us td{background:#F46322;color:#141517;font-weight:700}
.side{display:flex;flex-direction:column;gap:4mm}
.side .big{flex-direction:column;align-items:flex-start;margin-top:0;gap:3mm}
.side p{font-size:11pt;line-height:1.5;color:#33363A}
.side .warn{background:#fff;border-left:1.4mm solid #067A87;padding:3.5mm 4mm;margin-top:auto;font-size:10pt}
/* прогалини */
.gt{font-size:11.5pt;flex:1}
.gt td{padding:3mm 3.5mm;line-height:1.45;vertical-align:middle}
.gt td:first-child{width:52mm}.gt td:first-child b{font:400 13pt/1.2 'Dela Gothic One',sans-serif}
.gt td:nth-child(2){width:72mm}
.mk{font:700 13pt/1 Onest,sans-serif;text-align:center;width:12mm}
.mk.ok,.c.ok{color:#1F8A4C}.mk.half,.c.half{color:#D9822B}.mk.no,.c.no{color:#B4B7BB}
.legend{font-size:9.5pt;color:#61656A;display:flex;gap:2mm;align-items:center}
.legend .mk{width:auto;font-size:11pt;margin-left:3mm}
/* знімки */
.shots3{flex:1;display:grid;grid-template-columns:1fr 1fr 52mm;gap:5mm;min-height:0}
.shots3 figure{display:flex;flex-direction:column;gap:2.5mm;min-height:0}
.shots3 img{width:100%;flex:1;min-height:0;object-fit:cover;object-position:left top;border:1px solid #CDCFCA;display:block}
.shots3 .ph img{border:1.4mm solid #141517}
.shots3 figcaption{font-size:10pt;line-height:1.4;color:#33363A}
/* порівняння */
.cmp{font-size:12.5pt;flex:1}
.cmp th{text-align:center;font-size:7.5pt;vertical-align:bottom}
.cmp th:first-child{text-align:left}
.cmp th.us{background:#F46322;color:#141517}.cmp th.old{background:#DCDDD8}
.cmp td{padding:3.4mm 3mm;vertical-align:middle}
.cmp td.c{text-align:center;font-weight:700;font-size:13pt;width:27mm}
.cmp td.us{background:#FDEBE1}
/* пропозиція */
.price{flex:1;display:grid;grid-template-columns:140mm 1fr;gap:8mm;min-height:0}
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
.steps4 div{border-top:1mm solid #F46322;padding-top:3mm;display:grid;gap:1.5mm;align-content:start}
.steps4 i{font:700 9pt/1 'JetBrains Mono',monospace;font-style:normal;color:#F46322}.steps4 b{font:400 12pt/1.2 'Dela Gothic One',sans-serif}.steps4 span{font-size:10pt;line-height:1.4;color:#B9BDC2}
.need{display:grid;gap:2mm;font-size:10.5pt;line-height:1.4;color:#C9CCD0;background:#1F2124;padding:5mm 6mm;flex:1;align-content:center}
.need::before{content:"Що потрібно від вас";font:700 8pt/1.2 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#3DB7C2;margin-bottom:1mm}
.need span::before{content:"— ";color:#F46322}
/* методика */
.meth{flex:1;display:grid;grid-template-columns:1fr 1fr 1fr;grid-auto-rows:1fr;gap:4mm;min-height:0}
.meth > div{background:#fff;padding:5mm 6mm;display:flex;flex-direction:column;gap:2.5mm;border-top:1.2mm solid #067A87}
.meth b{font:400 12.5pt/1.2 'Dela Gothic One',sans-serif}
.meth p{font-size:10.5pt;line-height:1.5;color:#33363A}
.t2 table td{padding:4mm 3.5mm;font-size:12pt}
.tn2{font-size:11.5pt;line-height:1.5;color:#33363A}
.st5 b{font-size:16pt}.st5 p:not(.lbl){font-size:12.5pt}
`;
const WEB_DIR = ROOT + "/analiz-konkurentiv";
const webCss = `
html{background:#0E0F10;scroll-behavior:smooth}
body{margin:0;min-height:100vh}
.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:16px;padding:10px 24px;background:rgba(14,15,16,.92);backdrop-filter:blur(8px);border-bottom:1px solid #26292D;font:500 14px/1 Onest,sans-serif;color:#C9CCD0}
.topbar img{height:30px;background:#F4F4F1;padding:4px 7px;display:block}
.topbar .tt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.topbar nav{display:flex;gap:8px}
.topbar a{color:#F4F4F1;text-decoration:none;padding:9px 14px;border:1px solid #3A3D42;white-space:nowrap}
.topbar a:hover{border-color:#F46322}
.topbar a.or{background:#F46322;border-color:#F46322;color:#141517;font-weight:700}
.deck{display:flex;flex-direction:column;align-items:center;gap:28px;padding:28px 0 56px}
.deck .pg{zoom:var(--z,1);box-shadow:0 20px 50px rgba(0,0,0,.45);page-break-after:auto}
@media (max-width:820px){
  .topbar{padding:8px 16px;gap:10px}.topbar .tt,.topbar a.pdf{display:none}.topbar a{padding:8px 10px;font-size:13px}.topbar nav{margin-left:auto}
  .deck{gap:0;padding:0}
  .deck .pg{zoom:1!important;width:auto;height:auto;padding:36px 16px 40px;gap:18px;box-shadow:none;border-bottom:6px solid #0E0F10}
  .bar{height:8px}
  header h2{font-size:28px}header .sub{font-size:16px;line-height:1.4}.lbl{font-size:11px}
  footer{display:none}
  .cover{display:flex!important;flex-direction:column}
  .cover .cr{height:220px;order:-1;border-left:0;border-bottom:6px solid #F46322}
  .cl{padding:28px 16px 36px;gap:18px}.cl .lg img{height:40px}
  .cover h1{font-size:36px;margin-top:8px}.cp{font-size:16px}.meta{font-size:12px}
  .key4,.g3,.serp,.st5,.t2,.tl,.shots3,.meth,.price,.nowg,.iss{display:flex!important;flex-direction:column;gap:12px!important}
  .key4 > div,.grp,.q,.st5 > div,.meth > div{padding:18px}
  .kn{font-size:40px}.key4 h3{font-size:21px}.key4 p,.st5 p:not(.lbl),.meth p,.gd,.co span,.side p,.tnote,.callout,.note2{font-size:16px!important}
  .st5 b,.meth b,.co b{font-size:19px}
  .q ol{font-size:14px}.qq{font-size:17px}.miss{font-size:12px}
  .note2{grid-template-columns:1fr;gap:8px}
  .iss > div{padding:14px}.iss b{font-size:17px}.iss p{font-size:15px}
  .tbl{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .deck .pg{max-width:100vw}.deck .pg > *,.t2 > div,.tl > *,.tbl{min-width:0;max-width:100%}
  .big{flex-wrap:wrap}
  table{font-size:14px!important;min-width:560px}.t2 table td{font-size:14px}
  .big b{font-size:32px}.big span{font-size:15px}
  .shots3 img{flex:none;height:auto}.shots3 figcaption{font-size:15px}.shots3 .ph{width:60%}
  .gt td:first-child,.gt td:nth-child(2){width:auto}
  .legend{font-size:13px;flex-wrap:wrap}
  .price3 > div{padding:18px}.price3 h3{font-size:19px}.price3 p{font-size:15px}.price3 .v{font-size:28px}.price3 .v.sm{font-size:18px}.price3 .v small{font-size:11px}
  .steps4{gap:14px}.steps4 b{font-size:16px}.steps4 span{font-size:14px}.need{font-size:15px;padding:18px}
}`;

const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<style>${css}</style></head><body>${S.join("\n")}</body></html>`;
fs.writeFileSync(OUT_HTML, html);

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--allow-file-access-from-files"] });
  // знімок нинішнього сайту — для слайда «Нинішній сайт»
  const oldShot = path.join(__dirname, "shots", "old-hero.jpg");
  if (!fs.existsSync(oldShot) || process.env.RESHOOT) {
    const p0 = await browser.newPage();
    await p0.setViewport({ width: 1440, height: 1000 });
    await p0.goto("https://probeton.com.ua/", { waitUntil: "networkidle2", timeout: 90000 });
    await new Promise(r => setTimeout(r, 2500));
    await p0.screenshot({ path: oldShot, type: "jpeg", quality: 80 });
    await p0.close();
  }
  const page = await browser.newPage();
  await page.setViewport({ width: 1123, height: 794 });
  await page.emulateMediaType("print");
  await page.goto("file:///" + OUT_HTML.split(path.sep).join("/"), { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const rep = await page.evaluate(() => [...document.querySelectorAll(".pg")].map((p, i) => {
    const out = [];
    const pr = p.getBoundingClientRect();
    p.querySelectorAll("*").forEach(el => { const r = el.getBoundingClientRect(); if (r.height && r.bottom > pr.bottom - 9 * 3.78 && !el.closest("footer") && getComputedStyle(el).position !== "absolute" && el.children.length === 0) out.push("низ: " + el.tagName + " " + (el.textContent || "").slice(0, 30)); });
    return out.length ? (i + 1) + ": " + [...new Set(out)].slice(0, 4).join("; ") : null; }).filter(Boolean));
  console.log(rep.join("\n") || "без вилазок");
  if (process.env.PREVIEW) {
    fs.mkdirSync(path.join(__dirname, "kprev"), { recursive: true });
    const pgs = await page.$$(".pg");
    for (let i = 0; i < pgs.length; i++) await pgs[i].screenshot({ path: path.join(__dirname, "kprev", "p" + String(i + 1).padStart(2, "0") + ".jpg"), type: "jpeg", quality: 70 });
  }
  await page.pdf({ path: OUT_PDF, width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true });
  // веб-версія для Vercel: ті самі слайди, знімки у WebP, таблиці прокручуються на телефоні
  fs.mkdirSync(WEB_DIR + "/media", { recursive: true });
  let body = S.join("\n").replace(/<table/g, '<div class="tbl"><table').replace(/<\/table>/g, "</table></div>");
  const used = [...new Set([...body.matchAll(/file:\/\/\/[^"')]+\/shots\/([\w-]+)\.jpg/g)].map(m => m[0]))];
  const cv = await browser.newPage();
  for (const u of used) {
    const name = u.match(/([\w-]+)\.jpg$/)[1];
    await cv.goto(u);
    const data = await cv.evaluate(async () => { const i = document.querySelector("img"); await i.decode(); const w = Math.min(1400, i.naturalWidth); const c = document.createElement("canvas"); c.width = w; c.height = Math.round(i.naturalHeight * w / i.naturalWidth); const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(i, 0, 0, c.width, c.height); return c.toDataURL("image/webp", 0.8); });
    fs.writeFileSync(WEB_DIR + "/media/" + name + ".webp", Buffer.from(data.split(",")[1], "base64"));
    body = body.split(u).join("media/" + name + ".webp");
  }
  await cv.close();
  const SITE_IMG = "file:///" + ROOT + "/img/";
  body = body.split(SITE_IMG).join("../img/");
  fs.copyFileSync(OUT_PDF, WEB_DIR + "/probeton-analiz-konkurentiv.pdf");
  fs.writeFileSync(WEB_DIR + "/index.html", `<!doctype html>
<html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ПроБетон — аналіз конкурентів</title>
<meta name="description" content="Хто забирає клієнтів ПроБетону в Google по Києву й області: видача, ціни на бетон, плитку Ковальська, ЗБВ і техніку, прогалини ринку.">
<meta name="robots" content="noindex">
<meta property="og:title" content="ПроБетон — аналіз конкурентів">
<meta property="og:description" content="Видача Google, ціни конкурентів і що з цього може взяти ПроБетон.">
<meta property="og:image" content="https://probeton-site-beta.vercel.app/img/og.jpg">
<link rel="icon" href="../img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<style>${css.replace(/@page\{[^}]*\}/, "").split(SITE_IMG).join("../img/")}${webCss}</style></head>
<body>
<div class="topbar"><img src="../img/logo.png" alt="ProBeton"><span class="tt">Аналіз конкурентів · Київ і область</span><nav><a class="pdf" href="probeton-analiz-konkurentiv.pdf" download>PDF</a><a href="../prezentatsiya/">Презентація сайту</a><a class="or" href="../">Відкрити сайт</a></nav></div>
<main class="deck">
${body}
</main>
<script>(function(){var r=document.documentElement;function fit(){var z=Math.min((innerWidth-48)/1123,(innerHeight-56-40)/794,1.6);r.style.setProperty("--z",Math.max(.4,z).toFixed(3))}fit();addEventListener("resize",fit)})();</script>
</body></html>`);
  console.log("web →", WEB_DIR, used.length, "знімків");
  await browser.close();
  console.log(OUT_PDF, (fs.statSync(OUT_PDF).size / 1048576).toFixed(1) + " MB");
})();
