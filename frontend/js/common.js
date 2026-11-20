let basketRequest;
let cartMutation = $.Deferred().resolve().promise();

function mutateCart(action, data) {
  function send() {
    return IziApi.post('/cart/' + action, data).done(updateCartSummary);
  }

  cartMutation = cartMutation.then(send, send);
  return cartMutation;
}

function updateCartSummary(cart) {
  $('#count-cart, #basket-count-top').text(cart.count);
  $('#basket-price-top').text(cart.total);
}

function renderBasket(cart) {
  $('#basket-positions').html(cart.positions.map(function (item) {
    return `<div class="basket-block" data-id="${item.id}">
      <div class="basket-block-img">
        <img src="${IziApi.productImage(item.image)}" alt="">
      </div>
      <div class="basket-block-descr">
        <div class="basket-close"><img src="/images/menu-close.png" alt=""></div>
        <div class="basket-block-text">${IziApi.escapeHtml(item.name)}</div>
        <div class="basket-block-characters">
          <div>${item.count} шт.</div>
          <div>${item.total} руб.</div>
        </div>
      </div>
    </div>`;
  }).join(''));
}

function closeBasket() {
  if (basketRequest) basketRequest.abort();
  $('#basket-container').stop(true, true).hide();
}

function flyToCart($image) {
  const cartElem = $('#header-basket-img');
  if (!$image.length || !cartElem.length) return;
  const left = cartElem.offset().left;
  const top = cartElem.offset().top;
  $image.clone()
    .css({
      position: 'absolute',
      zIndex: 11100,
      top: $image.offset().top,
      left: $image.offset().left,
      width: $image.width(),
      height: $image.height(),
    })
    .appendTo('body')
    .animate({ opacity: 0.05, left: left, top: top, width: 20, height: 20 }, 1000, function () {
      $(this).remove();
    });
}

function navigateTo(url) {
  if (window.IziRouter) IziRouter.go(url);
  else location.href = url;
}

$(document).ready(function () {
  $(document).on('click', '#goods-container-search', function () {
    const $dropdown = $('#dropdown-search');
    if ($dropdown.children().length) $dropdown.show();
  });

  let myTimer = 0;
  $(document).on('keyup', '#search', function (event) {
    if (myTimer) clearTimeout(myTimer);
    myTimer = setTimeout(function () {
      const element = $(event.target);
      const $dropdown = $('#dropdown-search');
      if (element.val() && element.val().length >= 3) {
        IziApi.get('/products/search', { query: element.val(), limit: 5 }).done(function (res) {
          $dropdown.empty();
          if (res && res.products && res.products.length > 0) {
            res.products.forEach(function (item) {
              $dropdown.append(
                `<a href="${IziApi.hrefProduct(item.url)}" class="dropdown-container">
                  <div class="dropdown-image"><img src="${IziApi.productImage(item.image)}" alt=""></div>
                  <div class="dropdown-text">${IziApi.escapeHtml(item.name)}</div>
                </a>`
              );
            });
            $dropdown.show();
          } else {
            $dropdown.hide();
          }
        });
      } else {
        $dropdown.empty().hide();
      }
    }, 400);
  });

  $(document).mouseup(function (e) {
    if (!$(e.target).closest('#basket-container, .open-basket').length) closeBasket();
    const $dropdown = $('#dropdown-search');
    const $searchBox = $('#goods-container-search');
    if (!$dropdown.is(e.target) && $dropdown.has(e.target).length === 0 &&
        !$searchBox.is(e.target) && $searchBox.has(e.target).length === 0) {
      $dropdown.fadeOut();
    }
    const divGoods = $('.goods-container-subparagraph');
    if (!divGoods.is(e.target) && divGoods.has(e.target).length === 0) divGoods.fadeOut();
  });

  $(document).on('click', '#basket-container .basket-close', function (event) {
    event.stopPropagation();
    const block = $(event.target).closest('.basket-block');
    mutateCart('remove', { id: block.data('id') }).done(function (cart) {
      renderBasket(cart);
      if (!cart.count) closeBasket();
    });
  });

  $(document).on('click', '.open-basket', function (e) {
    e.preventDefault();
    const $basket = $('#basket-container');
    if (IziRoutes.match(location.pathname).name === 'cart') return;
    if (!Number($('#count-cart').text())) {
      navigateTo('/cart');
      return;
    }
    if ($basket.is(':visible')) {
      closeBasket();
      return;
    }

    if (basketRequest) basketRequest.abort();
    basketRequest = IziApi.get('/cart').done(function (cart) {
      updateCartSummary(cart);
      renderBasket(cart);
      if (cart.count) $basket.show();
    });
  });

  $(document).on('click', '#burger-main', function () {
    $('#burger-bg').show();
    $('#burger-main').hide();
    $('#burger-cross').show();
    $('#header-container').css({ position: 'fixed', width: '100%', maxWidth: '-webkit-fill-available', zIndex: 999, background: '#FFFFFF' });
    $('#banner').css('padding-top', '90px');
  });

  $(document).on('click', '#burger-bg', function (e) {
    if (e.target.id === 'burger-bg') {
      $('#burger-bg').hide();
      $('#burger-cross').hide();
      $('#burger-main').show();
      $('#header-container').css({ position: 'unset', width: 'unset' });
      $('#banner').css('padding-top', '0');
    }
  });

  $(document).on('click', '#burger-cross', function () {
    $('#burger-bg').hide();
    $('#burger-cross').hide();
    $('#burger-main').show();
    $('#header-container').css({ position: 'unset', width: 'unset' });
    $('#banner').css('padding-top', '0');
  });

  $(document).on('click', '#header-search-menu-item', function () {
    $('#dropdown-mobile-bg').show();
    $('#goods').show();
    $('#search-block').css('display', 'flex');
  });

  $(document).on('click', '#search-header-close, #search-header-close-text, #search-header-close-img', function () {
    $('#dropdown-mobile-bg').hide();
    $('#search-block').hide();
    $('#goods').hide();
  });

  $(document).on('mouseenter', '.goods-item', function (e) {
    const currentElement = $(e.currentTarget);
    $('.goods-container-subparagraph').hide();
    const id = currentElement.data('id');
    if (id) $('#' + id).css('display', 'flex');
    $('.goods-item').removeClass('active');
    currentElement.addClass('active');
  });

  $(document).on('mouseleave', '.goods-container-subparagraph', function () {
    $('.goods-container-subparagraph').hide();
  });

  $(document).on('click', '#searhc-ajax', function (e) {
    e.preventDefault();
    $('#searhc-form').submit();
  });

  $(document).on('click', '.product-add-to-cart', function (event) {
    event.preventDefault();
    event.stopPropagation();
    const $btn = $(this);
    const id = $btn.data('id');
    const image = $btn.closest('.gods-block').children('.gods-block-img');
    flyToCart(image);
    if (!id) {
      alert('Произошла ошибка при добавлении в корзину.');
      return;
    }
    mutateCart('add', { id: id, count: 1 });
  });
});
