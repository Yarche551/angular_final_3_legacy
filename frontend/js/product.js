(function (window, $) {
  window.IziPages = window.IziPages || {};
  let bound = false;

  function bindOnce() {
    if (bound) return;
    bound = true;

    $(document).on('click', '.category-description', function (e) {
      const currentElement = $(e.currentTarget);
      $('.description-product').hide();
      $('#' + currentElement.data('id')).show();
      $('.category-description').removeClass('active');
      currentElement.addClass('active');
    });

    $(document).on('click', '#product-specification-choice .cart-count-change', function () {
      const element = $(this);
      const quantityNum = element.siblings('.quantity-num');
      let number = Number(quantityNum.val());
      if (element.data('action') === 'add') {
        number++;
        if (number > parseInt(element.attr('data-max'), 10)) return;
      } else {
        number--;
        if (number === 0) return;
      }
      quantityNum.val(number);
    });

    $(document).on('click', '#product-add-to-cart', function (event) {
      event.preventDefault();
      const id = $(this).data('id');
      const count = Number($('#product-count').val()) || 1;
      const image = $('#product-image');
      flyToCart(image);
      IziApi.post('/cart/add', { id: id, count: count }).done(function (res) {
        if (res && res.hasOwnProperty('count')) {
          $('#count-cart').text(res.count);
        }
      });
    });
  }

  IziPages.product = {
    init: function () {
      bindOnce();
      const url = IziApi.productSlugFromLocation();
      if (!url) {
        $('#product-container').html('<p style="padding:40px;">Товар не найден</p>');
        return;
      }

      IziApi.get('/products/' + encodeURIComponent(url)).done(function (res) {
        const p = res.product;
        document.title = p.name;

        const cat = p.subcategory_category;
        const catLabel = (res.categoryLabels && cat)
          ? res.categoryLabels[cat]
          : cat;

        $('#goods-title').html(
          `<a href="/">Главная</a> / ` +
          `<a href="${IziApi.hrefProducts({ category: cat })}"> ${IziApi.escapeHtml(catLabel || '')}</a> / ` +
          `<a href="${IziApi.hrefProducts({ category: cat, subcategory: p.subcategory_id })}"> ${IziApi.escapeHtml(p.subcategory_name || '')}</a> / ` +
          `<a> ${IziApi.escapeHtml(p.name)} </a>`
        );

        $('#product-image').css('background-image', `url('${IziApi.productImage(p.image)}')`);
        $('#product-brand').text(p.brand_name || '');
        $('#product-name').text(p.name);
        $('#product-price').text(p.price + ' руб.');
        $('.quantity-arrow-plus').attr('data-max', p.count);
        $('#product-add-to-cart').attr('data-id', p.id);

        if (p.count) {
          $('#product-add-to-cart').show();
          $('#product-stock-ok').show();
          $('#product-stock-none').hide();
        } else {
          $('#product-add-to-cart').hide();
          $('#product-stock-ok').hide();
          $('#product-stock-none').show();
        }

        $('#description-product').html(p.description || '');
        $('#description-ingredients').html(p.ingridients || '');
        $('#description-application').html(p.applying || '');

        const $related = $('#related-products');
        $related.find('.artising-container').remove();
        (res.relatedProducts || []).forEach(function (rp) {
          $related.append(
            `<a href="${IziApi.hrefProduct(rp.url)}" class="artising-container">
              <div class="artising-img" style="background-image: url('${IziApi.productImage(rp.image)}')"></div>
              <div class="artising-text">${IziApi.escapeHtml(rp.name)}</div>
            </a>`
          );
        });
      }).fail(function () {
        $('#product-container').html('<p style="padding:40px;">Товар не найден</p>');
      });
    },
    destroy: function () {},
  };
})(window, jQuery);
