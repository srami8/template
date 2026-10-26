// Izolovaná regrese skutečného HTML Disca. Stub pouze přepíná nativní rozbalení;
// nativní AJAX, kupony a přechod do dalšího kroku se kontrolují zvlášť na e-shopu.
const fs=require('node:fs');
const path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
const original=fs.readFileSync(path.join(__dirname,'fixtures/cart-step1.html'),'utf8');
const code=fs.readFileSync(path.join(__dirname,'../../theme/src/js/cart-step.js'),'utf8').replace('export function','function');
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
