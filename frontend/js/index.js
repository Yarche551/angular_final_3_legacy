(function (window, $) {
  window.IziPages = window.IziPages || {};

  function initSlider() {
    const $slider = $('#banner-slider');
    if ($slider.length && $.fn.slick && !$slider.hasClass('slick-initialized')) {
      setTimeout(function () {
        $slider.slick({
          dots: true,
          infinite: true,
          slidesToScroll: 1,
          slidesToShow: 1,
          adaptiveHeight: true,
          autoplay: true,
          autoplaySpeed: 2000,
        });
      }, 100)
    }
  }

  function loadHits() {
    const params = new URLSearchParams(location.search);
    const page = Number(params.get('page')) || 1;
    IziApi.get('/products', { hits: 1, page: page, pageSize: 16 }).done(function (res) {
      const $list = $('#sale-goods-main-container');
      $list.empty();
      (res.products || []).forEach(function (p) {
        $list.append(IziApi.renderProductCard(p));
      });
      $('#hit-pagination').html(IziApi.renderPagination(res.pagination, function (p) {
        return IziApi.hrefPage('/', { page: p });
      }));
    });
  }

  IziPages.home = {
    init: function () {
      initSlider();
      loadHits();
    },
    destroy: function () {
      const $slider = $('#banner-slider');
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick');
      }
    },
  };
})(window, jQuery);
