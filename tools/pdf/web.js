// Веб-версія презентації: ті самі слайди, що й у PDF, але з відео, розділами-перемотками й мобільною версткою.
// Знімки переводяться у WebP (легші), відео й PDF кладуться поруч — тека готова для GitHub Pages.
const fs = require("fs"), path = require("path");
const SITE_IMG = "file:///C:/Users/Acer/Desktop/projects/probeton-site/img/";

module.exports = async (browser, slidesHtml, css, OUT) => {
  const MEDIA = path.join(OUT, "media");
  fs.mkdirSync(MEDIA, { recursive: true });

  // 1. знімки → media/*.webp
  const assets = new Map(); // старий шлях → новий
  slidesHtml.replace(/(views|shots|rec)\/([\w-]+)\.jpg/g, (m, dir, name) => { assets.set(m, { src: path.join(__dirname, dir, name + ".jpg"), out: "media/" + (dir === "shots" ? "m-" + name.replace(/^m-/, "") : name) + ".webp", w: dir === "shots" ? 720 : 1600 }); });
  const pg = await browser.newPage();
  for (const a of assets.values()) {
    await pg.goto("file:///" + a.src.split(path.sep).join("/"));
    const data = await pg.evaluate(async W => { const i = document.querySelector("img"); await i.decode(); const w = Math.min(W, i.naturalWidth); const c = document.createElement("canvas"); c.width = w; c.height = Math.round(i.naturalHeight * w / i.naturalWidth); const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(i, 0, 0, c.width, c.height); return c.toDataURL("image/webp", 0.82); }, a.w);
    fs.writeFileSync(path.join(OUT, a.out), Buffer.from(data.split(",")[1], "base64"));
  }
  await pg.close();
  for (const [from, a] of assets) slidesHtml = slidesHtml.split(from).join(a.out);
  slidesHtml = slidesHtml.split(SITE_IMG).join("../img/");
  fs.copyFileSync(path.join(__dirname, "rec", "site.mp4"), path.join(MEDIA, "sait.mp4"));
  fs.copyFileSync(path.join(__dirname, "rec", "poster-sm.jpg"), path.join(MEDIA, "poster.jpg")); // превʼю посилання в Telegram/Viber

  // 2. плеєр замість кадру, підказка замість посилання
  slidesHtml = slidesHtml.replace(/<!--VIDEO-->[\s\S]*?<!--\/VIDEO-->/, '<video id="vid" controls playsinline preload="metadata" poster="media/poster.webp"><source src="media/sait.mp4" type="video/mp4"></video>')
    .replace(/<!--VNOTE-->[\s\S]*?<!--\/VNOTE-->/, "Натисніть розділ <span class=\"dsk\">праворуч</span><span class=\"mbl\">нижче</span> — відео перейде саме до нього. Звук не потрібен.");

  const webCss = `
html{background:#0E0F10;scroll-behavior:smooth;scroll-padding-top:64px}
body{margin:0;min-height:100vh}
.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:16px;padding:10px 24px;background:rgba(14,15,16,.92);backdrop-filter:blur(8px);border-bottom:1px solid #26292D;font:500 14px/1 Onest,sans-serif;color:#C9CCD0}
.topbar img{height:30px;background:#F4F4F1;padding:4px 7px;display:block}
.topbar .tt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.topbar a{color:#F4F4F1;text-decoration:none;padding:9px 14px;border:1px solid #3A3D42;white-space:nowrap;transition:border-color .2s,background .2s}
.topbar a:hover{border-color:#F46322}
.topbar a.or{background:#F46322;border-color:#F46322;color:#141517;font-weight:700}
.deck{display:flex;flex-direction:column;align-items:center;gap:28px;padding:28px 0 56px}
.deck .pg{zoom:var(--z,1);box-shadow:0 20px 50px rgba(0,0,0,.45);page-break-after:auto}
.mbl{display:none}
.chap button{transition:background .2s,color .2s}
.chap button:hover{background:#fff}
.chap button.on{background:#141517;color:#fff}.chap button.on .t{color:#F46322}
@media (max-width:820px){
  html{scroll-padding-top:56px}
  .topbar{padding:8px 16px;gap:10px}.topbar .tt,.topbar a.pdf{display:none}.topbar a{padding:8px 10px;font-size:13px}.topbar nav{margin-left:auto}
  .deck{gap:0;padding:0}
  .deck .pg{zoom:1!important;width:auto;height:auto;padding:36px 16px 40px;gap:18px;box-shadow:none;border-bottom:6px solid #0E0F10}
  .bar{height:8px}
  header{grid-template-columns:1fr;row-gap:8px}
  header h2{font-size:30px;line-height:1.05}
  header .sub{font-size:16px;line-height:1.4}
  .lbl{font-size:11px}
  .split,.prow,.mob,.vsplit,.price,.logic,.seo{display:flex!important;flex-direction:column;height:auto!important;gap:16px!important}
  .l,.vl{gap:14px}
  .r,.sell,.split .r,.prow .r,.mob .r,.vnote{font-size:16px!important}
  .sec h3{font-size:19px}
  .two-sell{flex-direction:column!important}
  .grid4{gap:12px}
  .phones{flex-wrap:wrap;justify-content:center;gap:12px}.phone{width:46%;border-width:6px;border-radius:22px}
  .mob .r{display:flex!important;flex-direction:column}
  .chap button{font-size:15px;padding:9px 0;grid-template-columns:48px 1fr}.chap .t{font-size:12px}
  footer{display:none}
  .dsk{display:none}.mbl{display:inline}
  .cover{display:flex!important;flex-direction:column}
  .cover .cr{height:240px;order:-1;border-left:0;border-bottom:6px solid #F46322}
  .cl{padding:28px 16px 36px;gap:18px}
  .cl .lg img{height:40px}
  .cover h1{font-size:40px;margin-top:8px}
  .cp{font-size:16px}.meta{font-size:12px}
  .lead2{font-size:17px}
  .flow5,.pr4{grid-template-columns:1fr}
  .spd > div{padding:16px}.spd s{font-size:20px}.spd b{font-size:32px}.spd b::before{font-size:20px}.spd span{font-size:15px}
  .flow5 div,.pr4 div{padding:18px}
  .flow5 b{font-size:20px}.flow5 span,.pr4 p{font-size:16px}.pr4 b{font-size:19px}
  .price3 > div{padding:18px}
  .price3 h3{font-size:19px}.price3 p{font-size:15px}.price3 .v{font-size:30px}.price3 .v.sm{font-size:18px}.price3 .v small{font-size:11px}
  .steps4{grid-template-columns:1fr 1fr;gap:14px}.steps4 b{font-size:16px}.steps4 span{font-size:14px}
  .need{font-size:15px;padding:18px}
}`;
  const html = `<!doctype html>
<html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ПроБетон — презентація нового сайту</title>
<meta name="description" content="Новий сайт ПроБетон: відео з анімаціями й розбір кожного блоку — що це, чому зроблено саме так і як він продає.">
<meta name="robots" content="noindex">
<meta property="og:title" content="ПроБетон — презентація нового сайту">
<meta property="og:description" content="Відео сайту в русі й розбір кожного блоку: що це, чому так і як продає.">
<meta property="og:image" content="https://fominadesigns.github.io/probeton-site/prezentatsiya/media/poster.jpg">
<meta property="og:url" content="https://fominadesigns.github.io/probeton-site/prezentatsiya/">
<link rel="icon" href="../img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<style>${css.replace(/@page\{[^}]*\}/, "").split(SITE_IMG).join("../img/")}${webCss}</style></head>
<body>
<div class="topbar"><img src="../img/logo.png" alt="ProBeton"><span class="tt">Презентація нового сайту</span><nav style="display:flex;gap:8px"><a href="#video">Відео</a><a class="pdf" href="probeton-prezentatsiya.pdf" download>PDF</a><a class="or" href="../">Відкрити сайт</a></nav></div>
<main class="deck">
${slidesHtml}
</main>
<script>
(function(){
  var r=document.documentElement;
  function fit(){var z=Math.min((innerWidth-48)/1123,(innerHeight-56-40)/794,1.6);r.style.setProperty("--z",Math.max(.4,z).toFixed(3))}
  fit();addEventListener("resize",fit);
  var v=document.getElementById("vid"),bs=[].slice.call(document.querySelectorAll(".chap button"));
  if(!v)return;
  bs.forEach(function(b){b.addEventListener("click",function(){v.currentTime=+b.dataset.t;var p=v.play();if(p&&p.catch)p.catch(function(){});if(innerWidth<=820)v.scrollIntoView({behavior:"smooth",block:"center"})})});
  v.addEventListener("timeupdate",function(){var t=v.currentTime,k=-1;bs.forEach(function(b,i){if(+b.dataset.t<=t+.2)k=i});bs.forEach(function(b,i){b.classList.toggle("on",i===k)})});
})();
</script>
</body></html>`;
  fs.writeFileSync(path.join(OUT, "index.html"), html);
  console.log("web →", path.join(OUT, "index.html"), assets.size, "знімків");
};
