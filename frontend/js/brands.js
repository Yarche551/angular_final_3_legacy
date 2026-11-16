(function (window, $) {
  window.IziPages = window.IziPages || {};

  function loadBrands() {
    const params = new URLSearchParams(location.search);
    const page = Number(params.get('page')) || 1;
    IziApi.get('/brands', { page: page, pageSize: 30, withImage: 1 }).done(function (res) {
      const $box = $('#brands-container-img');
      if (!$box.length) return;
      $box.empty();
      (res.brands || []).forEach(function (brand) {
        if (!brand.image) return;
        const src = IziApi.brandImage(brand.image);
        $box.append(
          '<a href="' + IziApi.hrefProducts({ brand: brand.id }) + '">' +
          '<img src="' + src + '" alt="' + IziApi.escapeHtml(brand.name) + '">' +
          '</a>'
        );
      });
      $('#brands-pagination').html(IziApi.renderPagination(res.pagination, function (p) {
        return IziApi.hrefPage('/brands', { page: p });
      }));
      try { if (window.WOW) new WOW().init(); } catch (e) {}
    });
  }

  IziPages.brands = {
    init: function () { loadBrands(); },
    destroy: function () {},
  };
})(window, jQuery);
