(function (window, $) {
  window.IziPages = window.IziPages || {};

  IziPages.search = {
    init: function () {
      const params = new URLSearchParams(location.search);
      const query = params.get('query') || '';
      $('#search-query-label').text(query);
      const $list = $('#sale-goods-main-container');
      const $pagination = $('#search-pagination');
      IziApi.get('/products/search', {
        query: query,
        page: Number(params.get('page')) || 1,
        pageSize: 16,
      }).done(function (res) {
        $list.empty();
        if (!res.products.length) {
          $list.html('<div id="no-products">Товары по выбранным параметрам отсутствуют. Попробуйте изменить фильтр</div>');
        } else {
          res.products.forEach(function (p) {
            $list.append(IziApi.renderProductCard(p));
          });
        }
        $pagination.html(IziApi.renderPagination(res.pagination, function (p) {
          return IziApi.hrefPage('/search', { query: query, page: p });
        }));
      });
    },
    destroy: function () {},
  };
})(window, jQuery);
