// Шрифти Google → на сам сайт: качаємо woff2 (лише кирилиця й латиниця), пишемо src/fonts.css з локальними адресами
const fs=require("fs"),path=require("path");
const ROOT="C:/Users/Acer/Desktop/projects/probeton-site/";
const URL="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Geologica:wght@500;700;800;900&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap";
const UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
(async()=>{
  const css=await (await fetch(URL,{headers:{"user-agent":UA}})).text();
  const blocks=[...css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face\s*\{[^}]*\})/g)].filter(m=>["cyrillic","cyrillic-ext","latin","latin-ext"].includes(m[1]));
  fs.mkdirSync(ROOT+"fonts",{recursive:true});
  const seen={};let out="";
  for(const [,sub,b] of blocks){
    const fam=b.match(/font-family:\s*'([^']+)'/)[1].replace(/\s+/g,"-").toLowerCase(), w=b.match(/font-weight:\s*(\d+)/)[1], u=b.match(/url\((https:[^)]+)\)/)[1];
    if(!seen[u]){const name=fam+"-"+sub+"-"+(Object.keys(seen).length)+".woff2";fs.writeFileSync(ROOT+"fonts/"+name,Buffer.from(await (await fetch(u)).arrayBuffer()));seen[u]=name;}
    out+=b.replace(u,"fonts/"+seen[u]).replace(/\s+/g," ")+"\n";
  }
  fs.writeFileSync(ROOT+"src/fonts.css",out);
  console.log(blocks.length,"faces,",Object.keys(seen).length,"files");
  for(const f of Object.values(seen))console.log(f,Math.round(fs.statSync(ROOT+"fonts/"+f).size/1024)+"KB");
})();
