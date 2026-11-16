(function (window, $) {
  window.IziPages = window.IziPages || {};
  let bound = false;

  function collectFilterParams() {
    const current = IziApi.catalogFromLocation();
    const form = document.getElementById('sale-goods-container');
    if (!form) return current;
    const formData = new FormData(form);
    const next = {
      category: current.category,
      subcategory: current.subcategory,
    };

    const seen = {};
    formData.forEach(function (value, key) {
      if (key === 'category' || key === 'subcategory') return;
      if (seen[key] && !value) return;
      seen[key] = true;
      if (value !== '' && value != null) {
        if (key === 'sort' && value === 'popular') return;
        next[key] = value;
      }
    });

    return next;
  }

  function applyFilters(page) {
    const next = collectFilterParams();
    if (page && page > 1) next.page = page;
    else delete next.page;
    const url = IziApi.hrefProducts(next, 'gods-main-filter');
    if (window.IziRouter) IziRouter.go(url);
    else location.href = url;
  }

  function syncFiltersFromUrl() {
    const params = IziApi.catalogFromLocation();
    const sort = params.sort || 'popular';
    $('input[name="sort"]').each(function () {
      $(this).prop('checked', $(this).val() === sort);
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

    if (params.sort || params.brand || params.skin ||
        params.price_from || params.price_to ||
        params.size_from || params.size_to) {
      $('#gods-main-filter').show();
    }
  }

  function renderBreadcrumb(res) {
    const params = IziApi.catalogFromLocation();
    const category = params.category;
    const labels = IziApi.CATEGORY_LABELS;
    let html = '<a href="/">Главная</a> / ';
    if (category) {
      const active = res.subcategory ? '' : 'active';
      html += `<a href="${IziApi.hrefProducts({ category: category })}" class="${active}"> ${labels[category] || category}</a>`;
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
      price_from: params.price_from || undefined,
      price_to: params.price_to || undefined,
      size_from: params.size_from || undefined,
      size_to: params.size_to || undefined,
      brand: params.brand || undefined,
      skin: params.skin || undefined,
    };

    IziApi.get('/products', data).done(function (res) {
      renderBreadcrumb(res);
      const $list = $('#sale-goods-main-container');
      let flowers = '';
      if (!$list.find('#gods-flower-right').length) {
        flowers = `<div id="gods-flower-right"><img src="/images/product-flower-rightt.png" alt=""></div>
        <div id="gods-flower-bottom"><img src="/images/product-flower-bottomm.png" alt=""></div>`;
      } else {
        flowers = $list.find('#gods-flower-right')[0].outerHTML + $list.find('#gods-flower-bottom')[0].outerHTML;
      }
      $list.empty().append(flowers);

      if (!res.products.length) {
        $list.append('<div id="no-products">Товары по выбранным параметрам отсутствуют. Попробуйте изменить фильтр</div>');
        $('#products-pagination').empty();
        return;
      }

      res.products.forEach(function (p) {
        $list.append(IziApi.renderProductCard(p));
      });
      $('#products-pagination').html(IziApi.renderPagination(res.pagination, function (page) {
        const next = Object.assign({}, IziApi.catalogFromLocation(), { page: page });
        return IziApi.hrefProducts(next);
      }));
    });
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

    $(document).on('change', '#sale-goods-container .products-filter-trigger', function () {
      if ($(window).width() > 579) {
        applyFilters(1);
      }
    });

    $(document).on('submit', '#sale-goods-container', function (e) {
      e.preventDefault();
      applyFilters(1);
    });

    $(document).on('click', '.filter-mobile-button', function (e) {
      e.preventDefault();
      applyFilters(1);
    });
  }

  IziPages.products = {
    init: function () {
      bindOnce();
      const params = IziApi.catalogFromLocation();
      const w = $(window).width();

      $('#sale-goods-container').attr('action', IziApi.hrefProducts({
        category: params.category,
        subcategory: params.subcategory,
      }));

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
        $('.filter-mobile-menu-sort').remove();
        $('.filter-mobile-menu-volume').remove();
        $('.filter-mobile-menu-brand').remove();
        $('#filter-mobile-leather').remove();
      }

      IziApi.get('/brands/all').done(function (res) {
        fillBrands(res.brands || []);
        syncFiltersFromUrl();
        loadProducts();
      }).fail(function () {
        syncFiltersFromUrl();
        loadProducts();
      });
    },
    destroy: function () {},
  };
})(window, jQuery);
