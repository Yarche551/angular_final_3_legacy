(function (window, $) {
  const cfg = window.IZI_CONFIG || { API_BASE: 'http://localhost:3000/api', UPLOAD_BASE: '/upload' };

  const SVG_NEW = `<div class="gods-info-new" role="img" aria-label="Новинка"><svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M36.5369 20.5093L39.5498 17.4213C39.734 17.2323 39.8682 17.0002 39.94 16.7462C40.0118 16.4922 40.019 16.2243 39.961 15.9668C39.903 15.7093 39.7815 15.4703 39.6077 15.2717C39.4339 15.073 39.2132 14.9209 38.9657 14.8292L34.9203 13.3318L36.295 9.24501C36.3797 8.99487 36.4005 8.72751 36.3555 8.46728C36.3106 8.20704 36.2012 7.96218 36.0375 7.75498C35.8737 7.54778 35.6608 7.38481 35.418 7.28092C35.1752 7.17703 34.9102 7.1355 34.6473 7.16012L30.3522 7.56534L29.8157 3.28324C29.783 3.02118 29.6854 2.77142 29.5317 2.55667C29.378 2.34193 29.1731 2.16901 28.9355 2.05362C28.698 1.93824 28.4354 1.88406 28.1715 1.896C27.9077 1.90794 27.6511 1.98562 27.4249 2.12199L23.6966 4.36846L21.3249 0.721412C21.1811 0.499962 20.9841 0.317972 20.7521 0.191983C20.52 0.0659935 20.2601 0 19.996 0C19.732 0 19.4721 0.0659935 19.24 0.191983C19.0079 0.317972 18.811 0.499962 18.6672 0.721412L16.3179 4.33908L12.6311 2.09867C12.4055 1.96141 12.1492 1.88274 11.8854 1.86982C11.6217 1.8569 11.3589 1.91013 11.1209 2.02468C10.883 2.13922 10.6775 2.31144 10.5231 2.52567C10.3687 2.73989 10.2703 2.98933 10.2369 3.25127L9.68822 7.52992L5.39489 7.10914C5.13247 7.08365 4.86784 7.12403 4.62498 7.22664C4.38211 7.32924 4.16868 7.49083 4.00403 7.69674C3.83938 7.90266 3.72872 8.14641 3.68206 8.4059C3.6354 8.66539 3.65422 8.93242 3.73682 9.1828L5.09766 13.28L1.04712 14.7627C0.79886 14.8533 0.577221 15.0046 0.402377 15.2028C0.227533 15.401 0.105037 15.6398 0.0460413 15.8974C-0.0129546 16.155 -0.00657671 16.4233 0.0645943 16.6779C0.135765 16.9324 0.269469 17.1651 0.453533 17.3547L3.45602 20.4514L0.448349 23.5446C0.264176 23.7339 0.13024 23.9662 0.058719 24.2205C-0.0128023 24.4747 -0.0196406 24.7428 0.0388257 25.0004C0.097292 25.2579 0.219208 25.4968 0.393491 25.6952C0.567774 25.8937 0.788894 26.0454 1.03675 26.1367L5.08557 27.6262L3.71522 31.7174C3.63146 31.9678 3.61162 32.2351 3.65751 32.4951C3.70341 32.7552 3.81358 32.9996 3.978 33.2061C4.14242 33.4127 4.35588 33.5749 4.59896 33.678C4.84204 33.781 5.10703 33.8217 5.36983 33.7962L9.66317 33.3832L10.2049 37.6636C10.238 37.9256 10.3361 38.1751 10.4902 38.3895C10.6442 38.6039 10.8495 38.7764 11.0872 38.8914C11.3249 39.0063 11.5875 39.0601 11.8513 39.0477C12.115 39.0353 12.3715 38.9572 12.5974 38.8205L16.2876 36.5862L18.6317 40.2082C18.7752 40.4297 18.9717 40.612 19.2035 40.7383C19.4353 40.8646 19.6949 40.9309 19.9589 40.9314C20.2224 40.9314 20.4818 40.8657 20.7136 40.7402C20.9453 40.6146 21.1421 40.4333 21.286 40.2125L23.6422 36.5991L27.3247 38.8456C27.5501 38.9833 27.8064 39.0625 28.0702 39.076C28.3341 39.0894 28.5971 39.0367 28.8354 38.9226C29.0736 38.8085 29.2796 38.6366 29.4345 38.4226C29.5894 38.2086 29.6884 37.9593 29.7224 37.6973L30.2788 33.4195L34.5713 33.8472C34.8339 33.8733 35.099 33.8334 35.3423 33.7311C35.5857 33.6287 35.7996 33.4672 35.9647 33.2612C36.1297 33.0552 36.2407 32.8112 36.2875 32.5514C36.3344 32.2916 36.3155 32.0242 36.2328 31.7736L34.8788 27.6781L38.932 26.2015C39.1809 26.1117 39.4033 25.9609 39.5789 25.7629C39.7545 25.565 39.8776 25.3262 39.9371 25.0683C39.9966 24.8105 39.9905 24.5419 39.9193 24.287C39.8482 24.0321 39.7143 23.7992 39.5299 23.6094L36.5369 20.5093ZM14.0066 24.8536H12.4229L8.76113 19.7196C8.78359 20.0453 8.79482 20.4384 8.79482 20.7979V24.8536H7.10998V16.991H8.69373L12.3555 22.1233C12.333 21.7975 12.3218 21.4044 12.3218 21.045V16.9901H14.0066V24.8536ZM21.2964 24.8536H15.6915V16.991H21.229V18.4728H17.3763V20.1464H20.892V21.6152H17.3763V23.3675H21.2964V24.8536ZM31.1134 24.8536H29.2826L27.7213 19.4966L26.16 24.8536H24.3291L21.9029 16.991H23.7226L25.2839 22.9329L26.9799 16.991H28.4626L30.1587 22.9329L31.72 16.991H33.5396L31.1134 24.8536Z" fill="#F8BF00"/></svg></div>`;

  const SVG_HIT = `<div class="gods-info-hit" role="img" aria-label="Хит"><svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M36.5369 20.5093L39.5498 17.4213C39.734 17.2323 39.8682 17.0002 39.94 16.7462C40.0118 16.4922 40.019 16.2243 39.961 15.9668C39.903 15.7093 39.7815 15.4703 39.6077 15.2717C39.4339 15.073 39.2132 14.9209 38.9657 14.8292L34.9203 13.3318L36.295 9.24501C36.3797 8.99487 36.4005 8.72751 36.3555 8.46728C36.3106 8.20704 36.2012 7.96218 36.0375 7.75498C35.8737 7.54778 35.6608 7.38481 35.418 7.28092C35.1752 7.17703 34.9102 7.1355 34.6473 7.16012L30.3522 7.56534L29.8157 3.28324C29.783 3.02118 29.6854 2.77142 29.5317 2.55667C29.378 2.34193 29.1731 2.16901 28.9355 2.05362C28.698 1.93824 28.4354 1.88406 28.1715 1.896C27.9077 1.90794 27.6511 1.98562 27.4249 2.12199L23.6966 4.36846L21.3249 0.721412C21.181 0.499962 20.9841 0.317972 20.7521 0.191983C20.52 0.0659935 20.2601 0 19.996 0C19.732 0 19.4721 0.0659935 19.24 0.191983C19.0079 0.317972 18.811 0.499962 18.6672 0.721412L16.3179 4.33908L12.6311 2.09867C12.4055 1.96141 12.1492 1.88274 11.8854 1.86982C11.6217 1.8569 11.3589 1.91013 11.1209 2.02468C10.883 2.13922 10.6775 2.31144 10.5231 2.52567C10.3687 2.73989 10.2703 2.98933 10.2369 3.25127L9.68822 7.52992L5.39489 7.10914C5.13247 7.08365 4.86784 7.12403 4.62498 7.22664C4.38211 7.32924 4.16868 7.49083 4.00403 7.69674C3.83938 7.90266 3.72872 8.14641 3.68206 8.4059C3.6354 8.66539 3.65422 8.93242 3.73682 9.1828L5.09766 13.28L1.04712 14.7627C0.79886 14.8533 0.577221 15.0046 0.402377 15.2028C0.227533 15.401 0.105037 15.6398 0.0460413 15.8974C-0.0129546 16.155 -0.00657671 16.4233 0.0645942 16.6779C0.135765 16.9324 0.269469 17.1651 0.453533 17.3547L3.45602 20.4514L0.448349 23.5446C0.264176 23.7339 0.13024 23.9662 0.058719 24.2205C-0.0128023 24.4747 -0.0196406 24.7428 0.0388257 25.0004C0.097292 25.2579 0.219208 25.4968 0.393491 25.6952C0.567773 25.8937 0.788894 26.0454 1.03675 26.1367L5.08557 27.6262L3.71522 31.7174C3.63146 31.9678 3.61162 32.2351 3.65751 32.4951C3.70341 32.7552 3.81358 32.9996 3.978 33.2061C4.14242 33.4127 4.35588 33.5749 4.59896 33.678C4.84204 33.781 5.10703 33.8217 5.36983 33.7962L9.66317 33.3832L10.2049 37.6636C10.238 37.9256 10.3361 38.1751 10.4902 38.3895C10.6442 38.6039 10.8495 38.7764 11.0872 38.8914C11.3249 39.0063 11.5875 39.0601 11.8513 39.0477C12.115 39.0353 12.3715 38.9572 12.5974 38.8205L16.2876 36.5862L18.6317 40.2082C18.7752 40.4297 18.9717 40.612 19.2035 40.7383C19.4353 40.8646 19.6949 40.9309 19.9589 40.9314C20.2224 40.9314 20.4818 40.8657 20.7136 40.7402C20.9453 40.6146 21.1421 40.4333 21.286 40.2125L23.6422 36.5991L27.3247 38.8456C27.5501 38.9833 27.8064 39.0625 28.0702 39.076C28.3341 39.0894 28.5971 39.0367 28.8354 38.9226C29.0736 38.8085 29.2796 38.6366 29.4345 38.4226C29.5894 38.2086 29.6884 37.9593 29.7223 37.6973L30.2788 33.4195L34.5713 33.8472C34.8339 33.8733 35.099 33.8334 35.3423 33.7311C35.5857 33.6287 35.7996 33.4672 35.9647 33.2612C36.1297 33.0552 36.2407 32.8112 36.2875 32.5514C36.3344 32.2916 36.3155 32.0242 36.2328 31.7736L34.8788 27.6781L38.932 26.2015C39.1809 26.1117 39.4033 25.9609 39.5789 25.7629C39.7545 25.565 39.8776 25.3262 39.9371 25.0683C39.9966 24.8105 39.9905 24.5419 39.9193 24.287C39.8482 24.0321 39.7143 23.7992 39.5299 23.6094L36.5369 20.5093ZM18.4391 23.7062H16.7542V20.5387H13.2273V23.7062H11.5424V15.8436H13.2273V19.0085H16.7542V15.8436H18.4391V23.7062ZM21.8088 23.7062H20.1239V15.8436H21.8088V23.7062ZM29.3007 17.3599H26.8858V23.7062H25.2121V17.3599H22.7972V15.8436H29.3007V17.3599Z" fill="#82E195"/></svg></div>`;

  function productImage(image) {
    return cfg.UPLOAD_BASE.replace(/\/$/, '') + '/images/product/' + image;
  }

  function brandImage(image) {
    if (!image) return null;
    return cfg.UPLOAD_BASE.replace(/\/$/, '') + '/images/brand/' + image;
  }

  function api(path, options) {
    const opts = Object.assign({
      url: cfg.API_BASE.replace(/\/$/, '') + path,
      dataType: 'json',
      xhrFields: { withCredentials: true },
      crossDomain: true,
    }, options || {});
    return $.ajax(opts);
  }

  function get(path, data) {
    return api(path, { type: 'GET', data: data || {} });
  }

  function post(path, data) {
    return api(path, {
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data || {}),
    });
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pathSegments() {
    return location.pathname.replace(/\.html$/, '').split('/').filter(Boolean);
  }

  function catalogFromLocation() {
    const qs = new URLSearchParams(location.search);
    const segs = pathSegments();
    let category = qs.get('category');
    let subcategory = qs.get('subcategory');
    if (segs[0] === 'products') {
      if (segs[1]) category = category || segs[1];
      if (segs[2]) subcategory = subcategory || segs[2];
    }
    return {
      category: category || null,
      subcategory: subcategory || null,
      page: qs.get('page'),
      sort: qs.get('sort'),
      discount_only: qs.get('discount_only'),
      price_from: qs.get('price_from'),
      price_to: qs.get('price_to'),
      size_from: qs.get('size_from'),
      size_to: qs.get('size_to'),
      brand: qs.get('brand'),
      skin: qs.get('skin'),
    };
  }

  function productSlugFromLocation() {
    const segs = pathSegments();
    if (segs[0] === 'product' && segs[1]) {
      try {
        return decodeURIComponent(segs[1]);
      } catch {
        return null;
      }
    }
    return new URLSearchParams(location.search).get('url');
  }

  function hrefProducts(params, hash) {
    params = params || {};
    let path = '/products';
    if (params.category) {
      path += '/' + encodeURIComponent(params.category);
      if (params.subcategory) path += '/' + encodeURIComponent(params.subcategory);
    }
    const q = new URLSearchParams();
    ['sort', 'discount_only', 'price_from', 'price_to', 'size_from', 'size_to', 'brand', 'skin', 'page'].forEach(function (k) {
      const v = params[k];
      if (v == null || v === '') return;
      if (k === 'sort' && v === 'popular') return;
      if (k === 'page' && Number(v) <= 1) return;
      q.set(k, v);
    });
    const s = q.toString();
    return path + (s ? '?' + s : '') + (hash ? '#' + hash : '');
  }

  function hrefProduct(url) {
    return '/product/' + encodeURIComponent(url);
  }

  function hrefPage(path, query) {
    const q = new URLSearchParams();
    if (query) {
      Object.keys(query).forEach(function (k) {
        if (query[k] != null && query[k] !== '') q.set(k, query[k]);
      });
    }
    const s = q.toString();
    return path + (s ? '?' + s : '');
  }

  function renderProductCard(product) {
    const badges = [];
    if (product.is_new) badges.push(SVG_NEW);
    if (product.old_price) {
      badges.push('<div class="gods-info-percent"><img src="/images/gods-info-percent.png" alt="Акция"></div>');
    }
    if (product.is_hit) badges.push(SVG_HIT);

    let priceHtml;
    if (product.old_price) {
      priceHtml = `<div class="gods-block-container-sales">
        <div class="gods-block-price-sales">${product.price} руб.</div>
        <div class="gods-block-price-crossOut">${product.old_price} руб.</div>
      </div>`;
    } else {
      priceHtml = `<div class="gods-block-price">${product.price} руб.</div>`;
    }

    const btn = product.count
      ? `<button class="gods-block-btn product-add-to-cart" data-id="${product.id}" type="button">
           <span>В корзину</span>
           <div>
             <img src="/images/basket-white-hight.png" alt="">
             <img src="/images/basket-white-bottom.png" alt="">
           </div>
         </button>`
      : '';

    return `<a class="sale-goods-block" href="${hrefProduct(product.url)}">
      ${badges.length ? `<div class="gods-info-position">${badges.join('')}</div>` : ''}
      <div class="gods-block">
        <div class="gods-block-img" style="background-image: url('${productImage(product.image)}')"></div>
        <div class="gods-block-title">${escapeHtml(product.name)}</div>
        <div class="gods-block-descr">${escapeHtml(product.short_description || '')}</div>
        <div class="basket-btn">
          <div class="gods-block-container">
            ${priceHtml}
            ${btn}
          </div>
        </div>
      </div>
    </a>`;
  }

  function renderPagination(pagination, buildHref) {
    if (!pagination || pagination.pageCount <= 1) return '';
    const page = pagination.page;
    const pageCount = pagination.pageCount;
    let html = '<ul class="pagination">';

    if (page > 1) {
      html += `<li class="pagination-prev"><a href="${buildHref(page - 1)}"><span class="arrow-left pagination-arrow-left"><img src="/images/pagination-arrow-left.png" alt=""></span></a></li>`;
    }

    let start = Math.max(1, page - 2);
    let end = Math.min(pageCount, start + 4);
    start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      const active = i === page ? ' active' : '';
      html += `<li class="pagination-number${active}"><a href="${buildHref(i)}" data-page="${i}">${i}</a></li>`;
    }

    if (page < pageCount) {
      html += `<li class="pagination-next"><a href="${buildHref(page + 1)}"><span class="arrow-right pagination-arrow-right"><img src="/images/pagination-arrow-right.png" alt=""></span></a></li>`;
    }

    html += '</ul>';
    return html;
  }

  const CATEGORY_LABELS = {
    face: 'Для лица',
    body: 'Для тела',
    hair: 'Для волос',
    child: 'Для детей',
    hit: 'Хиты',
    new: 'Новинки',
    discount: 'Акции',
    set: 'Наборы',
    men: 'Для мужчин',
  };

  window.IziApi = {
    cfg,
    api,
    get,
    post,
    productImage,
    brandImage,
    escapeHtml,
    renderProductCard,
    renderPagination,
    catalogFromLocation,
    productSlugFromLocation,
    hrefProducts,
    hrefProduct,
    hrefPage,
    CATEGORY_LABELS,
  };
})(window, jQuery);
