(function (window, $) {
  window.IziPages = window.IziPages || {};
  let bound = false;

  function bindOnce() {
    if (bound) return;
    bound = true;

    $(document).on('submit', '#contact-feedback', function (e) {
      e.preventDefault();
      const name = $('#name').val();
      const email = $('#mail').val();
      const message = $('#comment').val();
      if (!name || !email || !message) {
        $('#feedback-alert').show();
        return;
      }
      $('#feedback-alert').hide();
      IziApi.post('/questions', { name: name, email: email, message: message })
        .done(function (res) {
          alert(res.message || 'Спасибо!');
          const form = document.getElementById('contact-feedback');
          if (form) form.reset();
        })
        .fail(function () {
          alert('Возникла ошибка');
        });
    });
  }

  IziPages.contact = {
    init: function () {
      bindOnce();
    },
    destroy: function () {},
  };
})(window, jQuery);
