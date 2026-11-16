(function (window, $) {
  window.IziPages = window.IziPages || {};
  let bound = false;

  function go(url) {
    if (window.IziRouter) IziRouter.go(url);
    else location.href = url;
  }

  function renderCart(res) {
    const $box = $('#cart-block-gods');
    $box.empty();
    res.positions.forEach(function (product) {
      $box.append(`
      <div class="cart-block" data-id="${product.id}">
        <div class="cart-block-img" style="background-image: url('${IziApi.productImage(product.image)}')"></div>
        <div class="cart-close"><img src="/images/menu-close.png" alt=""></div>
        <div class="cart-block-descr">
          <div class="cart-block-text">${IziApi.escapeHtml(product.name)}</div>
          <div class="cart-milliliter">${product.price} руб.</div>
          <div class="cart-block-specification">
            <div class="quantity-block">
              <button class="quantity-arrow-minus cart-count-change" data-action="remove"> -</button>
              <input class="quantity-num" disabled type="number" value="${product.count}"/>
              <button class="quantity-arrow-plus cart-count-change" data-action="add" data-max="${product.max}"> +</button>
            </div>
            <div class="cart-block-price"><span>${product.total}</span> руб.</div>
          </div>
        </div>
      </div>`);
    });
    $('#cart-count-block').text(res.count);
    $('#cart-total-block span').text(res.total);
  }

  function bindOnce() {
    if (bound) return;
    bound = true;

    $(document).on('click', '.cart-block .cart-count-change', function () {
      const element = $(this);
      const parent = element.closest('.cart-block');
      const quantityNum = parent.find('.quantity-num');
      let number = Number(quantityNum.val());
      if (element.attr('data-action') === 'add') {
        number++;
        if (number > parseInt(element.attr('data-max'), 10)) return;
      } else {
        number--;
        if (number === 0) return;
      }
      IziApi.post('/cart/change', { id: parent.attr('data-id'), count: number }).done(function (res) {
        $('#count-cart').text(res.count);
        $('#cart-count-block').text(res.count);
        $('#cart-total-block span').text(res.total);
        quantityNum.val(res.position.count);
        parent.find('.cart-block-price span').text(res.position.total);
      });
    });

    $(document).on('click', '.cart-close', function () {
      const parent = $(this).closest('.cart-block');
      IziApi.post('/cart/remove', { id: parent.attr('data-id') }).done(function (res) {
        if (res.count === 0) {
          go('/');
          return;
        }
        $('#count-cart').text(res.count);
        parent.remove();
        $('#cart-count-block').text(res.count);
        $('#cart-total-block span').text(res.total);
      });
    });
  }

  IziPages.cart = {
    init: function () {
      bindOnce();
      IziApi.get('/cart').done(function (res) {
        if (!res.count) {
          go('/');
          return;
        }
        renderCart(res);
      });
    },
    destroy: function () {},
  };
})(window, jQuery);
