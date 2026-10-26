// Markup z živého Shoptetu a oficiálního dema Disca; částky/procenta se nemění JS.
const fs=require('node:fs');
const path=require('node:path');
const {test,expect}=require('@playwright/test');
const fragments=require('./fixtures/free-shipping.json');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
function markup() {
 const popup=fragments.popup.replace(/<div class="extra delivery">[\s\S]*?<\/span>\s*<\/div>/,fragments.step1);
 return `<!doctype html><html class="as-theme"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}\nsection{max-width:600px;margin:20px auto;padding:16px;}</style></head><body><section id="cart-widget">${fragments.widget}</section><section id="content" class="summary">${fragments.step1}</section><section id="popup">${popup}</section><section class="shipping-options-popup">${fragments.step1}</section><section id="complete">${fragments.popup}</section></body></html>`;
}

test('free shipping has identical appearance in all native contexts and preserves native progress',async({page})=>{
 await page.setContent(markup());
 for(const width of [320,390,767,768,992,1920]){
  await page.setViewportSize({width,height:1500});
  const bars=await page.locator('#cart-widget .cart-free-shipping,#content .extra.delivery,#popup .extra.delivery,.shipping-options-popup .extra.delivery').evaluateAll(els=>els.map(e=>{
   const c=getComputedStyle(e),icon=getComputedStyle(e,'::before'),p=e.querySelector('.price-range'),pc=getComputedStyle(p),fill=p.firstElementChild;
   return {font:c.fontSize,color:c.color,weight:c.fontWeight,line:c.lineHeight,icon:icon.maskImage,iconColor:icon.color,iconWidth:icon.width,trackHeight:pc.height,trackColor:pc.backgroundColor,radius:pc.borderRadius,fillColor:getComputedStyle(fill).backgroundColor,ratio:fill.getBoundingClientRect().width/p.getBoundingClientRect().width,native:fill.style.width};
  }));
  expect(bars).toHaveLength(4);
  for(const bar of bars){
   expect({...bar,ratio:undefined}).toEqual({...bars[0],ratio:undefined});
   expect(bar.trackHeight).toBe('4px');
   expect(bar.ratio).toBeCloseTo(0.16680567139283,2);
   expect(parseFloat(bar.native)).toBeCloseTo(16.680567139283,4);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 }
 // Slevová motivace v mezikroku není doprava zdarma a zůstává nativních 16 px.
 expect(await page.locator('#popup .extra.discount .price-range').evaluate(e=>getComputedStyle(e).height)).toBe('16px');
 await expect(page.locator('#complete .extra.delivery .price-range')).toHaveCount(0);
 expect(await page.locator('#complete .extra.delivery').evaluate(e=>getComputedStyle(e,'::after').height)).toBe('4px');
 await expect(page.locator('#complete .extra.delivery')).toHaveText('Dopravu máte zdarma!');
});
