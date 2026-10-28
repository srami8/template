// Text tlačítek podle kontrastu s barvou z administrace (tokens on-color, tools/button): plné
// tlačítko má bílý, nebo tmavý text podle vyššího kontrastu (WCAG), obrysové tmavý text a po
// najetí se vyplní barvou rámečku se stejným pravidlem. Barvy obchodníka jsou proměnné Shoptetu.
const fs=require('node:fs'),path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
const WHITE=[255,255,255],DARK=[46,53,69];
// Žlutá, dnešní modrá, tmavě modrá, červená a zelená těsně u hranice obou kontrastů.
const colors=['#FFD400','#1E9FE8','#0B3D91','#E53935','#2CA100'];
const lum=([r,g,b])=>{const c=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;};return 0.2126*c(r)+0.7152*c(g)+0.0722*c(b);};
const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+0.05)/(y+0.05);};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const near=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<=1);

async function load(page,color){
 await page.setContent(`<!doctype html><html class="as-theme" lang="cs"><head><style>:root{--color-primary:${color};--color-primary-hover:${color};--color-secondary:${color};--color-secondary-hover:${color}}</style><style>${css}</style><style>*{transition:none!important}</style></head><body class="in-kosik"><a class="btn btn-conversion" href="#">Pokračovat</a><div class="discount-coupon"><button class="btn" type="button">Použít</button></div></body></html>`);
}
// Vypočtená barva (i color(xyz-d65 …)) převedená přes canvas na RGB.
const rgb=(page,sel,prop)=>page.locator(sel).first().evaluate((e,prop)=>{const c=document.createElement('canvas').getContext('2d');c.fillStyle=getComputedStyle(e)[prop];c.fillRect(0,0,1,1);return [...c.getImageData(0,0,1,1).data.slice(0,3)];},prop);

for(const color of colors)test(`button text follows the higher contrast on ${color}`,async({page})=>{
 await load(page,color);
 const bg=hex(color),best=ratio(WHITE,bg)>=ratio(DARK,bg)?WHITE:DARK;
 // Plné tlačítko.
 expect(near(await rgb(page,'.btn-conversion','backgroundColor'),bg)).toBe(true);
 expect(near(await rgb(page,'.btn-conversion','color'),best),`plné ${color}`).toBe(true);
 // Obrysové: v klidu tmavý text na bílé, rámeček v barvě; po najetí plné se stejným pravidlem.
 const outline='.discount-coupon .btn';
 expect(near(await rgb(page,outline,'color'),DARK)).toBe(true);
 expect(near(await rgb(page,outline,'backgroundColor'),WHITE)).toBe(true);
 expect(near(await rgb(page,outline,'borderTopColor'),bg)).toBe(true);
 await page.hover(outline);
 expect(near(await rgb(page,outline,'backgroundColor'),bg)).toBe(true);
 expect(near(await rgb(page,outline,'color'),best),`obrysové po najetí ${color}`).toBe(true);
});

// Stavy podle Figmy 1689:13982 pro třídy Disca všude: plné po najetí v hover barvě ze Shoptetu,
// obrysové po najetí plné, zakázané šedé (i po najetí). Hover barva je jiná než základní.
test('button states follow the design for every Disco button class',async({page})=>{
 await page.setContent(`<!doctype html><html class="as-theme" lang="cs"><head><style>:root{--color-primary:#1E9FE8;--color-primary-hover:#444444;--color-secondary:#1E9FE8;--color-secondary-hover:#1777AE}</style><style>${css}</style><style>*{transition:none!important}</style></head><body><div id="b">
  <button class="btn btn-conversion">Koupit</button><button class="btn btn-cart">Do košíku</button><button class="btn btn-default">Další</button>
  <button class="btn btn-primary">Odeslat</button><button class="btn btn-secondary">Načíst další</button>
  <button class="btn btn-conversion" disabled>Zakázané</button><a class="btn btn-cart disabled" href="#">Zakázané</a><button class="btn btn-primary" disabled>Zakázané</button>
 </div></body></html>`);
 const nth=i=>`#b > :nth-child(${i})`;
 for(const i of [1,2,3]){
  expect(near(await rgb(page,nth(i),'backgroundColor'),hex('#1E9FE8')),`plné ${i}`).toBe(true);
  await page.hover(nth(i));
  expect(near(await rgb(page,nth(i),'backgroundColor'),hex('#1777AE')),`plné po najetí ${i}`).toBe(true);
  expect(near(await rgb(page,nth(i),'color'),WHITE)).toBe(true);
 }
 for(const i of [4,5]){
  expect(near(await rgb(page,nth(i),'backgroundColor'),WHITE),`obrysové ${i}`).toBe(true);
  expect(near(await rgb(page,nth(i),'color'),DARK)).toBe(true);
  await page.hover(nth(i));
  expect(near(await rgb(page,nth(i),'backgroundColor'),hex('#1E9FE8')),`obrysové po najetí ${i}`).toBe(true);
 }
 // Zakázané: #F4F4F4, text #82868F; plné bez viditelného rámečku, obrysové s šedým #D5D7DA.
 for(const [i,border] of [[6,'#F4F4F4'],[7,'#F4F4F4'],[8,'#D5D7DA']]){
  await page.hover(nth(i),{force:true});
  expect(near(await rgb(page,nth(i),'backgroundColor'),hex('#F4F4F4')),`zakázané ${i}`).toBe(true);
  expect(near(await rgb(page,nth(i),'color'),hex('#82868F'))).toBe(true);
  expect(near(await rgb(page,nth(i),'borderTopColor'),hex(border))).toBe(true);
  expect(await page.locator(nth(i)).evaluate(e=>getComputedStyle(e).cursor)).toBe('not-allowed');
 }
});
