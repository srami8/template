const {test,expect} = require('@playwright/test');
const {load,showSearch} = require('./fixture.cjs');

const errors = new WeakMap();
test.beforeEach(({page})=>{
  errors.set(page,[]);
  page.on('pageerror',error=>errors.get(page).push(error.message));
});
test.afterEach(({page})=>expect(errors.get(page)).toEqual([]));

async function noPageOverflow(page) {
  const sizes=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(sizes.content,JSON.stringify(sizes)).toBeLessThanOrEqual(sizes.viewport+1);
}

async function fits(locator, container) {
  const parent=await container.boundingBox();
  const boxes=await locator.evaluateAll(elements=>elements.filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect();return{x:r.x,width:r.width}}));
  for(const box of boxes){expect(box.x).toBeGreaterThanOrEqual(parent.x-1);expect(box.x+box.width).toBeLessThanOrEqual(parent.x+parent.width+1)}
}

for(const width of [320,375,390,479,480,481,767,768,820,991,992,1024,1199,1200,1280,1440,1920]) {
  for(const header of ['v1','v2']) {
    test(`${header}: layout at ${width}px`,async({page})=>{
      await page.setViewportSize({width,height:900});
      await load(page,{header});
      await noPageOverflow(page);
      await fits(page.locator('.p-tools .btn'),page.locator('#content'));
      for(const card of await page.locator('.products-block .p').all()) {
        await fits(card.locator('.prices,.p-tools .quantity,.p-tools .btn'),card);
      }
      if(width>=768) {
        expect((await page.locator('#header').boundingBox()).height).toBeLessThanOrEqual(300);
        const boxes=await Promise.all(['.site-name','.search','.navigation-buttons'].map(selector=>page.locator(`#header .header-top-wrapper > ${selector}`).boundingBox()));
        for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
          const [a,b]=[boxes[i],boxes[j]];
          expect(a.x+a.width<=b.x+1||b.x+b.width<=a.x+1||a.y+a.height<=b.y+1||b.y+b.height<=a.y+1).toBe(true);
        }
        expect(boxes[1].width).toBeGreaterThanOrEqual(240);
        // Disco od 768 px hledání nepřesouvá pod logo a košík.
        expect(Math.abs(boxes[0].y+boxes[0].height/2-boxes[1].y-boxes[1].height/2)).toBeLessThanOrEqual(1);
        expect(Math.abs(boxes[2].y+boxes[2].height/2-boxes[1].y-boxes[1].height/2)).toBeLessThanOrEqual(1);
        await expect(page.locator('#header [data-target="search"]')).toBeHidden();
        if(width<1200) await expect(page.locator('#header .cart-price')).toBeHidden();
        else await expect(page.locator('#header .cart-price')).toBeVisible();
      }else{
        await expect(page.locator('#header .as-account-button')).toBeHidden();
        await expect(page.locator('#header [data-target="search"]')).toBeVisible();
        const headerBox=await page.locator('#header').boundingBox();
        expect(headerBox.height).toBeLessThanOrEqual(200);
        const information=await page.locator('.site-msg.information').boundingBox();
        expect(information.y).toBeGreaterThanOrEqual(headerBox.y+headerBox.height);
      }
    });
  }
}

test('search stays usable at 768px even without supplementary links',async({page})=>{
  await page.setViewportSize({width:768,height:900});
  await load(page,{navLinks:[],quickLinks:[],homeCategories:null});
  const wrapper=await page.locator('#header .header-top-wrapper').boundingBox();
  const search=await page.locator('#header .search').boundingBox();
  const actions=await page.locator('#header .navigation-buttons').boundingBox();
  expect(actions.x+actions.width).toBeLessThanOrEqual(wrapper.x+wrapper.width);
  expect(search.width).toBeGreaterThanOrEqual(240);
  expect(Math.abs(search.y+search.height/2-actions.y-actions.height/2)).toBeLessThanOrEqual(1);
});

test('supplementary links remain reachable by keyboard without growing the header',async({page})=>{
  await page.setViewportSize({width:768,height:900});
  await load(page);
  for(const selector of ['.as-navlinks']) {
    const list=page.locator(selector);
    await list.locator('a').first().focus();
    for(let i=1;i<await list.locator('a').count();i++)await page.keyboard.press('Tab');
    await expect(list.locator('a').last()).toBeFocused();
    expect(await list.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  }
  await noPageOverflow(page);
});

for(const width of [320,390,768,1024,1440]) {
  for(const empty of [false,true]) {
    test(`search ${empty?'empty':'results'} at ${width}px`,async({page})=>{
      await page.setViewportSize({width,height:768});
      await load(page);
      await showSearch(page,empty);
      await noPageOverflow(page);
      const panel=page.locator('.searchWhisperer');
      const box=await panel.boundingBox();
      expect(box.y+box.height).toBeLessThanOrEqual(768);
      await fits(panel.locator('.searchWhisperer__product,.searchWhisperer__additionalResults,.as-whisperer-contact,.as-whisperer-categories'),panel);
      if(empty){await expect(panel.locator('.as-whisperer-contact')).toHaveCount(1);await expect(panel.locator('.as-whisperer-categories li')).toHaveCount(6)}
      else await expect(panel.locator('.searchWhisperer__product')).toHaveCount(4);
    });
  }
}

for(const width of [768,1024,1440]) {
  test(`original catalog at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await load(page);
    await page.locator('.as-catalog__toggle').click();
    await page.evaluate(()=>document.querySelector('#navigation .ext').classList.add('exp'));
    await expect(page.locator('.as-catalog__toggle')).toHaveAttribute('aria-expanded','true');
    await noPageOverflow(page);
    await fits(page.locator('#navigation .menu-level-2>li'),page.locator('#navigation'));
    expect(await page.evaluate(()=>document.querySelector('#navigation')===window.originalNavigation)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('.as-catalog__toggle')).toHaveAttribute('aria-expanded','false');
  });
}

test('catalog scrolls within a short desktop viewport',async({page})=>{
  await page.setViewportSize({width:768,height:500});
  await load(page);
  await page.locator('.as-catalog__toggle').click();
  await page.evaluate(()=>document.querySelector('#navigation .ext').classList.add('exp'));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const panel=page.locator('#navigation');
  const box=await panel.boundingBox();
  expect(box.y+box.height).toBeLessThanOrEqual(500);
  expect(await panel.evaluate(el=>el.scrollHeight)).toBeGreaterThan(box.height);
  await panel.locator('.menu-level-2 a').last().focus();
  expect(await panel.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
});

test('closed catalog button does not cover search results',async({page})=>{
  await page.setViewportSize({width:1280,height:900});
  await load(page);
  await showSearch(page,true);
  const covered=await page.evaluate(()=>{
    const button=document.querySelector('.as-catalog__toggle').getBoundingClientRect();
    const element=document.elementFromPoint(button.x+20,button.y+20);
    return !!element?.closest('.searchWhisperer');
  });
  expect(covered).toBe(true);
});

test('empty cart bubble keeps its content height on a small desktop',async({page})=>{
  await page.setViewportSize({width:768,height:900});
  await load(page);
  await page.evaluate(()=>{
    const inner=document.querySelector('#cart-widget .cart-widget-inner');
    inner.classList.remove('full');
    inner.innerHTML='<div class="cart-widget-products"><div class="cart-widget-products-inner"><div class="cart-widget-product">Košík je prázdný</div></div></div>';
    document.body.classList.add('cart-window-visible');
  });
  await expect(page.locator('.as-cart-contact')).toHaveCount(1);
  expect((await page.locator('#cart-widget').boundingBox()).height).toBeLessThan(600);
});

for(const [width,height] of [[320,600],[768,500],[1024,768],[1440,900]]) {
  for(const popup of ['login','cart']) {
    test(`${popup} popup at ${width}×${height}`,async({page})=>{
      await page.setViewportSize({width,height});
      await load(page);
      await page.evaluate(popup=>document.body.classList.add(`${popup}-window-visible`),popup);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const panel=page.locator(popup==='cart'?'#cart-widget':'#login');
      const box=await panel.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x+box.width).toBeLessThanOrEqual(width);
      expect(box.y+box.height).toBeLessThanOrEqual(height);
      await noPageOverflow(page);
      if(popup==='login'){
        await page.locator('#password').fill('sample-password');
        await page.locator('.as-password-toggle').click();
        await expect(page.locator('#password')).toHaveAttribute('type','text');
        await expect(page.locator('#password')).toHaveValue('sample-password');
      }else{
        await fits(page.locator('.cart-widget-product'),panel);
        await page.locator('.cart-widget-button .btn').scrollIntoViewIfNeeded();
        const button=await page.locator('.cart-widget-button .btn').boundingBox();
        expect(button.y+button.height).toBeLessThanOrEqual(height);
      }
    });
  }
}

for(const banners of ['default','content','fullwidth','cards']) {
  test(`banner ${banners} survives resizing`,async({page})=>{
    await load(page,{banners});
    for(const width of [1920,1024,768,390,320,1440]) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await noPageOverflow(page);
    }
  });
}

test('fullwidth banner respects the stable scrollbar gutter',async({page})=>{
  await page.setViewportSize({width:1024,height:900});
  await load(page,{banners:'fullwidth'});
  await page.addStyleTag({content:'html{scrollbar-gutter:stable}'});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const banner=await page.locator('.banners-row').boundingBox();
  const body=await page.locator('body').boundingBox();
  expect(banner.x).toBeGreaterThanOrEqual(body.x-1);
  expect(banner.x+banner.width).toBeLessThanOrEqual(body.x+body.width+1);
});

test('content banner text stays below its image on mobile',async({page})=>{
  await page.setViewportSize({width:320,height:900});
  await load(page);
  const banner=page.locator('.body-banners .banner-wrapper');
  const image=await banner.locator('img').boundingBox();
  const text=await banner.locator('.extended-banner-texts').boundingBox();
  expect(text.y).toBeGreaterThanOrEqual(image.y+image.height);
  await fits(banner.locator('.extended-banner-texts,.extended-banner-title,.extended-banner-link'),banner);
});

test('an open search fits after resizing, including a short landscape viewport',async({page})=>{
  await page.setViewportSize({width:1920,height:1080});
  await load(page);
  await showSearch(page,true);
  for(const [width,height] of [[1024,768],[768,400],[390,600],[1440,900]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const panel=await page.locator('.searchWhisperer').boundingBox();
    expect(panel.height).toBeGreaterThan(0);
    expect(panel.y+panel.height).toBeLessThanOrEqual(height);
    await noPageOverflow(page);
  }
});

for(const width of [320,768,1280]) {
  test(`larger text and long account name at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await load(page);
    await page.addStyleTag({content:':root{--as-font-size-body:20px;--as-font-size-small:18px;--as-font-size-caption:16px}'});
    await page.locator('#header .as-account-button').evaluate(el=>el.textContent='Účet velkoobchodního zákazníka s velmi dlouhým názvem společnosti');
    await noPageOverflow(page);
    for(const card of await page.locator('.products-block .p').all())await fits(card.locator('.prices,.p-tools .btn'),card);
  });
}

for(const width of [320,480,481,767]) {
  test(`native mobile search toggles without replacing its form at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await load(page,{navLinks:[],quickLinks:[],homeCategories:null});
    const header=page.locator('#header');
    const height=width>480?80:50;
    await expect(page.locator('#header .search')).toBeHidden();
    expect((await header.boundingBox()).height).toBe(height);
    await page.evaluate(()=>window.originalSearchForm=document.querySelector('#header .search-form'));
    await page.locator('#header .navigation-buttons [data-target="search"]').click();
    await expect(page.locator('#header .search')).toBeVisible();
    await page.locator('#header .search-input').fill('košík');
    await fits(page.locator('#header .search'),page.locator('#header .header-top-wrapper'));
    await page.setViewportSize({width:768,height:900});
    await expect(page.locator('#header .search')).toBeVisible();
    await expect(page.locator('#header .search-input')).toHaveValue('košík');
    await expect(page.locator('#header .navigation-buttons [data-target="search"]')).toBeHidden();
    expect(await page.evaluate(()=>document.querySelector('#header .search-form')===window.originalSearchForm)).toBe(true);
    await page.setViewportSize({width,height:900});
    await page.keyboard.press('Escape');
    await expect(page.locator('#header .search')).toBeHidden();
    expect((await header.boundingBox()).height).toBe(height);
    await noPageOverflow(page);
  });
}

test('mobile supplementary links stay reachable without a tall fixed header',async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await load(page);
  expect((await page.locator('#header').boundingBox()).height).toBeLessThanOrEqual(160);
  for(const selector of ['.as-navlinks']) {
    const list=page.locator(selector);
    await list.locator('a').last().focus();
    await expect(list.locator('a').last()).toBeFocused();
    expect(await list.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  }
  await noPageOverflow(page);
});


test('quick links follow the mobile menu and return to desktop without duplicates', async ({page}) => {
  await page.setViewportSize({width:390,height:700});
  await load(page);
  await expect(page.locator('#navigation .navigation-in .as-quicklinks')).toHaveCount(1);
  await page.locator('.toggle-window[data-target="navigation"]').first().click();
  await expect(page.locator('.as-quicklinks a').first()).toBeVisible();
  await page.setViewportSize({width:1280,height:900});
  await expect(page.locator('#header > .as-quicklinks')).toHaveCount(1);
  await page.setViewportSize({width:390,height:700});
  await expect(page.locator('#navigation .navigation-in .as-quicklinks')).toHaveCount(1);
  await expect(page.locator('.as-quicklinks')).toHaveCount(1);
  await noPageOverflow(page);
});

test('cart controls share their visual style on mobile and desktop', async ({page}) => {
  await load(page);
  const snapshots=[];
  for (const width of [390,1280]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>document.body.classList.add('cart-window-visible'));
    snapshots.push(await page.evaluate(()=>{
      const read=selector=>{
        const style=getComputedStyle(document.querySelector(selector));
        return Object.fromEntries(['borderRadius','backgroundColor','color','fontFamily','fontSize'].map(key=>[key,style[key]]));
      };
      return {
        button:read('#cart-widget .cart-widget-button .btn'),
        quantity:read('#cart-widget .quantity'),
        input:read('#cart-widget .quantity .amount'),
      };
    }));
  }
  expect(snapshots[0]).toEqual(snapshots[1]);
  expect(snapshots[0].quantity.borderRadius).not.toBe('0px');
});

test('product card button keeps the design height on desktop and a touch target on mobile', async ({page}) => {
  await load(page);
  const minHeight=async width=>{
    await page.setViewportSize({width,height:900});
    return page.locator('.products-block .p .p-tools .btn').first().evaluate(el=>getComputedStyle(el).minHeight);
  };
  // Na desktopu 36 px jako počítadlo (bez vynucené minimální výšky), na mobilu aspoň 44 px.
  expect(await minHeight(1280)).not.toBe('44px');
  expect(await minHeight(390)).toBe('44px');
});
