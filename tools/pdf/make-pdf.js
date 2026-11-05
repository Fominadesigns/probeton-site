// PDF-презентація нового сайту ПроБетон: A4 вертикально, кожен блок — що це, чому так, як продає.
const puppeteer = require("puppeteer-core");
const fs = require("fs"), path = require("path");
const OUT_PDF = path.join(__dirname, "../../probeton-sait-prezentatsiya.pdf");
const OUT_HTML = path.join(__dirname, "prezentatsiya.html");
const SITE = "fominadesigns.github.io/probeton-site";
const LOGO = path.join(__dirname, "../../img/logo.png").split(path.sep).join("/");

const B = [
  { id: "hero", lbl: "Головна · перший екран", t: "Перший екран", sub: "Три напрями й заявка — без прокрутки",
    what: "Перше, що бачить людина: «Бетон. Бруківка. Техніка.» великим шрифтом і картка «Швидкий прорахунок» поруч.",
    why: "Помаранчева плашка по черзі перебігає з «Бетону» на «Бруківку» й «Техніку» — за кілька секунд видно все, що ви продаєте, і починається з бетону, головного продукту. Фото інженера з приладом — живий будмайданчик, а не стокова картинка.",
    sell: "Заявку можна залишити, не прокручуючи сторінку: марка, обсяг, насос, телефон. Чим менше кроків до заявки, тим менше людей іде до конкурента." },
  { id: "stats", lbl: "Головна · стрічка й цифри", t: "Стрічка й цифри", sub: "Асортимент за секунду, масштаб за дві",
    what: "Помаранчева стрічка з асортиментом і чотири цифри з вашого сайту: 5+ років, 7300+ об'єктів, 100 тис. м² плитки, 60 000 м³ бетону.",
    why: "Стрічка показує все — від бетону до крана-маніпулятора — не займаючи місця. Цифри «набігають», коли блок з'являється на екрані: рух притягує погляд саме туди, де докази.",
    sell: "Великі цифри знімають головне питання нового клієнта: «а ви взагалі надійні?». Оптовик бачить масштаб ще до того, як почне читати." },
  { id: "partners", lbl: "Головна · довіра", t: "Нам довіряють", sub: "Соціальний доказ від тих, хто вже купує",
    what: "Стрічка з назвами компаній, які вже працюють з ПроБетон.",
    why: "Зараз тут заглушки «Партнер» — назви й логотипи додамо з брифу. Стрічка рухається повільно, щоб назви встигали прочитати, і зупиняється при наведенні.",
    sell: "Забудовник довіряє тому, кому вже довіряють інші забудовники. Одна знайома назва переконує сильніше за будь-який текст про якість." },
  { id: "beton", lbl: "Головна · бетон", t: "Бетон", sub: "Головний продукт — одразу після довіри",
    what: "Шкала з семи марок В7,5–В35: натискаєш марку — бачиш, для чого вона. Поруч — подача бетононасосом і доставка міксером. Бетономішалка з вашим логотипом виїжджає на екран.",
    why: "Покупець часто не знає, яка марка йому потрібна. Шкала пояснює це простими словами: «фундамент приватного будинку», «перекриття», «майданчики під авто».",
    sell: "Людина, яка розібралася в марці, вже майже готова замовити: кнопка «Прорахувати В25» веде в калькулятор з цією маркою. Машина з логотипом запам'ятовується й показує: техніка своя." },
  { id: "cats", lbl: "Головна · каталог", t: "Один клік до товару", sub: "Двері в потрібний розділ замість прокрутки",
    what: "Шість карток-входів: бетон, тротуарна плитка, бордюри й лотки, ЗБВ, спецтехніка і «Не знайшли потрібне?».",
    why: "Кожен відвідувач приходить по своє. Замість довгої прокрутки — одразу вхід у потрібний розділ, з кількістю позицій на картці.",
    sell: "Що швидше людина знаходить свій товар, то менше шанс, що вона закриє сайт. Остання картка з телефоном ловить тих, хто не знайшов потрібне." },
  { id: "bruk", lbl: "Головна · бруківка", t: "Побачите свій двір", sub: "Плитку обирають очима",
    what: "Обираєте модель — Лайнстоун, Подвійна «Т», Старе місто, класична бруківка — і колір, і бачите викладку в реальному масштабі з ціною з прайсу.",
    why: "Фото однієї цеглинки нічого не каже, а викладка на весь квадрат показує, як виглядатиме подвір'я. Фрагменти вирізані з фото каталогу Ковальської — кольори справжні.",
    sell: "Людина «приміряє» плитку до свого двору й затримується на сайті. Кнопка «Прорахувати мій двір» переводить вибір у заявку." },
  { id: "akcii", lbl: "Головна · акції", t: "Вигідно цього тижня", sub: "Причина купити зараз, а не потім",
    what: "Пропозиції тижня з цінами з прайсу, картка «Від 100 м² — доставка безкоштовно» і менеджер Павло з фото й прямим номером.",
    why: "Акції стоять високо, бо ціна — одне з перших питань. Живе обличчя менеджера поруч прибирає відчуття безликого магазину.",
    sell: "Акція дає причину купити зараз. Безкоштовна доставка від 100 м² підштовхує брати більший обсяг. Прямий номер — найкоротший шлях від ціни до дзвінка." },
  { id: "perevagy", lbl: "Головна · переваги", t: "Якісно. Вчасно. Під ключ.", sub: "Позиціонування й шість фактів",
    what: "Три слова позиціонування — плашка по черзі виділяє кожне — і шість конкретних причин: сертифікати, марки В7,5–В35, свій автопарк, дилер Ковальської, дзвінок за 5 хвилин, під ключ.",
    why: "Під гаслом — факти, а не загальні фрази «ми найкращі». Картки при наведенні стають помаранчевими й «оживають».",
    sell: "Оптовик порівнює постачальників за якістю, вчасністю й зручністю. Цей блок відповідає на всі три питання одразу." },
  { id: "flow", lbl: "Головна · процес", t: "Як ми працюємо", sub: "Заявка → прорахунок → доставка → монтаж",
    what: "Чотири кроки, які перемикаються самі; слово в заголовку підсвічується разом з активним кроком. У кожному кроці — що саме входить.",
    why: "Новий клієнт боїться невідомого: що буде після дзвінка? Блок показує весь шлях від заявки до готового двору.",
    sell: "Коли зрозуміло, що буде далі, легше зробити перший крок. «Передзвонимо за 5 хвилин» знімає страх «залишу заявку — і ніхто не відповість»." },
  { id: "faq", lbl: "Головна · калькулятор", t: "Калькулятор і відповіді", sub: "Людина рахує сама — менеджер отримує готовий запит",
    what: "Калькулятор плитки й бетону — площа, запас, бордюр, обсяг — і відповіді на часті питання поруч.",
    why: "Питання виникають саме під час розрахунку, тому відповіді стоять поряд: яку товщину брати, скільки запасу, яку марку під фундамент.",
    sell: "Порахований обсяг сам потрапляє в заявку. Менеджер отримує конкретний запит замість «скільки коштує плитка?» і витрачає час на продаж, а не на пояснення." },
  { id: "kontakty", lbl: "Кожна сторінка · контакти", t: "Контакти й заявка", sub: "Внизу кожної сторінки",
    what: "Менеджер з фото, усі телефони, офіс, пошта, соцмережі й форма заявки. На сторінці «Контакти» — ще й карта.",
    why: "До контактів не треба шукати шлях: вони завершують кожну сторінку. Форма підхоплює розрахунок з калькулятора.",
    sell: "Кому зручно дзвонити — дзвонить, кому писати — пише в Telegram чи форму. Більше способів зв'язку — менше втрачених клієнтів." },
  { id: "callback", lbl: "Увесь сайт · кнопки", t: "Передзвонимо у зручний час", sub: "Кнопка дзвінка завжди під рукою", dark: 1,
    what: "Кнопка дзвінка видна на кожному екрані: людина обирає день і годину, коли їй зручно говорити. Під нею — кнопка «нагору». На телефоні — панель «Прорахувати · Подзвонити · Telegram».",
    why: "Не всі можуть говорити зараз — на об'єкті, за кермом. Вибір часу робить заявку зручною, а не нав'язливою. Один раз за візит віконце пропонує дзвінок саме.",
    sell: "Людина, яка сама обрала час, чекає дзвінка й готова говорити — це теплий клієнт, а не холодний обдзвін." },
  { id: "katalog", lbl: "Сторінка «Бруківка»", t: "Каталог з фільтрами", sub: "Як у великих виробників",
    what: "Окрема сторінка «Тротуарна плитка та бруківка»: фільтри за категорією, ціною й кольором, сортування, вигляд плиткою чи списком. Квадратики кольорів у картці перемикають фото плитки.",
    why: "Кольори показані справжньою плиткою, а не кружечками. Вибрані фільтри зберігаються в посиланні — підбірку можна переслати.",
    sell: "Покупець швидко звужує вибір до кількох позицій, і кожна картка має кнопку «Прорахувати». Посилання на підбірку зручно відправити замовнику чи бригаді." },
  { id: "pages", lbl: "Структура сайту", t: "Сім окремих сторінок", sub: "Більше входів з Google без оплати реклами",
    what: "Головна, Бетон, Бруківка, ЗБВ, Спецтехніка, Про нас, Контакти — у кожної свій заголовок і опис для пошуку.",
    why: "Google показує сторінки, а не сайти. Сторінка «Бетон В7,5–В35 з доставкою» має шанс з'явитися на запит про бетон з доставкою, сторінка техніки — на запит про оренду бетононасоса.",
    sell: "Кожна сторінка — окремий вхід з пошуку, і кожна закінчується заявкою. Такий сайт легше просувати рекламою й SEO далі." },
  { id: "mobile", lbl: "Телефон", t: "Мобільна версія", sub: "Постачальника часто шукають просто на об'єкті",
    what: "Сайт перебудовується під телефон: меню на весь екран, по дві картки товарів у ряд, кроки — стрілками, двір — в одну колонку.",
    why: "Усе, що працює на комп'ютері, працює й на телефоні — без обрізаних текстів і горизонтальної прокрутки.",
    sell: "Кнопки «Подзвонити» й «Telegram» завжди під пальцем. Від знайденого сайту до дзвінка — один дотик." },
];

const IMG = id => "shots/" + id + ".jpg";
const NB = "\u00a0";
const short = "і|й|а|в|у|з|о|та|на|до|за|по|від|під|над|для|про|при|без|із|зі|що|як|не|ні|чи|це|або|але|ми|є";
const re1 = new RegExp("(^|[\\s(«\u00a0])(" + short + ") ", "giu");
const tidy = t => { for (let k = 0; k < 3; k++) t = t.replace(re1, (m, a, b) => a + b + NB); return t.replace(/ ([—–→])/g, NB + "$1").replace(/(\d) (?=[^\d\s—–·<])/g, "$1" + NB); };
const esc = t => tidy(t);

const shotHtml = b => {
  if (b.id === "pages") return `<div class="two"><img src="shots/page-beton.jpg"><img src="shots/page-kontakty.jpg"></div>`;
  if (b.id === "mobile") return `<div class="phones">${["m-hero", "m-menu", "m-katalog", "m-dvir"].map(m => `<img src="shots/${m}.jpg">`).join("")}</div>`;
  return `<img class="shot" src="${IMG(b.id)}">`;
};
const page = (b, n) => `
<section class="pg${b.dark ? " dk" : ""}">
  <div class="bar"></div>
  <header><p class="lbl">Блок ${String(n - 2).padStart(2, "0")} · ${b.lbl}</p><h2>${esc(b.t)}</h2><p class="sub">${esc(b.sub)}</p></header>
  ${shotHtml(b)}
  <div class="rows">
    <div class="row"><h3>Що це</h3><p>${esc(b.what)}</p></div>
    <div class="row"><h3>Чому саме так</h3><p>${esc(b.why)}</p></div>
    <div class="row hot"><h3>Як продає</h3><p>${esc(b.sell)}</p></div>
  </div>
  <footer><span>ПроБетон · новий сайт</span><span>${n}</span></footer>
</section>`;

const funnel = [["Побачив", "Перший екран, стрічка"], ["Довірився", "Цифри, партнери, переваги"], ["Обрав", "Бетон, каталог, двір, акції"], ["Порахував", "Калькулятор, процес"], ["Залишив заявку", "Форма, дзвінок у зручний час"]];
const principles = [["Ціни видно одразу", "Ціни з прайсу на картках, в акціях і в калькуляторі — без «ціну уточнюйте» скрізь."],
  ["У кожного блоку є дія", "Кнопка, дзвінок або калькулятор: людина ніде не «застрягає»."],
  ["Окремі сторінки для Google", "Бетон, бруківка, ЗБВ, техніка — кожна шукається окремо."],
  ["Телефон — головний екран", "Усе перевірено на телефоні: меню, каталог, кнопки дзвінка."]];

const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0}
body{font-family:Onest,sans-serif;color:#141517;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:15mm 16mm 16mm;display:flex;flex-direction:column;gap:6mm;background:#F4F4F1;position:relative;overflow:hidden;page-break-after:always}
.pg.dk{background:#141517;color:#F4F4F1}
.bar{position:absolute;left:0;top:0;width:100%;height:3mm;background:repeating-linear-gradient(-45deg,#F46322 0 3mm,#141517 3mm 6mm)}
header{display:grid;gap:2mm}
.lbl{font:700 8.5pt/1 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#067A87}
.dk .lbl{color:#3DB7C2}
h2{font:400 25pt/1.05 'Dela Gothic One',sans-serif;letter-spacing:-.02em}
.sub{font-size:11pt;color:#61656A}
.dk .sub{color:#9EA2A7}
.shot{width:100%;height:auto;max-height:126mm;object-fit:cover;object-position:top;border:1px solid #CDCFCA;display:block}
.two{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.two img{width:100%;height:auto;max-height:126mm;object-fit:cover;object-position:top;border:1px solid #CDCFCA}
.phones{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm}.phones img{width:100%;height:112mm;object-fit:cover;object-position:top;border:2mm solid #141517}
.cbwrap{height:100mm;display:grid;place-items:center;background:repeating-linear-gradient(-45deg,#1C1E21 0 4mm,#141517 4mm 8mm)}.cbwrap img{width:92mm;box-shadow:0 8mm 16mm -6mm rgba(0,0,0,.6)}
.rows{display:grid;gap:5mm;margin-top:2mm}
.row{display:grid;grid-template-columns:38mm 1fr;gap:5mm;padding-top:4mm;border-top:1px solid #CDCFCA}
.dk .row{border-top-color:#2C2F33}
.row h3{font:400 12.5pt/1.2 'Dela Gothic One',sans-serif}
.row p{font-size:11.2pt;line-height:1.58;color:#33363A}
.dk .row p{color:#C9CCD0}
.row.hot h3{color:#F46322}
footer{position:absolute;left:16mm;right:16mm;bottom:8mm;display:flex;justify-content:space-between;font:500 8pt/1 'JetBrains Mono',monospace;color:#8F949A}
/* обкладинка */
.cover{background:#141517;color:#F4F4F1;padding:0}
.cover .ph{height:131mm;background:url(shots/hero.jpg) left top/100% auto no-repeat}
.cover .in{padding:16mm 16mm;display:grid;gap:7mm}
.cover .lg{position:absolute;left:16mm;bottom:14mm;background:#F4F4F1;padding:3mm 5mm}.cover .lg img{height:12mm;display:block}
.cover .cnt{position:absolute;right:16mm;bottom:16mm;font:700 9pt/1.6 'JetBrains Mono',monospace;color:#9EA2A7;text-align:right}
.cover .logo{position:absolute;left:16mm;top:14mm;background:#F4F4F1;padding:4mm 6mm}.cover .logo img{height:16mm;display:block}
.cover h1{font:400 44pt/1 'Dela Gothic One',sans-serif;letter-spacing:-.02em}
.cover h1 em{font-style:normal;background:#F46322;padding:0 2mm;display:inline-block;transform:skewX(-10deg)}.cover h1 em span{display:inline-block;transform:skewX(10deg)}
.cover p{font-size:12.5pt;line-height:1.5;color:#B9BDC2;max-width:150mm}
.cover .meta{font:700 9pt/1.6 'JetBrains Mono',monospace;letter-spacing:.08em;color:#3DB7C2}
/* логіка сайту */
.flow5{display:grid;grid-template-columns:repeat(5,1fr);gap:2mm}
.flow5 div{background:#141517;color:#fff;padding:5mm 4mm;display:grid;gap:2mm;min-height:34mm;align-content:start}
.flow5 div:nth-child(5){background:#F46322}
.flow5 b{font:400 11pt/1.15 'Dela Gothic One',sans-serif}.flow5 span{font-size:9pt;line-height:1.4;color:#C9CCD0}.flow5 div:nth-child(5) span{color:#FFE5D6}
.flow5 i{font:700 8pt/1 'JetBrains Mono',monospace;font-style:normal;color:#F46322}.flow5 div:nth-child(5) i{color:#141517}
.pr4{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.pr4 div{border-top:1.2mm solid #067A87;background:#fff;padding:5mm;display:grid;gap:2mm}
.pr4 b{font:400 12pt/1.2 'Dela Gothic One',sans-serif}.pr4 p{font-size:10pt;line-height:1.5;color:#33363A}
.lead2{font-size:12pt;line-height:1.55;color:#33363A}
/* ціна */
.price3{display:grid;gap:4mm}
.price3 > div{display:grid;grid-template-columns:1fr auto;gap:2mm 6mm;align-items:end;padding:6mm;background:#1F2124}
.price3 h3{font:400 15pt/1.1 'Dela Gothic One',sans-serif}
.price3 p{grid-column:1;font-size:10pt;line-height:1.5;color:#B9BDC2}
.price3 .v{grid-column:2;grid-row:1/3;font:400 30pt/1 'Dela Gothic One',sans-serif;color:#F46322;text-align:right}
.price3 .v small{display:block;font:700 8.5pt/1.4 'JetBrains Mono',monospace;color:#9EA2A7;margin-top:2mm}
.price3 > div.bonus{background:#F46322;color:#141517}.price3 .bonus p{color:#2A1A10}.price3 .bonus .v{color:#141517}.price3 .bonus .v small{color:#141517}
.steps4{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
.steps4 div{border-top:1mm solid #F46322;padding-top:3mm;display:grid;gap:1.5mm}
.steps4 i{font:700 9pt/1 'JetBrains Mono',monospace;font-style:normal;color:#F46322}.steps4 b{font:400 10.5pt/1.2 'Dela Gothic One',sans-serif}.steps4 span{font-size:9pt;line-height:1.4;color:#B9BDC2}
.need{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 6mm;font-size:9.5pt;line-height:1.45;color:#C9CCD0}
.need span::before{content:"— ";color:#F46322}
</style></head><body>

<section class="pg cover">
  <div class="ph"></div>
  <div class="in">
    <p class="meta">ПРЕЗЕНТАЦІЯ НОВОГО САЙТУ · ЛИСТОПАД 2026</p>
    <h1>Сайт, що продає <em><span>бетон</span></em></h1>
    <p>${esc("Розбираємо кожен блок нового сайту ПроБетон: що це, чому зроблено саме так і як він перетворює відвідувача на заявку.")}</p>
    <p class="meta">${SITE}</p>
  </div>
  <div class="lg"><img src="file:///${LOGO}"></div>
  <div class="cnt">${B.length} БЛОКІВ · ЩО ЦЕ · ЧОМУ ТАК · ЯК ПРОДАЄ</div>
</section>

<section class="pg">
  <div class="bar"></div>
  <header><p class="lbl">Логіка сайту</p><h2>Сайт — це шлях покупця</h2><p class="sub">${esc("Кожен блок веде людину на один крок ближче до заявки")}</p></header>
  <p class="lead2">${esc("Головна сторінка збудована не як вітрина, а як розмова з покупцем. Спочатку він бачить, що ви продаєте, потім — чому вам можна довіряти, далі обирає товар, рахує обсяг і лише тоді залишає заявку. Кожен блок у цій презентації відповідає за свій крок.")}</p>
  <div class="flow5">${funnel.map((f, i) => `<div><i>0${i + 1}</i><b>${f[0]}</b><span>${esc(f[1])}</span></div>`).join("")}</div>
  <header style="margin-top:4mm"><p class="lbl">Чотири правила, на яких тримається сайт</p></header>
  <div class="pr4">${principles.map(p => `<div><b>${esc(p[0])}</b><p>${esc(p[1])}</p></div>`).join("")}</div>
  <footer><span>ПроБетон · новий сайт</span><span>2</span></footer>
</section>

${B.map((b, i) => page(b, i + 3)).join("\n")}

<section class="pg dk">
  <div class="bar"></div>
  <header><p class="lbl">Пропозиція</p><h2>Вартість і запуск</h2><p class="sub">${esc("Сайт уже зібраний і працює як демо — після брифу наповнюємо його вашими даними")}</p></header>
  <div class="price3">
    <div><h3>Сайт + фірмовий стиль</h3><p>${esc("Сім сторінок, каталог з фільтрами, калькулятор, двір, акції, питання, мобільна версія, перенесення домену. Брендбук і шаблони.")}</p><div class="v">400 $<small>7 ДНІВ ПІСЛЯ БРИФУ</small></div></div>
    <div class="bonus"><h3>Підтримка</h3><p>${esc("Оновлення цін і акцій, нові об'єкти, аналітика заявок щомісяця.")}</p><div class="v">0 $<small>БОНУС ВІД НАС</small></div></div>
    <div><h3>Далі — реклама</h3><p>${esc("Таргет в Instagram і Facebook, реклама в Google, контент для соцмереж — коли сайт почне збирати заявки.")}</p><div class="v" style="font-size:16pt">Обговоримо<small>ОКРЕМО</small></div></div>
  </div>
  <header style="margin-top:2mm"><p class="lbl">Від брифу до запуску</p></header>
  <div class="steps4">
    <div><i>01</i><b>Бриф</b><span>${esc("Відповіді, прайс з одиницями, документи")}</span></div>
    <div><i>02</i><b>Фотосесія</b><span>${esc("Техніка, об'єкти, склад, команда")}</span></div>
    <div><i>03</i><b>Наповнення</b><span>${esc("Ваші ціни, партнери, об'єкти на сайті")}</span></div>
    <div><i>04</i><b>Запуск</b><span>${esc("Домен probeton.com.ua, аналітика, заявки")}</span></div>
  </div>
  <header style="margin-top:2mm"><p class="lbl">Що потрібно від вас</p></header>
  <div class="need">${["Ціни з одиницями виміру (м², шт, м³)", "Оптові умови й знижки від обсягу", "Назви й логотипи партнерів", "Фото 10–20 ваших об'єктів", "Графік роботи відділу продажу", "Розміри й ціни кілець, плит, балок"].map(t => `<span>${esc(t)}</span>`).join("")}</div>
  <footer><span>ПроБетон · новий сайт</span><span>${B.length + 3}</span></footer>
</section>
</body></html>`;

fs.writeFileSync(OUT_HTML, html);
(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage();
  await page.goto("file:///" + OUT_HTML.replace(/\\/g, "/"), { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: OUT_PDF, format: "A4", printBackground: true, preferCSSPageSize: true });
  // перевірка: чи не вилазить текст за сторінку
  const over = await page.evaluate(() => [...document.querySelectorAll(".pg")].map((p, i) => { const r = p.getBoundingClientRect(); const last = [...p.children].filter(c => c.tagName !== "FOOTER" && !c.classList.contains("bar")).pop(); const lr = last.getBoundingClientRect(); return lr.bottom > r.bottom - 14 * 3.78 ? (i + 1) + ":" + Math.round((lr.bottom - (r.bottom - 14 * 3.78)) / 3.78) + "mm" : null; }).filter(Boolean));
  console.log("pages", await page.evaluate(() => document.querySelectorAll(".pg").length), "overflow", over.join(" ") || "none");
  await browser.close();
  console.log(OUT_PDF, (fs.statSync(OUT_PDF).size / 1048576).toFixed(1) + " MB");
})();
