// Кадри rec/frames → MP4 (H.264) через WebCodecs у Chrome. Сталий темп FPS: на кожен момент береться останній кадр.
// node encode.js out.mp4 [fps] [bitrate] [width]
const puppeteer = require("puppeteer-core"), fs = require("fs"), path = require("path"), http = require("http");
const [out, FPS = "30", BR = "2400000", OW = "1440"] = process.argv.slice(2);
const ROOT = __dirname;
const ts = JSON.parse(fs.readFileSync(path.join(ROOT, "rec", "frames.json")));
const t0 = ts[0], end = ts[ts.length - 1] - t0 + 0.5;
const fps = +FPS, n = Math.floor(end * fps);
const pick = []; let j = 0;
for (let i = 0; i < n; i++) { const t = i / fps; while (j + 1 < ts.length && ts[j + 1] - t0 <= t) j++; pick.push(j); }

const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": f.endsWith(".js") ? "text/javascript" : f.endsWith(".html") ? "text/html" : "image/jpeg" });
  fs.createReadStream(f).pipe(r);
}).listen(8790);
fs.writeFileSync(path.join(ROOT, "enc.html"), '<!doctype html><script src="node_modules/mp4-muxer/build/mp4-muxer.js"></script>');

(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
  const p = await b.newPage();
  const chunks = [];
  await p.exposeFunction("__out", s => { chunks.push(Buffer.from(s, "base64")); });
  await p.exposeFunction("__log", s => console.log(s));
  await p.goto("http://127.0.0.1:8790/enc.html");
  await p.evaluate(async (pick, fps, br, ow) => {
    const first = await createImageBitmap(await (await fetch("rec/frames/00000.jpg")).blob());
    const W = ow, H = Math.round(first.height * ow / first.width / 2) * 2;
    const { Muxer, ArrayBufferTarget } = Mp4Muxer;
    const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: "avc", width: W, height: H, frameRate: fps }, fastStart: "in-memory" });
    const enc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => __log("ERR " + e) });
    enc.configure({ codec: "avc1.640028", width: W, height: H, bitrate: br, framerate: fps, latencyMode: "quality", avc: { format: "avc" } });
    const cv = new OffscreenCanvas(W, H), cx = cv.getContext("2d"); cx.imageSmoothingQuality = "high";
    let last = -1, bmp = null;
    for (let i = 0; i < pick.length; i++) {
      if (pick[i] !== last) { last = pick[i]; bmp && bmp.close(); bmp = await createImageBitmap(await (await fetch("rec/frames/" + String(last).padStart(5, "0") + ".jpg")).blob()); cx.drawImage(bmp, 0, 0, W, H); }
      const vf = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(vf, { keyFrame: i % (fps * 4) === 0 }); vf.close();
      while (enc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 2));
      if (i % 600 === 0) __log(i + "/" + pick.length);
    }
    await enc.flush(); muxer.finalize();
    const u8 = new Uint8Array(muxer.target.buffer), CH = 3 << 20;
    for (let o = 0; o < u8.length; o += CH) { let s = ""; const sub = u8.subarray(o, o + CH); for (let k = 0; k < sub.length; k += 0x8000) s += String.fromCharCode.apply(null, sub.subarray(k, k + 0x8000)); await __out(btoa(s)); }
  }, pick, fps, +BR, +OW);
  fs.writeFileSync(out, Buffer.concat(chunks));
  console.log(out, (fs.statSync(out).size / 1048576).toFixed(1) + " MB", (n / fps).toFixed(1) + " s");
  await b.close(); srv.close();
})();
