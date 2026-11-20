(function (window, $) {
  const TITLES = {
    notFound: 'Страница не найдена - IZI BY IZI',
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

  const tplCache = {};
  const LOADER_MIN_MS = 500;
  let currentName = null;
  let started = false;
  let renderVersion = 0;
  let bootLoaderHidden = false;

  function getTemplate(url) {
    if (tplCache[url]) {
      if (typeof tplCache[url].then === 'function') return tplCache[url];
      return $.Deferred().resolve(tplCache[url]).promise();
    }
    tplCache[url] = $.ajax({ url: url, dataType: 'text', cache: false }).then(function (html) {
      tplCache[url] = html;
      return html;
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
    const route = IziRoutes.match(location.pathname);
    const version = ++renderVersion;
    const page = window.IziPages[route.name];
    const category = route.name === 'products' ? IziApi.catalogFromLocation().category : null;
    const $content = $('#app-page');

    closeBasket();
    $('#dropdown-search').stop(true, true).empty().hide();
    document.title = TITLES[route.name];

    if (currentName === route.name && page && page.update) {
      IziLayout.mountSecondHeader(category);
      page.update();
      scrollToHash();
      return;
    }

    destroyCurrent();
    currentName = null;

    return getTemplate(route.tpl).then(function (html) {
      if (version !== renderVersion) return;
      $content.html(html);
      IziLayout.mountSecondHeader(category);
      currentName = route.name;
      if (page && page.init) page.init();
      scrollToHash();
    }, function () {
      if (version !== renderVersion) return;
      $content.html('<p class="page-message">Не удалось загрузить страницу. Обновите её и попробуйте снова.</p>');
    });
  }

  function go(url) {
    if (!url) return;
    const next = new URL(url, location.origin);
    if (next.origin !== location.origin) {
      location.href = next.href;
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
    if (!href || !/^(?:\/|https?:\/\/)/i.test(href)) return false;
    const url = new URL(href, location.origin);
    if (url.origin !== location.origin) return false;
    if (/^\/(?:upload|images|fonts|css|js|pages)\//.test(url.pathname)) return false;
    return !/\.(?!html$)[a-z0-9]+$/i.test(url.pathname.split('/').pop());
  }

  function start() {
    if (started) return;
    started = true;

    $(document).on('click', 'a[href]', function (e) {
      if (e.isDefaultPrevented() || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.which === 2) return;
      if (!isInternalLink(this)) return;
      e.preventDefault();
      const href = this.getAttribute('href');
      go(href);
    });

    $(document).on('submit', '#searhc-form', function (e) {
      e.preventDefault();
      const q = ($('#search').val() || '').trim();
      go('/search' + (q ? ('?query=' + encodeURIComponent(q)) : ''));
    });

    window.addEventListener('popstate', function () {
      render();
    });

    getTemplate(IziRoutes.match(location.pathname).tpl);
    $.when(IziLayout.mountLayout()).always(function () {
      $.when(render()).always(hideBootLoader);
    });
  }

  window.IziPages = window.IziPages || {};
  window.IziRouter = { go: go, render: render, start: start };
  $(start);
})(window, jQuery);
