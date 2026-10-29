// Izolovaná regrese skutečného HTML Disca. Stub pouze přepíná nativní rozbalení;
// nativní AJAX, kupony a přechod do dalšího kroku se kontrolují zvlášť na e-shopu.
const fs=require('node:fs');
const path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
const original=fs.readFileSync(path.join(__dirname,'fixtures/cart-step1.html'),'utf8');
// Skript bez modulů: import panelu se nahradí obsahem drawer.js.
const drawer=fs.readFileSync(path.join(__dirname,'../../theme/src/js/drawer.js'),'utf8').replace('export function','function');
const code=fs.readFileSync(path.join(__dirname,'../../theme/src/js/cart-step.js'),'utf8').replace(/^import .*$/m,drawer).replace('export function','function');
function html(content=original){return `<!doctype html><html class="as-theme" lang="cs"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body class="in-kosik ordering-process ums_forms_redesign--on ums_page_element_headings--on"><div id="content-wrapper" class="container"><div class="content-wrapper-in"><main id="content" class="content wide"><div class="content-inner">${content}</div></main></div></div></body></html>`;}
async function load(page,content=original){
 await page.setContent(html(content));
 await page.addScriptTag({content:`
 document.addEventListener('click',e=>{const t=e.target.closest('.show-related');if(t){e.preventDefault();const row=t.closest('tr');row.classList.toggle('related-visible');row.nextElementSibling.classList.toggle('visible');}const b=e.target.closest('.toggle-coupon-input-button');if(b){const open=b.classList.toggle('discount-coupon-visible');b.nextElementSibling.style.display=open?'block':'none';}});
 ${code}\nenhanceCartStep();`});
}

test('cart keeps native forms and controls, enables keyboard expansion and restores it after native replacement',async({page})=>{
 await load(page);
 const before=await page.evaluate(()=>{
  window.cartBefore={forms:[...document.querySelectorAll('form')],inputs:[...document.querySelectorAll('input')]};
  return {forms:window.cartBefore.forms.length,inputs:window.cartBefore.inputs.length,nodes:document.querySelectorAll('#cart-wrapper *').length};
 });
 await page.evaluate(()=>{document.dispatchEvent(new CustomEvent('ShoptetDOMCartContentLoaded'));document.dispatchEvent(new CustomEvent('ShoptetDOMCartContentLoaded'));});
 expect(await page.evaluate(()=>window.cartBefore.forms.every(e=>document.contains(e))&&window.cartBefore.inputs.every(e=>document.contains(e)))).toBe(true);
 expect(await page.locator('#cart-wrapper *').count()).toBe(before.nodes);
 await expect(page.locator('form')).toHaveCount(before.forms);
 await expect(page.locator('input')).toHaveCount(before.inputs);
 const toggle=page.locator('.show-related').first();
 await expect(toggle).toHaveAttribute('tabindex','0');
 await expect(toggle).not.toHaveAttribute('aria-hidden','true');
 await toggle.press('Space');
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('tr.related').first()).toBeVisible();
 await page.locator('.toggle-coupon-input-button').click();
 await expect(page.locator('.toggle-coupon-input-button')).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#discountCouponCode')).toBeVisible();
 await page.locator('.quantity .increase').first().focus();
 // Simulace pouze výměny HTML, kterou dělá getCartContent; přepočet se zde neimituje.
 await page.evaluate(content=>{document.querySelector('.content-inner').innerHTML=content;document.dispatchEvent(new CustomEvent('ShoptetDOMCartContentLoaded'));},original);
 await expect(page.locator('.show-related').first()).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('tr.related').first()).toBeVisible();
 await expect(page.locator('.quantity .increase').first()).toBeFocused();
 // Druhá výměna bez nového focusin: obnova musí uložit i nově zaměřené tlačítko.
 await page.evaluate(content=>{document.querySelector('.content-inner').innerHTML=content;document.dispatchEvent(new CustomEvent('ShoptetDOMCartContentLoaded'));},original);
 await expect(page.locator('.quantity .increase').first()).toBeFocused();
 await expect(page.locator('.quantity-form').first()).toHaveAttribute('action','/action/Cart/setCartItemAmount/');
 await expect(page.locator('[data-testid="formDiscountCoupon"]')).toHaveAttribute('action','/action/Cart/addDiscountCoupon/');
 await expect(page.locator('#continue-order-button')).toHaveAttribute('href','/objednavka/krok-1/');
});

test('cart cards and actions fit with long product names and prices across breakpoints',async({page})=>{
 const longName='Velmi dlouhý název výrobku s variantou, vlastní úpravou a podrobným označením materiálu '.repeat(3);
 const content=original.replaceAll('Dřevěný přívěsek Bracken Pendant',longName).replaceAll('590 Kč','123 456 789 Kč');
 await load(page,content);
 for(const state of ['closed','open']){
  if(state==='open'){await page.locator('.show-related').first().press('Enter');await page.locator('.toggle-coupon-input-button').click();}
  for(const width of [320,390,479,480,767,768,991,992,1199,1200,1920]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),`${width}, ${state}`).toBeLessThanOrEqual(1);
   const boxes=await page.locator('.cart-table tr.removeable').evaluateAll(rows=>rows.map(row=>{const r=row.getBoundingClientRect(),b=row.querySelector('.p-total .remove-item').getBoundingClientRect();return {left:r.left,right:r.right,removeLeft:b.left,removeRight:b.right,opacity:getComputedStyle(row.querySelector('.remove-item')).opacity};}));
   boxes.forEach(r=>{expect(r.removeLeft).toBeGreaterThanOrEqual(r.left);expect(r.removeRight).toBeLessThanOrEqual(r.right);expect(r.opacity).toBe('1');});
   await expect(page.locator('#continue-order-button')).toBeVisible();
   const action=await page.locator('#continue-order-button').boundingBox();
   expect(action.x+action.width).toBeLessThanOrEqual(width);
   if(state==='open'){
    await expect(page.locator('tr.related').first()).toBeVisible();
    await expect(page.locator('#discountCouponCode')).toBeVisible();
   }
   const tops=await page.locator('.cart-header .step > :is(a,strong)').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().top));
   expect(Math.max(...tops)-Math.min(...tops)).toBeLessThanOrEqual(1);
  }
 }
});

test('mobile cart follows Figma 1686:10094 and related products open in a drawer',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await load(page);
 const box=sel=>page.locator(sel).first().evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};});
 const row='.cart-table tr.removeable:has(.show-related)';
 // Kroky v jednom řádku, popisek jen u aktivního kroku.
 const steps=await page.locator('.cart-header .step > :is(a,strong)').evaluateAll(els=>els.map(e=>({top:Math.round(e.getBoundingClientRect().top),label:e.querySelector('span').getBoundingClientRect().width})));
 expect(new Set(steps.map(s=>s.top)).size).toBe(1);
 expect(steps.map(s=>s.label>1)).toEqual([true,false,false]);
 expect((await box('.cart-header')).h).toBe(56);
 // Karta: obrázek 48, název, dostupnost a související po 4 px; dole počítadlo, cena za kus nad součtem a křížek.
 const card=await box(row),image=await box(`${row} .cart-p-image img`),name=await box(`${row} .main-link`);
 const availability=await box(`${row} .product-table-name-footer`),related=await box(`${row} .show-related`);
 expect([image.w,image.h]).toEqual([48,48]);
 expect(Math.round(name.x-image.right)).toBe(8);
 expect(Math.round(availability.y-name.bottom)).toBe(4);
 expect(Math.round(related.y-availability.bottom)).toBe(4);
 const unit=await box(`${row} .p-price`),total=await box(`${row} .p-total .price-final`),quantity=await box(`${row} .p-quantity .quantity`);
 const remove=await page.locator(`${row} .p-total .remove-item`).first().evaluate(e=>{const r=e.getBoundingClientRect(),i=getComputedStyle(e,'::before');return {center:r.x+r.width/2,mid:r.y+r.height/2,icon:i.width};});
 expect(Math.round(unit.y-related.bottom)).toBe(20);
 expect(Math.round(total.y-unit.bottom)).toBe(2);
 expect(Math.round(unit.right)).toBe(Math.round(total.right));
 expect(Math.abs((quantity.y+quantity.h/2)-(unit.y+total.bottom)/2)).toBeLessThanOrEqual(1);
 expect(Math.abs(remove.mid-(unit.y+total.bottom)/2)).toBeLessThanOrEqual(1);
 expect(remove.icon).toBe('16px');
 expect(Math.round(card.right-17-(remove.center+8))).toBe(0);
 // Zpět do obchodu 32 px pod shrnutím na středu.
 const summary=await box('.summary > .col-md-4'),back=await box('.next-step-back');
 expect(Math.round(back.y-summary.bottom)).toBe(32);
 expect(Math.abs(back.x+back.w/2-195)).toBeLessThanOrEqual(1);
 // Panel souvisejících produktů: zavřený mimo obrazovku a mimo Tab, po otevření 300 px vpravo.
 const panel=page.locator('tr.related').first(),toggle=page.locator(`${row} .show-related`).first();
 expect(await panel.evaluate(e=>({inert:e.inert,visibility:getComputedStyle(e).visibility}))).toEqual({inert:true,visibility:'hidden'});
 await toggle.click();
 await expect(panel).toHaveAttribute('role','dialog');
 await expect(panel.locator(':scope > td > button')).toBeFocused();
 await expect.poll(()=>panel.evaluate(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.width),Math.round(r.height)];})).toEqual([90,300,844]);
 expect(await page.evaluate(()=>({overlay:getComputedStyle(document.body,'::before').content,overflow:getComputedStyle(document.body).overflow}))).toEqual({overlay:'""',overflow:'hidden'});
 const item=await panel.locator('.cart-related-product').first().evaluate(e=>{const b=e.querySelector('.btn').getBoundingClientRect();return {button:[b.width,b.height],font:getComputedStyle(e.querySelector('.btn')).fontSize,label:e.querySelector('.btn').getAttribute('aria-label'),price:getComputedStyle(e.querySelector('.price-final')).fontSize};});
 expect(item).toMatchObject({button:[44,44],font:'0px',price:'16px'});
 expect(item.label).toContain('Do košíku');
 // Tab zůstává v panelu, Esc zavře a vrátí fokus na odkaz.
 for(let i=0;i<8;i++){await page.keyboard.press('Tab');expect(await panel.evaluate(e=>e.contains(document.activeElement))).toBe(true);}
 await page.keyboard.press('Escape');
 await expect(panel).not.toHaveClass(/visible/);
 await expect(toggle).toBeFocused();
 await expect(toggle).toHaveAttribute('aria-expanded','false');
 // Klepnutí mimo panel ho zavře, křížek také.
 await toggle.click();
 await page.mouse.click(40,400);
 await expect(panel).not.toHaveClass(/visible/);
 await toggle.click();
 await panel.locator(':scope > td > button').click();
 await expect(panel).not.toHaveClass(/visible/);
 expect(await panel.evaluate(e=>e.inert)).toBe(true);
 // Na počítači zůstává rozbalení pod kartou bez dialogu a bez křížku.
 await page.setViewportSize({width:1200,height:900});
 await expect(panel).not.toHaveAttribute('role','dialog');
 await toggle.click();
 await expect(panel.locator(':scope > td > button')).toBeHidden();
 expect((await box('tr.related')).y).toBeGreaterThan(card.y);
});
