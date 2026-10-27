// Třetí krok objednávky (Figma 1685:9631) nad skutečným HTML Shoptetu: levý formulář
// (fixtures/checkout-step3.html, bez skriptů a osobních údajů) a společný pravý panel.
const fs=require('node:fs'),path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
const form=fs.readFileSync(path.join(__dirname,'fixtures/checkout-step3.html'),'utf8');
const sidebar=fs.readFileSync(path.join(__dirname,'fixtures/checkout-summary-step3.html'),'utf8');
async function load(page,width=1920){
 await page.setViewportSize({width,height:1000});
 await page.route('https://shop.test/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/>'}));
 // Bez přechodů Disca (transition: all), stav se měří hned.
 await page.setContent(`<!doctype html><html class="as-theme"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><style>*{transition:none!important}</style></head><body class="desktop ordering-process in-krok-2 ums_forms_redesign--on"><div id="content-wrapper"><main id="content"><form id="order-form" action="/action/orderingProcess/Step2Validate/" method="post"><div class="cart-inner"><div class="row cart-row">${form}${sidebar}</div></div></form></main></div></body></html>`);
}
const box=(page,sel)=>page.locator(sel).first().evaluate(e=>{const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),top:r.top,bottom:r.bottom};});
// Svislá mezera mezi prvky (z nezaokrouhlených hran, řádky 1,7 dávají zlomky pixelů).
const gap=(upper,lower)=>Math.round(lower.top-upper.bottom);
const style=(page,sel,pseudo)=>page.locator(sel).first().evaluate((e,pseudo)=>{const s=getComputedStyle(e,pseudo);return {fontSize:s.fontSize,fontWeight:s.fontWeight,color:s.color,background:s.backgroundColor,radius:s.borderTopLeftRadius,border:s.borderTopColor,shadow:s.boxShadow,padding:s.padding,width:s.width,display:s.display};},pseudo||null);

test('step 3 form follows the desktop design',async({page})=>{
 await load(page);
 // Přihlášení: šedý box, ikona 32 px vlevo, odkaz v hlavní barvě.
 expect(await style(page,'#checkoutContent .helper')).toMatchObject({background:'rgb(244, 244, 244)',radius:'12px',padding:'16px 16px 16px 72px',fontSize:'16px'});
 expect(await style(page,'#checkoutContent .helper','::before')).toMatchObject({width:'32px'});
 expect((await style(page,'#order-page-login-button')).fontWeight).toBe('400');
 await expect(page.locator('#checkoutContent .form-legend')).toBeHidden();
 // Nadpisy H4 bez ikon Disca.
 for(const h of ['.co-contact-information h2','.co-billing-address h2','.stay-in-touch h2']){
  expect((await style(page,`#checkoutContent ${h}`)).fontSize,h).toBe('20px');
  expect((await style(page,`#checkoutContent ${h}`,'::before')).display,h).not.toBe('inline-block');
 }
 // Popisek nad polem 16 px, pole 52 px, mezi nimi 8 px; skupiny po 24 px.
 const name=await box(page,'#billFullName'),nameLabel=await box(page,'label[for="billFullName"]');
 expect(name).toMatchObject({w:700,h:52});
 expect(gap(nameLabel,name)).toBe(8);
 expect(await style(page,'label[for="billFullName"]')).toMatchObject({fontSize:'16px',color:'rgb(88, 93, 106)'});
 const emailLabel=await box(page,'label[for="email"]');
 expect(gap(name,emailLabel)).toBe(24);
 // Dva sloupce 338 px: e-mail s telefonem, město s PSČ.
 const email=await box(page,'#email'),phone=await box(page,'.phone-combined-input'),city=await box(page,'#billCity'),zip=await box(page,'#billZip');
 expect([email.w,phone.w,city.w,zip.w]).toEqual([338,338,338,338]);
 expect([email.h,phone.h,city.h,zip.h]).toEqual([52,52,52,52]);
 expect(phone.y).toBe(email.y);expect(zip.y).toBe(city.y);expect(phone.x-email.x).toBe(362);
 // Sekce po 40 px, volby pod adresou 24 px a mezi sebou 12 px.
 expect(gap(phone,await box(page,'.co-billing-address h2'))).toBe(40);
 const country=await box(page,'.form-control-wrapper--with-note');
 expect(country).toMatchObject({w:700,h:52});
 expect(await style(page,'.form-control-wrapper--with-note')).toMatchObject({background:'rgb(244, 244, 244)',radius:'100px'});
 const another=await box(page,'label[for="another-shipping"]'),note=await box(page,'label[for="add-note"]');
 expect(gap(country,another)).toBe(24);
 expect(gap(another,note)).toBe(12);
 expect(gap(note,await box(page,'.stay-in-touch h2'))).toBe(40);
 // Země má jeden popisek (druhý skrývá Shoptet třídou .js-location--hidden).
 expect(await page.locator('#checkoutContent .form-group:has(#billCountryId) :is(label, .label)').evaluateAll(l=>l.filter(e=>e.getBoundingClientRect().height>0).length)).toBe(1);
 // Pravý panel: souhlasy 16 px šedě, tlačítko „Objednat“ na dva řádky bez šipky.
 expect(await style(page,'#checkoutSidebar .consents .label')).toMatchObject({fontSize:'16px',color:'rgb(130, 134, 143)'});
 expect(gap(await box(page,'#checkoutSidebar .price-wrapper'),await box(page,'.consents-first'))).toBe(32);
 expect((await box(page,'#submit-order')).h).toBe(74);
 expect(await style(page,'#submit-order .order-button-text')).toMatchObject({fontSize:'20px'});
 expect(await style(page,'#submit-order .order-button-suffix')).toMatchObject({fontSize:'16px',fontWeight:'400'});
 expect((await style(page,'#submit-order','::after')).display).not.toBe('inline-block');
});

test('label stays above the field in every state and the phone shows focus and error on its wrapper',async({page})=>{
 await load(page);
 const before=await box(page,'label[for="email"]');
 await page.locator('#email').evaluate(e=>e.closest('.smart-label-wrapper').classList.add('focused','populated'));
 expect(await box(page,'label[for="email"]')).toEqual(before);
 expect((await style(page,'label[for="email"]')).fontSize).toBe('16px');
 await page.focus('#phone');
 expect(await style(page,'.phone-combined-input')).toMatchObject({border:'rgb(88, 93, 106)',shadow:'rgba(114, 114, 114, 0.39) 0px 0px 5px 0px'});
 expect((await style(page,'#phone')).shadow).toBe('none');
 await page.locator('#phone').evaluate(e=>e.classList.add('js-error-field'));
 expect((await style(page,'.phone-combined-input')).border).toBe('rgb(239, 40, 40)');
});

test('Shoptet sidebar script cannot shift the panel and lengthen the page in either checkout step',async({page})=>{
 await load(page,1440);
 for(const step of ['in-krok-2','in-krok-1']){
  await page.evaluate(step=>{document.body.classList.remove('in-krok-1','in-krok-2');document.body.classList.add(step);},step);
  const height=await page.evaluate(()=>document.documentElement.scrollHeight),top=(await box(page,'#checkoutContent')).y;
  expect(height,step).toBeGreaterThan(1000);
  // Inline styly, které při posunu píše fixSidebar (checkout-3g.js); posunutý panel by stránku prodloužil.
  for(const inline of ['position: relative; top: 400px;','position: static;']){
   await page.locator('#checkoutSidebar').evaluate((e,s)=>e.setAttribute('style',s),inline);
   expect((await box(page,'#checkoutSidebar')).y,`${step} ${inline}`).toBe(top);
   expect(await page.evaluate(()=>document.documentElement.scrollHeight),`${step} ${inline}`).toBe(height);
   expect(await page.locator('#checkoutSidebar').evaluate(e=>getComputedStyle(e).position)).toBe('relative');
  }
 }
});

test('step 3 fits every width with all sections open and keeps the native form',async({page})=>{
 await load(page);
 const names=await page.locator('#order-form').evaluate(f=>[...f.elements].map(e=>e.name).filter(Boolean));
 // Rozbalené části jako po kliknutí (Shoptet přidává .visible), nákup na firmu se selectem země.
 await page.evaluate(()=>{for(const id of ['company-info','shipping-address','note'])document.getElementById(id).classList.add('visible');for(const e of document.querySelectorAll('.js-location'))e.classList.toggle('js-location--hidden');});
 for(const width of [320,390,479,480,767,768,991,992,1199,1200,1920]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),String(width)).toBeLessThanOrEqual(1);
  const email=await box(page,'#email'),name=await box(page,'#billFullName');
  // Pod 992 px pole pod sebou, od 992 px e-mail a telefon vedle sebe.
  if(width<992)expect(email.w,String(width)).toBe(name.w);else expect(email.w,String(width)).toBeLessThan(name.w);
  for(const sel of ['#companyId','#deliveryFullName','#remark','#billCountryId'])expect((await box(page,sel)).x,`${sel} @${width}`).toBe(name.x);
  expect(await page.locator('#checkoutContent .form-group:has(#billCountryId) :is(label, .label)').evaluateAll(l=>l.filter(e=>e.getBoundingClientRect().height>0).length)).toBe(1);
 }
 expect(await page.locator('#order-form').evaluate(f=>[...f.elements].map(e=>e.name).filter(Boolean))).toEqual(names);
 await expect(page.locator('#order-form')).toHaveAttribute('action','/action/orderingProcess/Step2Validate/');
});
