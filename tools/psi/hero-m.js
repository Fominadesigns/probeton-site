// Мобільний фон першого екрана: лише та смуга фото, що видна на телефоні (x 14–61 %), повна висота
const puppeteer=require("puppeteer-core"),fs=require("fs");
const IMG="C:/Users/Acer/Desktop/projects/probeton-site/img/";
(async()=>{const b=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:"new",args:["--allow-file-access-from-files"]});
const p=await b.newPage();await p.goto("file:///"+IMG+"fon-heroi-3.webp");
const d=await p.evaluate(async()=>{const i=document.querySelector("img");await i.decode();const W=i.naturalWidth,H=i.naturalHeight,sx=Math.round(W*.14),sw=Math.round(W*.47);const c=document.createElement("canvas");c.width=sw;c.height=H;c.getContext("2d").drawImage(i,sx,0,sw,H,0,0,sw,H);return [c.toDataURL("image/webp",.74),sw,H]});
fs.writeFileSync(IMG+"fon-heroi-m.webp",Buffer.from(d[0].split(",")[1],"base64"));console.log(d[1],d[2],Math.round(fs.statSync(IMG+"fon-heroi-m.webp").size/1024)+"KB");await b.close()})();
