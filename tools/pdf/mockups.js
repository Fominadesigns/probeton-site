// Слайди з макетами ноутбука й телефона: екрани показані цілими, без обрізання боків
const LEFT_W = 200;
const laptop = src => `<div class="laptop"><div class="lid"><img src="views/${src}.jpg"></div><div class="base"></div></div>`;
const phone = src => `<div class="phone"><img src="shots/${src}.jpg"></div>`;

module.exports = ({ esc, sec, head, foot, BODY_H }) => ({
  blockSlide(b, n, num) {
    const screen = b.id === "pages"
      ? `<div class="grid4">${["page-beton", "page-bruk", "page-tekhnika", "page-kontakty"].map(laptop).join("")}</div>`
      : laptop(b.id);
    return `<section class="pg${b.dark ? " dk" : ""}">
  <div class="bar"></div>
  ${head(`Блок ${String(num).padStart(2, "0")} · ${b.lbl}`, b.t, b.sub)}
  <div class="split" style="grid-template-columns:${LEFT_W}mm 1fr">
    <div class="l">${screen}<div class="sell">${sec("Як продає", b.sell, "hot")}</div></div>
    <div class="r">${sec("Що це", b.what)}${sec("Чому саме так", b.why)}</div>
  </div>
  ${foot(n)}
</section>`;
  },
  pairSlide(a, b, n, num) {
    const txt = (x, k) => `<div class="grp"><p class="lbl">Блок ${String(k).padStart(2, "0")} · ${x.lbl}</p><h3 class="pt">${esc(x.t)}</h3>${sec("Що це", x.what)}${sec("Чому саме так", x.why)}</div>`;
    return `<section class="pg">
  <div class="bar"></div>
  ${head(`Блоки ${String(num).padStart(2, "0")}–${String(num + 1).padStart(2, "0")} · головна`, "Стрічка, цифри й партнери", "Асортимент, масштаб і довіра — одразу під першим екраном")}
  <div class="split" style="grid-template-columns:${LEFT_W}mm 1fr">
    <div class="l">${laptop("stats")}<div class="sell two-sell">${sec("Як продає · цифри", a.sell, "hot")}${sec("Як продає · партнери", b.sell, "hot")}</div></div>
    <div class="r pairr">${txt(a, num)}${txt(b, num + 1)}</div>
  </div>
  ${foot(n)}
</section>`;
  },
  mobileSlide(b, n, num) {
    return `<section class="pg">
  <div class="bar"></div>
  ${head(`Блок ${String(num).padStart(2, "0")} · ${b.lbl}`, b.t, b.sub)}
  <div class="mob">
    <div class="phones">${["m-hero", "m-menu", "m-katalog", "m-dvir"].map(phone).join("")}</div>
    <div class="r">${sec("Що це", b.what)}${sec("Чому саме так", b.why)}${sec("Як продає", b.sell, "hot")}</div>
  </div>
  ${foot(n)}
</section>`;
  },
  css: `
.laptop{width:91%;margin:0 auto;flex:none}
.lid{background:#141517;border-radius:3.2mm 3.2mm 0 0;padding:2.6mm 2.6mm 3.2mm;position:relative}
.lid::before{content:"";position:absolute;top:.9mm;left:50%;width:1.1mm;height:1.1mm;border-radius:50%;background:#3A3D42;transform:translateX(-50%)}
.lid img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top}
.base{height:4.2mm;margin:0 -5.5%;background:linear-gradient(180deg,#E9EBEE 0%,#C3C6CB 55%,#8F939A 100%);border-radius:0 0 5mm 5mm;position:relative}
.base::before{content:"";position:absolute;left:50%;top:0;width:16%;height:1.5mm;background:#A6AAB0;border-radius:0 0 2mm 2mm;transform:translateX(-50%)}
.dk .lid{box-shadow:0 0 0 .35mm #3A3D42}
.grid4{display:grid;grid-template-columns:1fr 1fr;gap:4mm 6mm;flex:none}.grid4 .laptop{width:88%}
.two-sell{flex-direction:row!important;gap:6mm}.two-sell .sec{flex:1}
.pairr{gap:.8em}.pairr .grp{display:flex;flex-direction:column;gap:.5em;flex:1}.pairr .grp + .grp{border-top:1px solid #CDCFCA;padding-top:.8em}
.pairr .sec{padding-top:.5em}.pairr .grp .sec:nth-of-type(1){border-top:0;padding-top:0}
.phones{display:flex;justify-content:space-between;gap:6mm;height:auto}
.phone{width:50mm;border:2.2mm solid #141517;border-radius:6.5mm;overflow:hidden;position:relative;background:#141517;flex:none}
.phone::before{content:"";position:absolute;top:1.3mm;left:50%;width:30%;height:3mm;border-radius:2mm;background:#141517;transform:translateX(-50%);z-index:2}
.phone img{display:block;width:100%;height:auto}
.mob .r .sec{align-content:start}
`
});
