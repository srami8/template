const fs=require('node:fs');
const path=require('node:path');
const {test,expect}=require('@playwright/test');
const code=fs.readFileSync(path.join(__dirname,'../../theme/src/js/checkout-images.js'),'utf8').replace('export function','function');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
const cart=`<table class="cart-table"><tbody>${['A','B'].map(sku=>`<tr class="removeable" data-micro="cartItem" data-micro-identifier="same-product" data-micro-sku="${sku}"><td class="cart-p-image"><img src="/${sku}.svg"></td></tr>`).join('')}</tbody></table>`;
const rows=()=>['A','B'].map(sku=>`<div class="order-summary-item" data-micro="cartItem" data-micro-identifier="same-product" data-micro-sku="${sku}"><div class="cart-item-name"><a href="/same-product/">Dlouhý název stejného produktu s variantou ${sku} a dalšími údaji o materiálu</a></div><div class="cart-item-amount">1 ks</div><div class="cart-item-price">123 456 Kč</div></div>`).join('');
const checkout=()=>`<ol class="cart-header"><li class="step-1"><a href="/kosik/">Košík</a></li></ol><div class="cart-inner"><div class="cart-row"><div id="checkoutContent"><form id="original" action="/original/"><input name="unchanged" value="native"></form></div><div id="checkoutSidebar"><div id="summary-box">${rows()}</div><button id="continue">Pokračovat</button></div></div></div>`;
function html(body,kind){return `<!doctype html><html class="as-theme"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body class="${kind} ordering-process"><main id="content">${body}</main><script>window.originalForm=document.querySelector('form');window.originalLinks=[...document.querySelectorAll('.cart-item-name a')];${code}\nenhanceCheckoutImages();enhanceCheckoutImages();</script></body></html>`;}
async function setup(page,{fail=false,storageBlocked=false,badImage=false}={}){
 let cartRequests=0;
 if(storageBlocked)await page.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked')}}));
 await page.route('https://shop.test/**',route=>{
  const u=new URL(route.request().url());
  if(u.pathname==='/kosik/'){cartRequests++;return route.fulfill({status:fail?503:200,contentType:'text/html',body:html(cart,'in-kosik')});}
  // Nefunkční obrázek vrací chybovou stránku; 404 s platným SVG by prohlížeč vykreslil bez události error.
  if(u.pathname.endsWith('.svg'))return badImage?route.fulfill({status:404,contentType:'text/html',body:'Nenalezeno'}):route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>'});
  return route.fulfill({contentType:'text/html',body:html(checkout(),'in-krok-1')});
 });
 return ()=>cartRequests;
}
test('normal cart passage reuses images and distinguishes variants without replacing native nodes',async({page})=>{
 const requests=await setup(page);
 await page.goto('https://shop.test/kosik/');
 await page.goto('https://shop.test/objednavka/krok-1/');
 await expect(page.locator('.cart-item-name img')).toHaveCount(2);
 expect(requests()).toBe(1); // Pouze navštívený první krok, žádný další GET.
 await expect(page.locator('.cart-item-name img').nth(0)).toHaveAttribute('src','https://shop.test/A.svg');
 await expect(page.locator('.cart-item-name img').nth(1)).toHaveAttribute('src','https://shop.test/B.svg');
 expect(await page.evaluate(()=>document.querySelector('form')===window.originalForm&&window.originalLinks.every(e=>document.contains(e)))).toBe(true);
 await expect(page.locator('#original input')).toHaveValue('native');
 for(const width of [320,390,767,768,992,1920]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  const box=await page.locator('.cart-item-name img').first().boundingBox();
  expect(box.width).toBe(48);expect(box.height).toBe(48);
 }
});
test('direct checkout makes one request and restores images after native HTML replacement',async({page})=>{
 const requests=await setup(page);
 await page.goto('https://shop.test/objednavka/krok-1/');
 await expect(page.locator('.cart-item-name img')).toHaveCount(2);
 expect(requests()).toBe(1);
 await page.evaluate(rows=>{document.querySelector('#summary-box').innerHTML=rows;},rows());
 await expect(page.locator('.cart-item-name img')).toHaveCount(2);
 expect(requests()).toBe(1);
});
test('blocked storage still permits a single native fallback',async({page})=>{
 const requests=await setup(page,{storageBlocked:true});
 await page.goto('https://shop.test/objednavka/krok-1/');
 await expect(page.locator('.cart-item-name img')).toHaveCount(2);
 expect(requests()).toBe(1);
});
test('failed fallback preserves usable native content without retry loops',async({page})=>{
 const requests=await setup(page,{fail:true});
 await page.goto('https://shop.test/objednavka/krok-1/');
 await expect.poll(requests).toBe(1);
 await expect(page.locator('.cart-item-name img')).toHaveCount(0);
 await expect(page.locator('#continue')).toBeEnabled();
 await page.evaluate(rows=>{document.querySelector('#summary-box').innerHTML=rows;},rows());
 expect(requests()).toBe(1);
});

test('broken images are removed once and a native image is never replaced',async({page})=>{
 const requests=await setup(page,{badImage:true});
 const badImage=page.waitForResponse(r=>new URL(r.url()).pathname==='/A.svg');
 await page.goto('https://shop.test/objednavka/krok-1/');
 await badImage;
 await expect(page.locator('.cart-item-name img')).toHaveCount(0);
 expect(requests()).toBe(1);
 await page.evaluate(()=>{const e=document.createElement('img');e.src='/native.svg';document.querySelector('.cart-item-name a').prepend(e);});
 await expect(page.locator('.cart-item-name img')).toHaveAttribute('src','/native.svg');
 expect(requests()).toBe(1);
});
