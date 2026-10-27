// Textová pole, textarea a select (Figma 93:2578) v celém e-shopu: skutečný markup Shoptetu
// (plovoucí popisky, obal pole, validace) s CSS Disca jako na e-shopu.
const fs=require('node:fs'),path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
const smart=(id,label,field)=>`<div class="form-group smart-label-wrapper form-group--inline"><label for="${id}"><span class="required-asterisk">${label}</span></label><div class="form-control-wrapper js-validated-element-wrapper">${field}</div></div>`;
const body=`<main id="content"><form id="contact"><fieldset>
${smart('fullName','Jméno a příjmení','<input type="text" id="fullName" name="fullName" class="form-control js-validate js-validate-required" required>')}
${smart('email','E-mail','<input type="email" id="email" name="email" class="form-control js-validate js-validate-required" required>')}
${smart('message','Zpráva','<textarea id="message" name="message" class="form-control js-validate js-validate-required" rows="5"></textarea>')}
${smart('disabledField','Zakázané','<input type="text" id="disabledField" class="form-control" disabled value="Disabled stav">')}
<div class="form-group form-group-wrapped smart-label-wrapper populated"><label for="currency">Měna</label><select name="currency" id="currency" class="form-control"><option>CZK</option><option>EUR</option></select></div>
<div class="form-group"><label for="country">Země</label><div class="form-control-wrapper"><select id="country" class="form-control"><option>Česká republika</option></select></div></div>
<input type="text" class="form-control" id="plain" placeholder="Heslo">
</fieldset></form>
<form class="search-form"><input type="search" class="query-input form-control search-input" id="search"></form></main>`;
// Bez přechodů Disca (transition: all), stav se měří hned.
async function load(page,primary){
 await page.setContent(`<!doctype html><html class="as-theme"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><style>*{transition:none!important}</style>${primary?`<style>:root{--color-primary:${primary}}</style>`:''}</head><body class="desktop in-kontakty ums_forms_redesign--on">${body}</body></html>`);
}
const style=(page,sel,pseudo)=>page.evaluate(([sel,pseudo])=>{const e=document.querySelector(sel);const s=getComputedStyle(e,pseudo);const r=e.getBoundingClientRect();return {height:Math.round(r.height),radius:s.borderTopLeftRadius,border:s.borderTopColor,background:s.backgroundColor,color:s.color,fontSize:s.fontSize,shadow:s.boxShadow,outline:s.outlineStyle,paddingLeft:s.paddingLeft,top:s.top,right:s.right,width:s.width,content:s.content};},[sel,pseudo||null]);

test('text fields, textarea and select follow Figma on every width',async({page})=>{
 await load(page,'#d63384');
 for(const width of [320,390,767,992,1920]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),String(width)).toBeLessThanOrEqual(1);
  for(const sel of ['#fullName','#email','#plain','#currency','#country'])
   expect(await style(page,sel),`${sel} @${width}`).toMatchObject({height:52,radius:'100px',border:'rgb(213, 215, 218)',background:'rgb(255, 255, 255)',color:'rgb(46, 53, 69)',fontSize:'14px'});
 }
 expect((await style(page,'#message')).radius).toBe('26px');
 // Plovoucí popisek je v prázdném poli svisle na středu, šedý jako placeholder.
 const label=await page.evaluate(()=>{const l=document.querySelector('label[for="fullName"]'),i=document.querySelector('#fullName');const lr=l.getBoundingClientRect(),ir=i.getBoundingClientRect();return {center:Math.round(lr.top+lr.height/2-ir.top),color:getComputedStyle(l).color,size:getComputedStyle(l).fontSize};});
 expect(label).toEqual({center:26,color:'rgb(130, 134, 143)',size:'14px'});
 expect(await page.evaluate(()=>getComputedStyle(document.querySelector('#plain'),'::placeholder').color)).toBe('rgb(130, 134, 143)');
 // Select: text od 24 px, šipka v hlavní barvě z administrace na středu pole, 24 px od kraje.
 for(const [sel,wrap] of [['#currency','.form-group:has(> #currency)'],['#country','.form-control-wrapper:has(> #country)']]){
  expect((await style(page,sel)).paddingLeft).toBe('24px');
  expect(await style(page,wrap,'::after')).toMatchObject({width:'20px',right:'24px',color:'rgb(214, 51, 132)'});
  const centre=await page.evaluate(([sel,wrap])=>{const w=document.querySelector(wrap),s=document.querySelector(sel);const a=parseFloat(getComputedStyle(w,'::after').top);return Math.round(w.getBoundingClientRect().top+a-s.getBoundingClientRect().top);},[sel,wrap]);
  expect(centre,sel).toBe(26);
 }
});

test('focus, error and disabled states',async({page})=>{
 await load(page);
 await page.focus('#fullName');
 expect(await style(page,'#fullName')).toMatchObject({border:'rgb(88, 93, 106)',shadow:'rgba(114, 114, 114, 0.39) 0px 0px 5px 0px',outline:'none'});
 await page.evaluate(()=>document.querySelector('#email').classList.add('js-error-field'));
 const error=await style(page,'#email');
 expect(error).toMatchObject({border:'rgb(239, 40, 40)',color:'rgb(239, 40, 40)'});
 expect(error.shadow).toContain('0px 0px 5px 0px');
 expect(await style(page,'#disabledField')).toMatchObject({background:'rgb(244, 244, 244)',color:'rgb(88, 93, 106)',border:'rgb(213, 215, 218)'});
 // Hledání v hlavičce má vlastní vzhled i fokus.
 await page.focus('#search');
 expect((await style(page,'#search')).shadow).not.toContain('114, 114, 114');
});
