(function (window, $) {
  window.IziPages = window.IziPages || {};
  let bound = false;

  function go(url) {
    if (window.IziRouter) IziRouter.go(url);
    else location.href = url;
  }

  function bindOnce() {
    if (bound) return;
    bound = true;

    $(document).on('change', '#order-container .radio_input', function () {
      const deliveryBlock = $('#delivery-block-custom');
      const pickupBlock = $('#sdek-choose');
      if ($(this).is('#delivery')) {
        pickupBlock.hide();
        deliveryBlock.fadeIn();
        $('#pickup_info').val('');
      } else {
        deliveryBlock.hide();
        pickupBlock.fadeIn();
      }
    });

    $(document).on('submit', '#order-container', function (e) {
      e.preventDefault();
      if (!$('#name').val() || !$('#phone').val()) {
        $('.alert').show();
        return;
      }
      if ($('#delivery').prop('checked') && !$('#address').val()) {
        $('.alert').show();
        return;
      }

      const payload = {
        name: $('#name').val(),
        phone: $('#phone').val(),
        type: $('input[name="type"]:checked').val(),
        address: $('#address').val(),
        comment: $('#messages').val(),
        pickup_info: $('#pickup_info').val() || 'ПВЗ (stub): будет уточнено менеджером',
      };

      IziApi.post('/orders', payload)
        .done(function (res) {
          go(res.redirect || '/thanks');
        })
        .fail(function (xhr) {
          const err = xhr.responseJSON;
          $('.alert').text((err && err.error) || 'Ошибка оформления').show();
        });
    });
  }

  IziPages.order = {
    init: function () {
      bindOnce();
      $('#delivery-block-custom').hide();
      IziApi.get('/cart').done(function (res) {
        if (!res.count) go('/');
      });
    },
    destroy: function () {},
  };
})(window, jQuery);
