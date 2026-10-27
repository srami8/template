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
        // Mobilní hlavička (Figma „Header - mobile“): účet a pole hledání vidět, lupa až v kompaktní.
        await expect(page.locator('#header .as-account-button')).toBeVisible();
        await expect(page.locator('#header .search-input')).toBeVisible();
        await expect(page.locator('#header [data-target="search"]')).toBeHidden();
        const headerBox=await page.locator('#header').boundingBox();
        expect(headerBox.height).toBeLessThanOrEqual(120);
        // Informační lišta je nad hlavičkou a obsah začíná pod ní.
        const information=await page.locator('.site-msg.information').boundingBox();
        expect(information.y+information.height).toBeLessThanOrEqual(headerBox.y+1);
        const content=await page.locator('#content').boundingBox();
        expect(content.y).toBeGreaterThanOrEqual(headerBox.y+headerBox.height-1);
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
      if(popup==='cart' && width<768) await expect(panel).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
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
  test(`mobile header compacts on scroll and keeps the native search form at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:600});
    await load(page,{navLinks:[],quickLinks:[],homeCategories:null});
    const contentTop=async()=>(await page.locator('#content').boundingBox()).y+await page.evaluate(()=>scrollY);
    const before=await contentTop();
    await page.evaluate(()=>window.originalSearchForm=document.querySelector('#header .search-form'));
    await page.evaluate(()=>window.scrollTo(0,300));
    await expect(page.locator('html')).toHaveClass(/as-header-compact/);
    // Kompaktní hlavička: lupa místo pole, obsah se neposunul.
    await expect(page.locator('#header .search')).toBeHidden();
    expect(await contentTop()).toBe(before);
    await page.evaluate(()=>window.scrollTo(0,200));
    await expect(page.locator('#header .navigation-buttons [data-target="search"]')).toBeVisible();
    await page.locator('#header .navigation-buttons [data-target="search"]').click();
    await expect(page.locator('#header .search')).toBeVisible();
    await page.locator('#header .search-input').fill('košík');
    await fits(page.locator('#header .search'),page.locator('#header .header-top-wrapper'));
    expect(await page.evaluate(()=>document.querySelector('#header .search-form')===window.originalSearchForm)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#header .search')).toBeHidden();
    await page.evaluate(()=>window.scrollTo(0,0));
    await expect(page.locator('html')).not.toHaveClass(/as-header-compact/);
    await expect(page.locator('#header .search-input')).toBeVisible();
    expect(await page.evaluate(()=>document.querySelector('#header .search-form')===window.originalSearchForm)).toBe(true);
    await noPageOverflow(page);
  });
}

test('mobile menu lists supplementary and information links',async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await load(page);
  await expect(page.locator('#header .as-navlinks')).toBeHidden();
  await page.locator('#header .navigation-buttons [data-target="navigation"]').click();
  const pages=page.locator('#navigation .as-menu-pages a');
  await expect(pages.filter({hasText:'Informace pro naše zákazníky 1'})).toBeVisible();
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

test('header icons are the same on mobile and desktop', async ({page}) => {
  await load(page);
  const read=()=>page.evaluate(()=>{
    const mask=(selector,pseudo='::before')=>getComputedStyle(document.querySelector(selector),pseudo).maskImage;
    return {
      search:mask('#header .navigation-buttons [data-target="search"]'),
      searchButton:mask('#header .search-button'),
      cart:mask('#header .navigation-buttons [data-target="cart"]'),
      menu:mask('#header .navigation-buttons [data-target="navigation"]'),
    };
  });
  await page.setViewportSize({width:375,height:800});
  const mobile=await read();
  await page.setViewportSize({width:1280,height:900});
  const desktop=await read();
  for (const icon of Object.values(mobile)) expect(icon).toContain('svg');
  expect(mobile).toEqual(desktop);
  expect(mobile.search).toBe(mobile.searchButton);
});

test('quick links row has its space reserved before the script inserts it', async ({page}) => {
  await page.setViewportSize({width:1280,height:900});
  await load(page);
  const top=()=>page.evaluate(()=>Math.round(document.querySelector('#header .header-bottom').getBoundingClientRect().top));
  const inserted=await top();
  // Stav před DOMContentLoaded: třída z konfigurace už je na <html>, řádek ještě ne.
  await page.evaluate(()=>document.querySelector('#header .as-quicklinks').remove());
  expect(await top()).toBe(inserted);
});

test('login form and search results share their look on mobile and desktop', async ({page}) => {
  await load(page);
  await showSearch(page);
  const snapshots=[];
  for (const width of [375,1280]) {
    await page.setViewportSize({width,height:900});
    snapshots.push(await page.evaluate(()=>{
      const read=(selector,pseudo)=>{
        const style=getComputedStyle(document.querySelector(selector),pseudo);
        return Object.fromEntries(['borderRadius','backgroundColor','color','fontFamily','fontSize','fontWeight','maskImage'].map(key=>[key,style[key]]));
      };
      return {
        input:{...read('#login input[name="email"]'),height:getComputedStyle(document.querySelector('#login input[name="email"]')).height},
        inputIcon:read('#login .form-control-wrapper','::before'),
        submit:read('#login .submit-wrapper .btn'),
        productName:read('.searchWhisperer__product__name'),
        price:read('.searchWhisperer__product__price'),
        tag:read('.searchWhisperer__additionalResults__link'),
        button:read('.searchWhisperer__button'),
      };
    }));
  }
  expect(snapshots[0]).toEqual(snapshots[1]);
  expect(snapshots[0].inputIcon.maskImage).toContain('svg');
});

test('default carousel banner keeps its look on mobile', async ({page}) => {
  await load(page,{banners:'default'});
  const snapshots=[];
  for (const width of [375,1280]) {
    await page.setViewportSize({width,height:900});
    snapshots.push(await page.evaluate(()=>{
      const read=selector=>{
        const style=getComputedStyle(document.querySelector(selector));
        return Object.fromEntries(['backgroundColor','borderRadius','color','fontFamily','fontWeight','position'].map(key=>[key,style[key]]));
      };
      return {
        carousel:read('#carousel'),
        title:read('#carousel .item.active .extended-banner-title'),
        text:read('#carousel .item.active .extended-banner-text'),
        link:read('#carousel .item.active .extended-banner-link'),
      };
    }));
  }
  expect(snapshots[0]).toEqual(snapshots[1]);
  expect(snapshots[0].link.borderRadius).not.toBe('0px');
});

test('mobile menu is a left drawer and its extras stay off the desktop', async ({page}) => {
  for (const width of [320,375]) {
    await page.setViewportSize({width,height:800});
    await load(page);
    await page.locator('#header .navigation-buttons [data-target="navigation"]').click();
    await page.waitForTimeout(300);
    const drawer=await page.locator('#navigation').boundingBox();
    expect(Math.round(drawer.x)).toBe(0);
    expect(Math.round(drawer.width)).toBe(Math.min(300,width-56));
    await expect(page.locator('#navigation .as-menu-close')).toBeVisible();
    await expect(page.locator('#navigation .as-menu-phone')).toBeVisible();
    await page.locator('#navigation .as-menu-close').click();
    await expect(page.locator('body')).not.toHaveClass(/navigation-window-visible/);
    await noPageOverflow(page);
  }
  await page.setViewportSize({width:1280,height:900});
  for (const selector of ['.as-menu-close','.as-menu-back','.as-menu-all','.as-menu-pages','.as-menu-phone']) {
    for (const item of await page.locator(selector).all()) await expect(item).toBeHidden();
  }
});

test('product flags, discount and quantity look the same on the product detail as in the card', async ({page}) => {
  await page.setViewportSize({width:1280,height:900});
  await load(page);
  // Markup detailu Disca (ověřený na testovacím e-shopu).
  await page.evaluate(()=>{
    const detail=document.createElement('div');
    detail.className='p-detail';
    detail.innerHTML=`<div class="p-image-wrapper" style="position:relative"><div class="p-image" style="position:relative;width:600px;height:600px"><div class="flags flags-default" style="position:absolute"><span class="flag flag-new" style="background:green">Novinka</span></div></div><div class="flags flags-extra" style="position:absolute;right:0;bottom:0"><span class="flag flag-discount"><span class="price-standard"><span>290 Kč</span></span><span class="price-save">–31 %</span></span></div></div>
      <form class="pr-action"><div class="add-to-cart"><span class="quantity"><label><input class="amount" type="number" value="1"></label><button class="increase" type="button"><span>+</span></button><button class="decrease" type="button"><span>−</span></button></span></div></form>`;
    document.querySelector('#content').append(detail);
  });
  const look=await page.evaluate(()=>{
    const read=(el,keys)=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(el)[k]]));
    const box=['borderRadius','backgroundColor','height','borderTopWidth'];
    const text=['borderRadius','fontSize','fontWeight','paddingTop','paddingLeft'];
    return {
      cardQty:read(document.querySelector('.products-block .quantity'),box),
      detailQty:read(document.querySelector('.p-detail .add-to-cart .quantity'),box),
      cardFlag:read(document.querySelector('.products-block .flag'),text),
      detailFlag:read(document.querySelector('.p-detail .flags-default .flag'),text),
      detailDiscount:read(document.querySelector('.p-detail .flag-discount'),['borderRadius','backgroundColor']),
      cardDiscount:read(document.querySelector('.products-block .price-save'),['borderRadius','backgroundColor']),
      oldPriceHidden:getComputedStyle(document.querySelector('.p-detail .flag-discount .price-standard')).display,
    };
  });
  expect(look.detailQty).toEqual(look.cardQty);
  expect(look.detailFlag).toEqual(look.cardFlag);
  expect(look.detailDiscount).toEqual(look.cardDiscount);
  expect(look.oldPriceHidden).toBe('none');
});

test('buttons are rounded everywhere, not only where they have a design', async ({page}) => {
  await load(page);
  const radii=await page.evaluate(()=>{
    const host=document.createElement('div');
    host.innerHTML=['<a class="btn btn-secondary" href="#">Náš příběh</a>','<button class="btn btn-primary">Hledat</button>','<button class="btn btn-conversion add-to-cart-button">Do košíku</button>','<button class="sortingToggle">Řadit</button>','<button class="toggle-top-prod">Zobrazit více</button>'].join('');
    document.querySelector('#content').append(host);
    return [...host.children].map(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius));
  });
  for (const radius of radii) expect(radius).toBeGreaterThanOrEqual(16);
});

test('conversion buttons use the admin conversion color with white text everywhere', async ({page}) => {
  await load(page);
  const look=await page.evaluate(()=>{
    document.documentElement.style.setProperty('--color-secondary','rgb(10, 120, 60)');
    const host=document.createElement('div');
    host.className='p-detail';
    host.innerHTML='<div class="p-to-cart-block"><button class="btn btn-conversion add-to-cart-button">Do košíku</button></div><div class="next-step"><a class="btn btn-conversion" href="#">Pokračovat</a></div>';
    document.querySelector('#content').append(host);
    return [...host.querySelectorAll('.btn-conversion')].map(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
  });
  for (const button of look) expect(button).toEqual({bg:'rgb(10, 120, 60)',color:'rgb(255, 255, 255)'});
});

test('headings follow the design everywhere and the size from settings, smaller on a phone', async ({page}) => {
  await load(page);
  const measure=()=>page.evaluate(()=>{
    let host=document.querySelector('#as-headings-test');
    if(!host){host=document.createElement('div');host.id='as-headings-test';host.innerHTML='<h1>H1</h1><h2>H2</h2><h4>H4</h4><div class="h3">H3 třídou</div>';document.querySelector('#content').append(host);}
    return [...host.children].map(el=>[parseFloat(getComputedStyle(el).fontSize),getComputedStyle(el).fontWeight]);
  });
  await page.setViewportSize({width:1280,height:900});
  expect(await measure()).toEqual([[36,'500'],[28,'500'],[20,'500'],[24,'500']]);
  // Hodnota z nastavení šablony (vkládaný kód).
  await page.addStyleTag({content:':root{--as-heading-size-h1:40px}'});
  expect((await measure())[0][0]).toBe(40);
  await page.setViewportSize({width:375,height:800});
  const mobile=await measure();
  expect(mobile[0][0]).toBeCloseTo(40*0.78,1);
  expect(mobile[1][0]).toBeCloseTo(28*0.86,1);
  expect(mobile[2][0]).toBe(20);
});

test('breadcrumbs: full-width bar with home icon on desktop, only the last link on a phone', async ({page}) => {
  await load(page);
  const add=()=>page.evaluate(()=>{
    document.querySelector('#as-breadcrumbs-test')?.remove();
    const wrap=document.createElement('div');
    wrap.id='as-breadcrumbs-test';
    wrap.className='container container-narrow content-wrapper';
    wrap.innerHTML='<div class="breadcrumbs"><span id="navigation-first"><a href="/"><span itemprop="name">Domů</span></a> <span class="navigation-bullet">/</span></span> <span id="navigation-1"><a href="/produkty/"><span itemprop="name">Produkty</span></a> <span class="navigation-bullet">/</span></span> <span id="navigation-2"><a href="/sperky/"><span itemprop="name">Šperky</span></a> <span class="navigation-bullet">/</span></span> <span id="navigation-3" data-testid="breadcrumbsLastLevel"><span itemprop="name">Dřevěný přívěsek</span></span></div>';
    document.querySelector('.overall-wrapper').prepend(wrap);
  });
  const read=()=>page.evaluate(()=>{
    const bar=document.querySelector('#as-breadcrumbs-test .breadcrumbs');
    const r=bar.getBoundingClientRect();
    const visible=[...bar.children].filter(el=>getComputedStyle(el).display!=='none').map(el=>el.textContent.trim().replace(/\s*\/$/,''));
    return {x:Math.round(r.x),width:Math.round(r.width),height:Math.round(r.height),visible,home:getComputedStyle(bar.querySelector('#navigation-first a'),'::before').maskImage.includes('svg'),viewport:document.documentElement.clientWidth};
  });
  // Šířku okna pro pruh přes celou šířku přepočítá ResizeObserver až po vykreslení.
  const settled=()=>page.waitForFunction(()=>{const r=document.documentElement;return getComputedStyle(r).getPropertyValue('--as-viewport-width').trim()===`${Math.min(r.clientWidth,r.getBoundingClientRect().width)}px`;});
  await page.setViewportSize({width:1440,height:900});
  await settled();
  await add();
  const desktop=await read();
  expect(desktop.x).toBe(0);
  expect(desktop.width).toBe(desktop.viewport);
  expect(desktop.height).toBe(40);
  expect(desktop.home).toBe(true);
  expect(desktop.visible.length).toBe(4);
  await page.setViewportSize({width:375,height:800});
  await settled();
  await add();
  const mobile=await read();
  expect(mobile.width).toBe(mobile.viewport);
  expect(mobile.visible).toEqual(['Šperky']);
  await noPageOverflow(page);
});


test('mobile cart drawer matches the design and keeps its footer reachable', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await load(page);
  await page.locator('.cart-widget-products-inner').evaluate(list=>{
    const original=list.firstElementChild;
    for(let i=0;i<12;i++) list.append(original.cloneNode(true));
  });
  const trigger=page.locator('#header .cart-count');
  await expect(trigger).not.toHaveAttribute('data-redirect','true');
  await trigger.click();
  const panel=page.locator('#cart-widget');
  await expect(panel).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  const box=await panel.boundingBox();
  expect(box.x).toBe(90);
  expect(box.y).toBe(0);
  expect(box.width).toBe(300);
  expect(box.height).toBe(844);
  expect((await panel.locator('.as-cart-header').boundingBox()).height).toBe(48);
  expect(await panel.locator('.cart-widget-products').evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
  const before=await panel.locator('.cart-widget-bottom').boundingBox();
  await panel.locator('.cart-widget-products').evaluate(el=>el.scrollTop=el.scrollHeight);
  const after=await panel.locator('.cart-widget-bottom').boundingBox();
  expect(after).toEqual(before);
  expect(after.y+after.height).toBe(844);
  await panel.locator('.as-cart-close').click();
  await expect(page.locator('body')).not.toHaveClass(/cart-window-visible/);
  await page.setViewportSize({width:1280,height:900});
  await expect(trigger).toHaveAttribute('data-redirect','true');
  await expect(page.locator('.as-cart-close')).toHaveCount(0);
});

test('mobile drawer animates both ways and backdrop dismiss survives stopped bubbling', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await load(page);
  const panel=page.locator('#cart-widget');
  const trigger=page.locator('#header .cart-count');
  // Shoptet může zastavit bublající click na překryvné vrstvě.
  await page.evaluate(()=>document.documentElement.addEventListener('click', event=>{
    if(event.target===document.body) event.stopPropagation();
  }));
  await expect(panel).toHaveCSS('visibility','hidden');
  for(let i=0;i<2;i++) {
    await trigger.click();
    await expect(panel).toHaveCSS('transition-duration','0.25s');
    await expect(panel).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
    await expect(panel).not.toHaveAttribute('inert');
    await page.mouse.click(35,400);
    await expect(page.locator('body')).not.toHaveClass(/cart-window-visible/);
    await expect(panel).toHaveAttribute('inert');
    await expect(panel).toHaveCSS('visibility','hidden');
    await expect(panel).toHaveCSS('transform','matrix(1, 0, 0, 1, 300, 0)');
    await expect(trigger).toBeFocused();
    await noPageOverflow(page);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await trigger.click();
  await expect(panel).toHaveCSS('transition-duration','0s');
  await expect(panel).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
});
