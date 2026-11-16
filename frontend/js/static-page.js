(function (window) {
  window.IziPages = window.IziPages || {};
  ['about', 'delivery', 'thanks', 'privacy', 'agreement', 'delivery-conditions', 'contact'].forEach(function (name) {
    if (!IziPages[name]) {
      IziPages[name] = { init: function () {}, destroy: function () {} };
    }
  });
})(window);
