const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const dist = process.env.RESPONSIVE_THEME_DIST || path.join(root, 'theme/dist');
// Základ a všechny soubory variant (platí jen se svou třídou na <html>, jako na e-shopu).
const css = ['base-blank.css', 'asteroid.css', ...fs.readdirSync(dist).filter((file) => file.endsWith('.css') && !['asteroid.css', 'base-blank.css'].includes(file)).sort()]
  .map((file) => fs.readFileSync(path.join(dist, file), 'utf8')).join('\n');
const js = fs.readFileSync(path.join(dist, 'asteroid.js'), 'utf8');
const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="100" viewBox="0 0 240 100"%3E%3Crect width="240" height="100" fill="%23e6e8eb"/%3E%3C/svg%3E';
const img = (className = '') => `<img class="${className}" src='${image}' alt="">`;
const name = 'Velmi dlouhý název produktu i kategorie pro kontrolu zalamování';
const quantity = `<span class="quantity"><label><input class="amount" type="number" value="1" aria-label="Množství"></label><button class="increase" type="button" aria-label="Zvýšit"><span>+</span></button><button class="decrease" type="button" aria-label="Snížit"><span>−</span></button></span>`;
const product = () => `<div class="product"><div class="p"><a class="image" href="/produkt">${img()}<span class="flags flags-default"><span class="flag" style="background:#ef2828;color:white">Akce</span></span></a><div class="p-in"><div class="p-in-in"><a class="name" href="/produkt">${name}</a><div class="ratings-wrapper"><span class="stars-placeholder">★★★★★</span><span class="availability">Skladem</span></div></div><div class="p-bottom"><div data-micro="offer"><div class="prices"><span class="price-final"><strong>123 456 Kč</strong></span><span class="price-standard">198 765 Kč</span><span class="price-save">(−31 %)</span></div><div class="p-tools"><form class="pr-action" action="/action/Cart/addCartItem/">${quantity}<button class="btn btn-conversion" type="submit">Přidat do košíku</button></form></div></div></div></div></div></div>`;
const category = () => `<li><a class="menu-image" href="/kategorie">${img()}</a><div><a href="/kategorie">${name}</a><ul class="menu-level-3"><li><a href="/podkategorie">Dlouhá podkategorie</a></li></ul></div></li>`;
const banner = (i, active = true) => `<div class="item ${active ? 'active' : ''}"><a href="/banner-${i}">${img()}<span class="extended-banner-texts"><span class="extended-banner-title">Nová kolekce</span><span class="extended-banner-text">Objevte naši nabídku</span><span class="extended-banner-link">Prohlédnout</span></span></a></div>`;
const cartItem = () => `<div class="cart-widget-product"><div class="cart-widget-product-image"><a href="/produkt">${img()}</a></div><div class="cart-widget-product-name"><a href="/produkt">${name}</a></div><div class="cart-widget-product-amount"><form class="quantity-form">${quantity}</form></div><div class="cart-widget-product-price"><strong>123 456 Kč</strong></div><div class="cart-widget-product-delete"><button class="remove-item" aria-label="Odebrat"><span class="sr-only">Odebrat</span></button></div></div>`;

// Izolovaná fixture dokumentovaného rozhraní Disca, nikoli kopie jeho produkčního HTML/CSS.
// Testuje geometrii naší nadstavby; skutečné skripty, AJAX a vzhled Disca vyžadují testovací e-shop.
function html() {
  return `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;font-size:16px}a{color:inherit}button,input{font:inherit}img{max-width:100%}.container{width:100%;margin:auto;padding:0 20px}.container::before,.container::after{content:"";display:table}.container::after{clear:both}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}@media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  .top-navigation-bar .container,.top-navigation-tools{display:flex;align-items:center}.top-navigation-bar ul{list-style:none;margin:0;padding:0}.dropdown{display:inline-block}.dropdown-menu{display:none}.header-top-wrapper{position:relative;display:flex;align-items:center}.site-name{margin:0}.site-name img{width:200px;height:48px}.search{width:600px}.search form{display:flex}.search fieldset{display:flex}.search-input{width:100%;height:48px}.navigation-buttons{display:flex;align-items:center}.navigation-buttons>a,.navigation-buttons>button{flex-shrink:0}.cart-count i{font-style:normal}.navigation-buttons a{text-decoration:none}.header-bottom{border-top:1px solid #eee}#navigation{position:relative}.navigation-in ul{list-style:none;margin:0;padding:0}.menu-level-1{display:flex}.menu-level-1>li>a{display:block;padding:12px}.menu-level-2{display:none;position:absolute}.menu-level-1>li.exp>.menu-level-2{display:block}.menu-level-3{list-style:none}.menu-helper{display:none}
  .searchWhisperer{display:none;position:absolute}.searchWhisperer.active{display:block}.searchWhisperer ul{list-style:none;margin:0;padding:0}.searchWhisperer__product{display:flex}.searchWhisperer__product__image{width:64px}.searchWhisperer__product__infoWrapper{flex:1}.searchWhisperer__product__price{white-space:nowrap}
  #content{padding:20px}.banners-row{margin:0 -20px}.banners-row>div{width:100%}.carousel-inner{position:relative;overflow:hidden}.carousel-inner>.item{display:none;position:relative}.carousel-inner>.active{display:block}.carousel-inner>.item>a{display:block}.carousel-inner img{width:100%;display:block}.extended-banner-texts{position:absolute;inset:0;display:block}.carousel-control{position:absolute}.banner-wrapper{position:relative}.banner-wrapper>a{display:block}.banner-wrapper img{display:block}.products-block{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.products-block .product{min-width:0}.p{height:100%}.p .image img{width:100%}.subcategories{display:flex;flex-wrap:wrap;list-style:none}.contact-box{overflow-wrap:anywhere}
  @media(min-width:768px){.products-block{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(min-width:1200px){.products-block{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(min-width:1440px){.products-block{grid-template-columns:repeat(6,minmax(0,1fr))}}
  .popup-widget{display:none;position:absolute;z-index:1003;top:80px;right:20px;width:calc(100% - 40px);background:white}.login-window-visible #login,.cart-window-visible #cart-widget{display:block}.popup-widget-inner{padding:20px}.form-control-wrapper{position:relative}.form-control-wrapper>input{width:100%;height:52px}.login-form{display:block}.cart-widget-product{display:flex;flex-wrap:wrap;padding:12px;gap:8px}.cart-widget-product-image{width:48px}.cart-widget-product-name{flex:1;min-width:0}.cart-widget-product-name a{overflow-wrap:anywhere}.cart-widget-products-inner{display:block}
  @media(max-width:767px){.top-navigation-bar{display:none}.header-top-wrapper{min-height:50px;padding:0}.site-name{flex:0 1 100px;min-width:0}.site-name a{display:block}.site-name img{display:block;max-width:100%;max-height:40px;height:auto}.navigation-buttons{gap:0;margin-left:auto}.navigation-buttons>[data-target]{width:50px;height:50px;min-width:50px;min-height:50px}.cart-price{display:none}.header-bottom{display:none}.search{display:none}.search-window-visible #header .search{display:block;position:absolute;top:100%;left:0;width:100%;padding:16px;background:white}.searchWhisperer.active{left:0;right:0;width:100%;top:100%;background:white}.searchWhisperer__product{padding:12px;gap:8px}.searchWhisperer__product__infoWrapper{min-width:0}.searchWhisperer__product__name{overflow-wrap:anywhere}.searchWhisperer__product__price{font-size:13px}}
  /* Nativní utilita Disca řídí viditelnost ceny košíku, nesmí ji přebít nadstavba. */
  .visible-lg-inline-block{display:none!important}
  @media(min-width:1200px){.visible-lg-inline-block{display:inline-block!important}}
  /* Nativní popup pod 992 px zabírá zbývající výšku obrazovky. Desktopová bublina ho přebíjí. */
  .popup-widget-inner{height:100%}
  @media(max-width:991px){.popup-widget.cart-widget{height:calc(100vh - 134px)}}
  /* Ověřená mobilní geometrie Disca: pevná hlavička a původní rezerva 50 / 80 px.
     Při přesných 480 px v Disco vyhraje max-width:480px, akce zůstávají 50px. */
  @media(max-width:767px){.overall-wrapper{padding-top:50px}#header{position:fixed;top:0;left:0;right:0;z-index:1000}.header-top-wrapper{flex-wrap:wrap}.header-bottom{display:block;border-top:0}.header-bottom>.container{display:flex}#navigation{position:fixed;top:50px;bottom:0;right:0;width:0;overflow:auto}.navigation-window-visible #navigation{width:100%}.search-window-visible #header .search{position:static;order:3;flex-basis:100%}.search-form,.search-form fieldset{width:100%;min-width:0}}
  @media(min-width:481px) and (max-width:767px){.overall-wrapper{padding-top:80px}#navigation{top:80px}.navigation-buttons>[data-target]{width:80px;height:80px;min-width:80px;min-height:80px}}
  ${css}</style></head><body class="type-index"><div class="overall-wrapper">
  <div class="site-msg information"><div class="container"><div class="text">Doprava zdarma pro objednávky nad 1 500 Kč. <a href="/doprava">Více informací</a></div><button class="close js-close-information-msg" aria-label="Zavřít">×</button></div></div>
  <div class="top-navigation-bar"><div class="container"><div class="top-navigation-menu"><ul class="top-navigation-bar-menu"><li><a href="/onas">O nás a našem obchodě</a></li><li><a href="/doprava">Doprava a možnosti platby</a></li><li><a href="/kontakt">Kontaktujte nás</a></li></ul></div><div class="top-navigation-tools"><a class="top-nav-button top-nav-button-login toggle-window" data-target="login" href="#login">Přihlášení / Účet zákazníka</a><div class="dropdown"><button type="button">CZK<span class="caret"></span></button></div></div></div></div>
  <header id="header"><div class="header-top"><div class="container header-top-wrapper"><h1 class="site-name"><a href="/" aria-label="Domů">${img()}</a></h1><div class="search"><form class="search-form" action="/vyhledavani"><fieldset><input class="search-input" type="search" aria-label="Vyhledat" placeholder="Co pro vás najdeme?"><button class="search-button" type="submit">Vyhledat</button></fieldset></form><div class="searchWhisperer"></div></div><div class="navigation-buttons"><button class="toggle-window" data-target="navigation" aria-label="Menu">☰</button><button class="toggle-window" data-target="search" aria-label="Hledat">⌕</button><a class="cart-count toggle-window full" data-target="cart" data-redirect="true" href="/kosik"><i>12</i><span class="cart-price visible-lg-inline-block">123 456 Kč</span></a></div></div></div><div class="header-bottom"><div class="container"><nav id="navigation"><div class="navigation-in"><ul class="menu-level-1"><li class="ext"><a href="/kategorie"><b>Kategorie produktů</b><span class="submenu-arrow"></span></a><ul class="menu-level-2">${Array.from({length:4},category).join('')}</ul></li><li><a href="/novinky">Novinky</a></li><li><a href="/akce">Akční nabídka</a></li></ul></div></nav></div></div></header>
  <main id="content" class="container"><div class="banners-row"><div class="col-sm-8"><div id="carousel"><div class="carousel-inner">${banner(0)}${banner(1,false)}${banner(2,false)}${banner(3,false)}${banner(4,false)}</div><a class="carousel-control left" data-slide="prev" href="#carousel" aria-label="Předchozí"></a><a class="carousel-control right" data-slide="next" href="#carousel" aria-label="Další"></a></div></div><div class="col-sm-4"><div class="next-to-carousel-banners"><div class="banner-wrapper"><a href="/banner-5">${img()}</a></div><div class="banner-wrapper"><a href="/banner-6">${img()}</a></div></div></div></div><h2 class="homepage-group-title">Nejprodávanější produkty</h2><div class="products-wrapper"><div class="products-block">${Array.from({length:6},product).join('')}</div></div></main>
  <div class="container"><div class="row banners-content body-banners"><div class="col-sm-12"><div class="banner-wrapper"><a href="/nabidka">${img()}<span class="extended-banner-texts"><span class="extended-banner-title">Nabídka pro nezapomenutelné chvíle</span><span class="extended-banner-text">Dlouhý popis banneru musí zůstat čitelný i na telefonu.</span><span class="extended-banner-link">Prohlédnout celou nabídku</span></span></a></div></div></div></div>
  <footer class="contact-box"><div class="tel"><a href="tel:123456789">+420 123 456 789</a></div><div class="mail"><a href="mailto:podpora@example.test">velmi-dlouha-adresa-zakaznicke-podpory@example.test</a></div></footer>
  <div id="login" class="popup-widget login-widget"><div class="popup-widget-inner"><h2>Přihlášení k účtu</h2><form class="login-form" action="/prihlaseni"><div class="smart-label-wrapper"><div class="form-control-wrapper"><input id="email" name="email" type="email" aria-label="E-mail"></div></div><div class="smart-label-wrapper"><div class="form-control-wrapper"><input id="password" name="password" type="password" aria-label="Heslo"></div></div><div class="alternative-links"><a href="/zapomenute-heslo">Zapomenuté heslo</a><a href="/registrace">Nová registrace</a></div><div class="submit-wrapper"><button class="btn btn-primary" type="submit">Přihlásit se</button></div></form></div></div>
  <div id="cart-widget" class="popup-widget cart-widget"><div class="cart-widget-inner full"><div class="cart-widget-products"><div class="cart-widget-products-inner">${Array.from({length:3},cartItem).join('')}</div></div><div class="cart-widget-bottom"><div class="cart-widget-button"><a class="btn btn-conversion" href="/kosik">Pokračovat do košíku</a></div></div></div></div>
  </div></body></html>`;
}

async function load(page, config = {}) {
  await page.setContent(html());
  await page.evaluate(({config,image,name}) => {
    delete window.asteroidStarted;
    window.asteroidConfig = {
      header:'v2', phone:{hours:'po–pá: 9:00–17:00'},
      quickLinks: Array.from({length:6},(_,i)=>({label:`Doplňkový odkaz číslo ${i+1}`,url:`/odkaz-${i}`,icon:'schedule'})),
      navLinks: Array.from({length:8},(_,i)=>({label:`Informace pro naše zákazníky ${i+1}`,url:`/informace-${i}`})),
      homeCategories:{title:'Oblíbené kategorie',items:Array.from({length:6},(_,i)=>({name:`${name} ${i}`,url:`/kategorie-${i}`,image}))},
      ...config,
    };
    window.originalNavigation = document.querySelector('#navigation');
    window.nativeClicks = 0;
    window.shoptet = {popups: {hideContentWindows() {
      ['navigation','search','login','cart'].forEach(name=>document.body.classList.remove(`${name}-window-visible`));
    }}};
    // Stub pouze přepíná dokumentované třídy; skutečné chování Disca se zde neověřuje.
    document.addEventListener('click', event => {
      const trigger = event.target.closest('.toggle-window');
      if(!trigger) return;
      event.preventDefault();
      const target = trigger.dataset.target;
      const wasOpen = document.body.classList.contains(`${target}-window-visible`);
      ['navigation','search','login','cart'].forEach(name=>document.body.classList.remove(`${name}-window-visible`));
      if(!wasOpen && !trigger.classList.contains('hide-content-windows')) document.body.classList.add(`${target}-window-visible`);
      window.nativeClicks++;
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape') ['navigation','search','login','cart'].forEach(name=>document.body.classList.remove(`${name}-window-visible`));
    });
  }, {config,image,name});
  await page.addScriptTag({content:js});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function showSearch(page, empty = false) {
  await page.evaluate(({empty,image,name})=>{
    document.body.classList.add('search-window-visible');
    const panel = document.querySelector('.searchWhisperer');
    panel.innerHTML = empty ? '<div class="searchWhisperer__content--empty">Nic nenalezeno</div>' : `<div class="searchWhisperer__products"><h3 class="searchWhisperer__products__heading">Produkty</h3><ul class="searchWhisperer__products__list">${Array.from({length:4},()=>`<li class="searchWhisperer__products__listItem"><a class="searchWhisperer__product" href="/produkt"><span class="searchWhisperer__product__image"><img src='${image}' alt=""></span><span class="searchWhisperer__product__infoWrapper"><span class="searchWhisperer__product__name">${name}</span><span class="searchWhisperer__product__availability">Skladem</span></span><span class="searchWhisperer__product__price">123 456 Kč</span></a></li>`).join('')}</ul></div><div class="searchWhisperer__additionalResults"><h3 class="searchWhisperer__additionalResults__heading">Kategorie</h3><ul class="searchWhisperer__additionalResults__list"><li><a class="searchWhisperer__additionalResults__link" href="/kategorie">${name}</a></li></ul></div><div class="searchWhisperer__buttonWrapper"><a class="searchWhisperer__button" href="/vyhledavani">Zobrazit všechny výsledky</a></div>`;
    panel.classList.add('active');
  }, {empty,image,name});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

module.exports = {load,showSearch};
