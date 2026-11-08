const fs = require('fs');
const path = require('path');
const vm = require('vm');
const base = __dirname;
const read = name => fs.readFileSync(path.join(base,name),'utf8');
let packs=read('regions.js')+'\n'+read('topics.js')+'\n'+read('settings.js');
const ctx={window:{}};
vm.runInNewContext(packs,ctx);
const rp=ctx.window.REGION_PACK,tp=ctx.window.TOPIC_PACK,sp=ctx.window.SETTINGS_PACK;
const settingActions=Object.fromEntries(sp.sections.map(s=>['setting-'+s.id,{label:'设置：'+s.title.replace(/^\d+\s*·\s*/,''),target:s.id,eclipse:{...s.entry.eclipse,key:'使用本版本设置入口'},theia:{...s.entry.theia,key:'使用本版本设置入口'},result:s.summary}]));
packs+='\nwindow.SETTINGS_PACK.actions='+JSON.stringify(settingActions)+';';
const manifest=JSON.parse(read('screenshots-manifest.json'));
const screenshots=manifest.map(p=>({...p,dataUri:'data:image/png;base64,'+fs.readFileSync(path.join(base,p.file)).toString('base64')}));
packs+='\nwindow.SCREENSHOT_PACK='+JSON.stringify(screenshots).replace(/<\/script/gi,'<\\/script')+';';
const actions={...rp.actions,...tp.actions,...settingActions};
const issues=[];
for(const item of [...rp.regions,...tp.topics,...sp.sections]){
  for(const id of item.operations||[])if(!actions[id])issues.push('Missing action '+id);
  for(const d of item.diagram||[])if(!actions[d.action])issues.push('Missing diagram action '+d.action);
  for(const id of item.sourceIds||[])if(![...rp.sources,...tp.sources,...sp.sources].find(s=>s.id===id))issues.push('Missing source '+id);
}
for(const [id,a] of Object.entries(actions)){
  if(![...rp.regions,...tp.topics,...sp.sections].some(i=>i.id===a.target))issues.push('Missing target '+id+': '+a.target);
  if(!a.theia||!a.eclipse)issues.push('Missing version '+id);
}
if(rp.regions.length!==9||tp.topics.length!==5||Object.keys(actions).length<30)issues.push('Coverage incomplete');
if(issues.length)throw new Error(issues.join('\n'));
for(const p of manifest){if(!p.width||!p.height||!p.title||!p.group)issues.push('Incomplete screenshot '+p.id);}
if(issues.length)throw new Error(issues.join('\n'));
let html=read('template.html').replace('/*__STYLE__*/',()=>read('style.css')+'\n'+read('photos.css')).replace('/*__DATA__*/',()=>packs).replace('/*__APP__*/',()=>read('photos.js')+'\n'+read('app.js'));
html=html.replace(/\r\n/g,'\n');
const out=path.join(base,'../index.html');
fs.writeFileSync(out,html,'utf8');
const count=s=>(s.match(/[\u3400-\u9fff]/g)||[]).length;
const stats={file:out,bytes:Buffer.byteLength(html),regions:rp.regions.length,topics:tp.topics.length,settings:sp.sections.length,screenshots:manifest.length,actions:Object.keys(actions).length,sources:new Set([...rp.sources,...tp.sources,...sp.sources,...manifest.map(p=>({url:p.sourceUrl}))].map(s=>s.url)).size,bodyHan:rp.regions.map(r=>({id:r.id,paragraphs:count(r.paragraphs.join('')),withPitfalls:count(r.paragraphs.join('')+r.pitfalls.map(p=>p.title+p.body).join(''))})),topicHan:tp.topics.map(t=>({id:t.id,body:count(t.sections.map(s=>s.paragraphs.join('')).join(''))}))};
console.log(JSON.stringify(stats,null,2));
