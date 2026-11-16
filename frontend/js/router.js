(function (window, $) {
  const TITLES = {
    home: 'Интернет-магазин косметики - IZI BY IZI',
    products: 'Каталог товаров - IZI BY IZI',
    product: 'Товар - IZI BY IZI',
    brands: 'Наши Бренды - IZI BY IZI',
    search: 'Поиск - IZI BY IZI',
    cart: 'Корзина - IZI BY IZI',
    order: 'Оформление заказа - IZI BY IZI',
    contact: 'Связаться с нами - IZI BY IZI',
    about: 'О нас - IZI BY IZI',
    delivery: 'Доставка и оплата - IZI BY IZI',
    thanks: 'Спасибо за заказ - IZI BY IZI',
    privacy: 'Политика конфиденциальности - IZI BY IZI',
    agreement: 'Пользовательское соглашение - IZI BY IZI',
    'delivery-conditions': 'Условия доставки - IZI BY IZI',
  };

  const ROUTES = [
    { name: 'home', re: /^\/$/, tpl: '/pages/home.html' },
    { name: 'products', re: /^\/products(?:\/[^/]+)?(?:\/[^/]+)?$/, tpl: '/products.html' },
    { name: 'product', re: /^\/product(?:\/[^/]+)?$/, tpl: '/product.html' },
    { name: 'brands', re: /^\/brands$/, tpl: '/brands.html' },
    { name: 'search', re: /^\/search$/, tpl: '/search.html' },
    { name: 'cart', re: /^\/cart$/, tpl: '/cart.html' },
    { name: 'order', re: /^\/order$/, tpl: '/order.html' },
    { name: 'contact', re: /^\/contact$/, tpl: '/contact.html' },
    { name: 'about', re: /^\/about$/, tpl: '/about.html' },
    { name: 'delivery', re: /^\/delivery$/, tpl: '/delivery.html' },
    { name: 'thanks', re: /^\/thanks$/, tpl: '/thanks.html' },
    { name: 'privacy', re: /^\/privacy-policy$/, tpl: '/privacy-policy.html' },
    { name: 'agreement', re: /^\/user-agreement$/, tpl: '/user-agreement.html' },
    { name: 'delivery-conditions', re: /^\/delivery-conditions$/, tpl: '/delivery-conditions.html' },
  ];

  const tplCache = {};
  const LOADER_MIN_MS = 500;
  let currentName = null;
  let started = false;
  let bootLoaderHidden = false;

  function pathOnly() {
    return location.pathname.replace(/\.html$/, '') || '/';
  }

  function matchRoute() {
    const path = pathOnly() === '' ? '/' : pathOnly();
    for (let i = 0; i < ROUTES.length; i++) {
      if (ROUTES[i].re.test(path)) return ROUTES[i];
    }
    return ROUTES[0];
  }

  function extractContent(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const $body = $(doc.body);
    $body.find('#app-header, #app-footer, script, link[rel="stylesheet"]').remove();
    return $body.html();
  }

  function getTemplate(url) {
    if (tplCache[url]) {
      if (typeof tplCache[url].then === 'function') return tplCache[url];
      return $.Deferred().resolve(tplCache[url]).promise();
    }
    tplCache[url] = $.ajax({ url: url, dataType: 'text', cache: false }).then(function (html) {
      const content = extractContent(html);
      tplCache[url] = content;
      return content;
    }, function (err) {
      delete tplCache[url];
      return $.Deferred().reject(err).promise();
    });
    return tplCache[url];
  }

  function destroyCurrent() {
    if (currentName && window.IziPages && IziPages[currentName] && IziPages[currentName].destroy) {
      try { IziPages[currentName].destroy(); } catch (e) { console.log(e); }
    }
  }

  function scrollToHash() {
    const hash = location.hash.replace(/^#/, '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }

  function hideBootLoader() {
    if (bootLoaderHidden) return;
    bootLoaderHidden = true;
    const $loader = $('#app-loader');
    if (!$loader.length) return;
    const startedAt = window.__iziLoadStart || Date.now();
    const wait = Math.max(0, LOADER_MIN_MS - (Date.now() - startedAt));
    setTimeout(function () {
      $loader.addClass('is-hidden');
      setTimeout(function () { $loader.remove(); }, 400);
    }, wait);
  }

  function render() {
    const route = matchRoute();
    destroyCurrent();
    document.title = TITLES[route.name] || TITLES.home;

    return getTemplate(route.tpl).then(function (html) {
      $('#dropdown-search').empty().hide();
      $('#app-page').html(html);
      const cat = (route.name === 'products') ? (IziApi.catalogFromLocation().category || null) : null;
      IziLayout.mountSecondHeader(cat);
      currentName = route.name;
      if (window.IziPages && IziPages[route.name] && IziPages[route.name].init) {
        IziPages[route.name].init();
      }
      scrollToHash();
    }).fail(function () {
      $('#app-page').html('<p style="padding:40px;text-align:center;">Страница не найдена</p>');
    });
  }

  function go(url) {
    if (!url) return;
    if (url.charAt(0) !== '/' && url.indexOf('http') !== 0) {
      url = '/' + url;
    }
    const abs = url.indexOf('http') === 0 ? url : (location.origin + url);
    const next = new URL(abs, location.origin);
    if (next.origin !== location.origin) {
      location.href = url;
      return;
    }
    const target = next.pathname + next.search + next.hash;
    const current = location.pathname + location.search + location.hash;
    if (target === current) {
      render();
      return;
    }
    history.pushState({}, '', target);
    render();
  }

  function isInternalLink(anchor) {
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return false;
    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href.indexOf('javascript:') === 0) return false;
    if (/^(mailto:|tel:|tg:|viber:)/i.test(href)) return false;
    if (/^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0) return false;
    if (/\.(png|jpe?g|gif|svg|css|js|ico|webp)(\?|$)/i.test(href)) return false;
    if (href.indexOf('/upload/') === 0) return false;
    return href.charAt(0) === '/' || href.indexOf(location.origin) === 0;
  }

  function start() {
    if (started) return;
    started = true;

    $(document).on('click', 'a[href]', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.which === 2) return;
      if (!isInternalLink(this)) return;
      e.preventDefault();
      const href = this.getAttribute('href');
      go(href.indexOf('http') === 0 ? href.replace(location.origin, '') : href);
    });

    $(document).on('submit', '#searhc-form', function (e) {
      e.preventDefault();
      const q = ($('#search').val() || '').trim();
      go('/search' + (q ? ('?query=' + encodeURIComponent(q)) : ''));
    });

    window.addEventListener('popstate', function () {
      render();
    });

    getTemplate(matchRoute().tpl);
    $.when(IziLayout.mountLayout()).always(function () {
      $.when(render()).always(hideBootLoader);
    });
  }

  window.IziPages = window.IziPages || {};
  window.IziRouter = { go: go, render: render, start: start };
  $(start);
})(window, jQuery);
