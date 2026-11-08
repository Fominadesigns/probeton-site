// Швидкість як у Lighthouse «мобільний»: повільний 4G (150 мс, 1,6 Мбіт/с) + процесор уповільнений в 4 рази.
// node measure.js <base-url> [мітка]  → таблиця по сторінках + SEO-перевірки
const puppeteer = require("puppeteer-core");
const BASE = process.argv[2] || "https://fominadesigns.github.io/probeton-site/";
const PAGES = ["", "beton/", "bruk/", "zbv/", "tekhnika/", "pro-nas/", "kontakty/"];
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
  const rows = [];
  for (const pg of PAGES) {
    const ctx = await b.createBrowserContext();
    const p = await ctx.newPage();
    await p.setViewport({ width: 412, height: 823, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75 });
    const c = await p.createCDPSession();
    await c.send("Network.enable"); await c.send("Network.setCacheDisabled", { cacheDisabled: true });
    await c.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
    await c.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    let bytes = 0, reqs = 0; const byType = {};
    c.on("Network.loadingFinished", e => { bytes += e.encodedDataLength; reqs++; });
    c.on("Network.responseReceived", e => { byType[e.requestId] = e.type; });
    const sizes = {}; c.on("Network.loadingFinished", e => { const t = byType[e.requestId] || "?"; sizes[t] = (sizes[t] || 0) + e.encodedDataLength; });
    await p.evaluateOnNewDocument(() => {
      window.__lcp = 0; window.__cls = 0;
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    const t0 = Date.now();
    await p.goto(BASE + pg, { waitUntil: "load", timeout: 120000 });
    const loadMs = Date.now() - t0;
    await new Promise(r => setTimeout(r, 1500));
    const m = await p.evaluate(() => {
      const fcp = performance.getEntriesByName("first-contentful-paint")[0];
      const q = s => document.querySelector(s);
      return {
        fcp: fcp ? Math.round(fcp.startTime) : null, lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3),
        title: document.title, tl: document.title.length, desc: (q('meta[name=description]') || {}).content || "",
        h1: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()),
        canonical: !!q('link[rel=canonical]'), og: !!q('meta[property="og:title"]'), ld: document.querySelectorAll('script[type="application/ld+json"]').length,
        robots: (q('meta[name=robots]') || {}).content || "", noAlt: [...document.images].filter(i => !i.hasAttribute("alt")).length,
      };
    });
    rows.push({ page: "/" + pg, FCP: m.fcp, LCP: m.lcp, CLS: m.cls, load: loadMs, KB: Math.round(bytes / 1024), reqs, img: Math.round((sizes.Image || 0) / 1024), font: Math.round((sizes.Font || 0) / 1024), css: Math.round(((sizes.Stylesheet || 0)) / 1024) });
    console.log("/" + pg, "| title", m.tl, JSON.stringify(m.title), "| desc", m.desc.length, "| h1", JSON.stringify(m.h1), "| canon", m.canonical, "og", m.og, "ld", m.ld, "robots", JSON.stringify(m.robots), "noAlt", m.noAlt);
    await ctx.close();
  }
  console.table(rows);
  await b.close();
})();
