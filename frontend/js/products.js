(function (window, $) {
  window.IziPages = window.IziPages || {};
  let bound = false;
  let productsRequest;
  let brandsRequest;

  function collectFilterParams() {
    const current = IziApi.catalogFromLocation();
    const form = document.getElementById('sale-goods-container');
    if (!form) return current;
    const formData = new FormData(form);
    const next = {
      category: current.category,
      subcategory: current.subcategory,
    };

    formData.forEach(function (value, key) {
      if (['category', 'subcategory', 'price_preset'].includes(key)) return;
      if (value !== '' && value != null) {
        if (key === 'sort' && value === 'popular') return;
        next[key] = value;
      }
    });

    if (formData.get('price_preset') === 'discount' ||
        ($(window).width() > 579 && current.discount_only)) next.discount_only = '1';
    return next;
  }

  function applyFilters() {
    const url = IziApi.hrefProducts(collectFilterParams(), $(window).width() > 579 ? 'gods-main-filter' : '');
    if (window.IziRouter) IziRouter.go(url);
    else location.href = url;
  }

  function syncFiltersFromUrl() {
    const params = IziApi.catalogFromLocation();
    const sort = params.sort || 'popular';
    $('input[name="sort"]').each(function () {
      $(this).prop('checked', $(this).val() === sort);
    });

    const preset = params.discount_only ? 'discount'
      : params.price_from === '5000' && !params.price_to ? '5000+'
      : !params.price_from && ['500', '1500', '4500'].includes(params.price_to) ? params.price_to
      : '';
    $('input[name="price_preset"]').each(function () {
      $(this).prop('checked', $(this).val() === preset);
    });

    ['price_from', 'price_to', 'size_from', 'size_to'].forEach(function (k) {
      $('input[name="' + k + '"]').val(params[k] || '');
    });

    const brand = params.brand || '';
    $('#brand-select').val(brand);
    $('input[name="brand"]').each(function () {
      $(this).prop('checked', String($(this).val()) === String(brand));
    });

    const skin = params.skin || '';
    $('#skin-select').val(skin);
    $('input[name="skin"]').each(function () {
      $(this).prop('checked', $(this).val() === skin);
    });

    $('#filter-category').val(params.category || '');
    $('#filter-subcategory').val(params.subcategory || '');
  }

  function renderBreadcrumb(res) {
    const params = IziApi.catalogFromLocation();
    const category = params.category;
    const labels = IziApi.CATEGORY_LABELS;
    let html = '<a href="/">Главная</a> / ';
    if (category) {
      const active = res.subcategory ? '' : 'active';
      html += `<a href="${IziApi.hrefProducts({ category: category })}" class="${active}"> ${IziApi.escapeHtml(labels[category] || category)}</a>`;
    } else if (params.brand) {
      html += '<a href="javascript:void(0);" class="active"> Бренд</a>';
    } else {
      html += '<a href="javascript:void(0);"> Все продукты</a>';
    }
    if (res.subcategory && res.subcategory.name) {
      html += ` / <a href="${IziApi.hrefProducts({ category: category, subcategory: res.subcategory.id })}" class="active"> ${IziApi.escapeHtml(res.subcategory.name)}</a>`;
    }
    $('#goods-title').html(html);
  }

  function loadProducts() {
    const params = IziApi.catalogFromLocation();
    const data = {
      page: Number(params.page) || 1,
      pageSize: 16,
      category: params.category || undefined,
      subcategory: params.subcategory || undefined,
      sort: params.sort || undefined,
      discount_only: params.discount_only || undefined,
      price_from: params.price_from || undefined,
      price_to: params.price_to || undefined,
      size_from: params.size_from || undefined,
      size_to: params.size_to || undefined,
      brand: params.brand || undefined,
      skin: params.skin || undefined,
    };

    const $list = $('#sale-goods-main-container');
    const $pagination = $('#products-pagination');
    if (productsRequest) productsRequest.abort();
    $list.attr('aria-busy', 'true');

    productsRequest = IziApi.get('/products', data)
      .done(function (res) {
        renderBreadcrumb(res);
        replaceResults(res.products.length
          ? res.products.map(IziApi.renderProductCard).join('')
          : '<div id="no-products">Товары по выбранным параметрам отсутствуют. Попробуйте изменить фильтр</div>');
        $pagination.html(IziApi.renderPagination(res.pagination, function (page) {
          return IziApi.hrefProducts(Object.assign({}, params, { page: page }));
        }));
      })
      .fail(function (_, status) {
        if (status === 'abort') return;
        replaceResults('<div id="no-products">Не удалось загрузить товары. Попробуйте ещё раз.</div>');
        $pagination.empty();
      })
      .always(function () {
        $list.removeAttr('aria-busy');
      });

    function replaceResults(html) {
      $list.children('.sale-goods-block, #no-products').remove();
      $list.append(html);
    }
  }

  function fillBrands(brands) {
    const $select = $('#brand-select');
    const $mobile = $('#mobile-brands-list');
    $mobile.empty();
    brands.forEach(function (b) {
      $select.append(`<option value="${b.id}">${IziApi.escapeHtml(b.name)}</option>`);
      $mobile.append(`
      <div class="radio">
        <input class="radio_input products-filter-trigger" name="brand" type="radio"
               id="brandmobile${b.id}" value="${b.id}">
        <label class="radio_label" for="brandmobile${b.id}"><span>${IziApi.escapeHtml(b.name)}</span></label>
      </div>`);
    });
  }

  function bindOnce() {
    if (bound) return;
    bound = true;

    $(document).on('click', '.gods-filter', function () {
      if ($(this).attr('id') === 'gods-filter-mobile') return;
      $('#gods-main-filter').fadeToggle();
      $('.gods-filter-arrow').toggleClass('transform');
    });

    $(document).on('click', '#gods-filter-mobile', function () {
      $('#filter-mobile-main').show();
      $('#gods-main-filter').hide();
    });

    $(document).on('click', '.filter-mobile-close', function () {
      $('.filter-mobile').hide();
    });

    $(document).on('click', '.mobile-filter-white-arrow', function () {
      $('#filter-mobile-main').show().css('z-index', 999);
      $('#filter-mobile-sort, #filter-mobile-price, #filter-mobile-brand, #filter-mobile-leather, #filter-mobile-volume')
        .css('z-index', 9);
      $('#gods-main-filter').hide();
    });

    $(document).on('click', '.filter-mobile-sort', function () {
      $('#filter-mobile-sort').show().css('z-index', 99);
      $('#filter-mobile-main').css('z-index', 9);
    });
    $(document).on('click', '.filter-mobile-price', function () {
      $('#filter-mobile-price').show().css('z-index', 99);
      $('#filter-mobile-main').css('z-index', 9);
    });
    $(document).on('click', '.filter-mobile-brand', function () {
      $('#filter-mobile-brand').show().css('z-index', 99);
      $('#filter-mobile-main').css('z-index', 9);
    });
    $(document).on('click', '.filter-mobile-leather', function () {
      $('#filter-mobile-leather').show().css('z-index', 99);
      $('#filter-mobile-main').css('z-index', 9);
    });
    $(document).on('click', '.filter-mobile-volume', function () {
      $('#filter-mobile-volume').show().css('z-index', 99);
      $('#filter-mobile-main').css('z-index', 9);
    });

    $(document).on('change', '[name="price_preset"]', function () {
      const value = $(this).val();
      $('#low-price').val(value === '5000+' ? '5000' : '');
      $('#height-price').val(['discount', '5000+'].includes(value) ? '' : value);
    });

    $(document).on('input', '#low-price, #height-price', function () {
      $('input[name="price_preset"]').prop('checked', false);
    });

    $(document).on('change', '#sale-goods-container .products-filter-trigger', function () {
      if ($(window).width() > 579) {
        applyFilters();
      }
    });

    $(document).on('submit', '#sale-goods-container', function (e) {
      e.preventDefault();
      $('.filter-mobile').hide();
      applyFilters();
    });
  }

  IziPages.products = {
    init: function () {
      bindOnce();
      const w = $(window).width();

      if (w <= 1200) {
        $('#gods-main-filter').css({ display: 'flex', margin: '0 auto' });
      }
      if (w <= 579) {
        $('#gods-filter-menu').remove();
        $('.filter-dekstop-menu-volume').remove();
        $('.filter-dekstop-menu-brand').remove();
        $('#filter-dekstop-leather').remove();
        $('#filter-size-dekstop').remove();
        $('#gods-main-filter').hide();
      } else {
        $('.filter-mobile').remove();
      }

      const params = IziApi.catalogFromLocation();
      if (w > 1200 && (params.sort || params.brand || params.skin ||
          params.price_from || params.price_to || params.size_from || params.size_to || params.discount_only)) {
        $('#gods-main-filter').show();
        $('.gods-filter-arrow').addClass('transform');
      }

      IziPages.products.update();
      brandsRequest = IziApi.get('/brands/all').done(function (res) {
        fillBrands(res.brands || []);
        syncFiltersFromUrl();
      });
    },
    update: function () {
      syncFiltersFromUrl();
      loadProducts();
    },
    destroy: function () {
      if (productsRequest) productsRequest.abort();
      if (brandsRequest) brandsRequest.abort();
    },
  };
})(window, jQuery);
