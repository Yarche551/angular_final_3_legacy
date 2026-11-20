(function () {
  const routes = [
    { name: 'home', re: /^\/$/, tpl: '/pages/home.html' },
    { name: 'products', re: /^\/products(?:\/[^/]+)?(?:\/[^/]+)?$/, tpl: '/pages/products.html' },
    { name: 'product', re: /^\/product(?:\/[^/]+)?$/, tpl: '/pages/product.html' },
    { name: 'brands', re: /^\/brands$/, tpl: '/pages/brands.html' },
    { name: 'search', re: /^\/search$/, tpl: '/pages/search.html' },
    { name: 'cart', re: /^\/cart$/, tpl: '/pages/cart.html' },
    { name: 'order', re: /^\/order$/, tpl: '/pages/order.html' },
    { name: 'contact', re: /^\/contact$/, tpl: '/pages/contact.html' },
    { name: 'about', re: /^\/about$/, tpl: '/pages/about.html' },
    { name: 'delivery', re: /^\/delivery$/, tpl: '/pages/delivery.html' },
    { name: 'thanks', re: /^\/thanks$/, tpl: '/pages/thanks.html' },
    { name: 'privacy', re: /^\/privacy-policy$/, tpl: '/pages/privacy-policy.html' },
    { name: 'agreement', re: /^\/user-agreement$/, tpl: '/pages/user-agreement.html' },
    { name: 'delivery-conditions', re: /^\/delivery-conditions$/, tpl: '/pages/delivery-conditions.html' },
  ];

  const notFound = { name: 'notFound', tpl: '/pages/404.html' };

  function match(pathname) {
    const path = pathname.replace(/\/+$/, '').replace(/\.html$/, '') || '/';
    if (path === '/index') return routes[0];
    return routes.find(function (route) { return route.re.test(path); }) || notFound;
  }

  if (typeof module === 'object' && module.exports) module.exports = { match: match };
  else window.IziRoutes = { match: match };
})();
