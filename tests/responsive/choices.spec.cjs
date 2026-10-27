// Checkbox a radio (Figma 93:2578) v celém e-shopu: skutečné dvojice input + label Shoptetu
// z registrace a kontaktního kroku objednávky, s CSS Disca jako na e-shopu.
const fs=require('node:fs'),path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
const body=`<main id="content">
<fieldset class="box box-bg-transparent co-box co-registration"><h2>Typ zákazníka</h2>
 <div class="form-group"><input type="radio" name="customerGroupId" value="1" id="retail" class="radio" checked="checked"><label for="retail" class="whole-width"><strong>Koncový zákazník</strong> </label></div>
 <div class="form-group"><input type="radio" name="customerGroupId" value="2" id="wholesale" class="radio"><label for="wholesale" class="whole-width"><strong>Velkoobchod</strong></label></div>
</fieldset>
<div class="form-group company-shopping unveil-wrapper"><input type="checkbox" name="companyShopping" id="company-shopping" value="1" data-unveil="company-info"><label for="company-shopping" class="whole-width">Nakupuji na firmu</label></div>
<fieldset class="stay-in-touch"><h2>Zůstaňme v kontaktu</h2><div class="form-group"><input type="checkbox" name="doNotSendNewsletter" id="sendNewsletter" value="0"><label for="sendNewsletter" class="whole-width">Nepřeji si odebírat newslettery</label></div></fieldset>
<div class="form-group js-validated-element-wrapper consents consents-first"><input type="checkbox" name="productRatingRequestOptOut" id="consent" value="1"><label for="consent" class="whole-width">Nesouhlasím se zasláním žádosti o hodnocení e-shopu a produktů a souhlasím s <a href="/obchodni-podminky/">obchodními podmínkami</a></label></div>
<div class="form-group"><input type="checkbox" id="disabled" disabled checked><label for="disabled">Zakázaná volba</label></div>
<form class="rating-form"><div class="rating-stars-wrapper"><label class="rating-star"><input type="radio" name="score" value="1" id="star"></label></div></form>
<div class="advanced-filters-wrapper"><input class="advanced-parameter-input" type="checkbox" id="swatch"><label class="advanced-parameter" for="swatch"><span class="advanced-parameter-inner"></span></label></div>
</main>`;
async function load(page,primary){
 await page.setContent(`<!doctype html><html class="as-theme"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style>${primary?`<style>:root{--color-primary:${primary}}</style>`:''}</head><body class="desktop in-registrace">${body}</body></html>`);
}
const mark=(page,id,pseudo='::before')=>page.evaluate(([id,pseudo])=>{const l=document.querySelector(`#${id} + label`);const s=getComputedStyle(l,pseudo);const lr=l.getBoundingClientRect();return {content:s.content,width:s.width,height:s.height,top:s.top,left:s.left,radius:s.borderTopLeftRadius,borderWidth:s.borderTopWidth,borderColor:s.borderTopColor,background:s.backgroundColor,labelHeight:lr.height,paddingLeft:getComputedStyle(l).paddingLeft};},[id,pseudo]);

test('checkbox and radio follow Figma and the admin primary colour',async({page})=>{
 await load(page,'#d63384');
 const box=await mark(page,'sendNewsletter');
 expect(box).toMatchObject({width:'22px',height:'22px',radius:'6px',borderWidth:'1px',borderColor:'rgb(213, 215, 218)',background:'rgb(255, 255, 255)',paddingLeft:'30px'});
 await page.click('label[for="sendNewsletter"]');
 await expect(page.locator('#sendNewsletter')).toBeChecked();
 expect(await mark(page,'sendNewsletter')).toMatchObject({borderColor:'rgb(214, 51, 132)',background:'rgb(214, 51, 132)'});
 expect(await mark(page,'sendNewsletter','::after')).toMatchObject({width:'16px',height:'16px',top:'3px',left:'3px',background:'rgb(255, 255, 255)'});
 expect(await mark(page,'retail')).toMatchObject({width:'22px',height:'22px',radius:'50%',borderWidth:'7px',borderColor:'rgb(214, 51, 132)',background:'rgb(255, 255, 255)'});
 expect(await mark(page,'wholesale')).toMatchObject({borderWidth:'1px',borderColor:'rgb(213, 215, 218)'});
 await page.click('label[for="wholesale"]');
 await expect(page.locator('#wholesale')).toBeChecked();
 expect(await mark(page,'wholesale')).toMatchObject({borderWidth:'7px',borderColor:'rgb(214, 51, 132)'});
 // Zakázané zaškrtnuté pole: bílá ikona zůstává na šedém čtverci.
 expect(await mark(page,'disabled')).toMatchObject({borderColor:'rgb(130, 134, 143)',background:'rgb(130, 134, 143)'});
});

test('long consent wraps with the box at its first line on every width',async({page})=>{
 await load(page);
 for(const width of [320,390,767,992,1920]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),String(width)).toBeLessThanOrEqual(1);
  const consent=await mark(page,'consent');
  expect(consent).toMatchObject({top:'0px',left:'0px',width:'22px'});
  if(width<=390)expect(consent.labelHeight).toBeGreaterThan(22);
  expect(await mark(page,'company-shopping')).toMatchObject({top:'0px',labelHeight:22});
 }
 await expect(page.locator('#consent + label a')).toBeVisible();
});

test('rating stars and colour swatches keep their own look',async({page})=>{
 await load(page);
 // Input hvězdičky je uvnitř labelu: globální skrytí ani kolečko se ho netýká.
 expect(await page.evaluate(()=>getComputedStyle(document.querySelector('#star')).clip)).not.toBe('rect(0px, 0px, 0px, 0px)');
 expect(await page.evaluate(()=>getComputedStyle(document.querySelector('.rating-star'),'::before').width)).not.toBe('22px');
 const swatch=await mark(page,'swatch');
 expect(swatch.paddingLeft).not.toBe('30px');
 expect(swatch.width).not.toBe('22px');
});
