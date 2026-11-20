const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { connectDb } = require('./db');
const {
  Brand,
  Subcategory,
  Product,
  Order,
  OrderProduct,
  Question,
  User,
  Payment,
  nextId,
} = require('./models');

const CATEGORY_LABELS = {
  face: 'Для лица',
  body: 'Для тела',
  hair: 'Для волос',
  child: 'Для детей',
  hit: 'Хиты',
  new: 'Новинки',
  discount: 'Акции',
  set: 'Наборы',
  men: 'Для мужчин',
};

function ensureCart(req) {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

function mapProduct(doc, brandMap, subMap) {
  if (!doc) return null;
  const p = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const brand = brandMap ? brandMap.get(p.brand_id) : null;
  const sub = subMap ? subMap.get(p.subcategory_id) : null;
  return {
    id: p.id,
    brand_id: p.brand_id,
    brand_name: brand ? brand.name : (p.brand_name || null),
    name: p.name,
    price: p.price,
    old_price: p.old_price,
    short_description: p.short_description,
    is_hit: p.is_hit,
    is_new: p.is_new,
    created_at: p.created_at,
    description: p.description,
    ingridients: p.ingridients,
    applying: p.applying,
    count: p.count,
    image: p.image,
    size: p.size,
    url: p.url,
    bought_count: p.bought_count,
    skin: p.skin,
    subcategory_id: p.subcategory_id,
    subcategory_name: sub ? sub.name : (p.subcategory_name || null),
    subcategory_category: sub ? sub.category : (p.subcategory_category || null),
  };
}

async function loadMaps() {
  const [brands, subs] = await Promise.all([
    Brand.find().lean(),
    Subcategory.find().lean(),
  ]);
  return {
    brandMap: new Map(brands.map((b) => [b.id, b])),
    subMap: new Map(subs.map((s) => [s.id, s])),
  };
}

async function enrichProducts(products) {
  const { brandMap, subMap } = await loadMaps();
  return products.map((p) => mapProduct(p, brandMap, subMap));
}

function paginationMeta(total, page, pageSize) {
  return {
    page,
    pageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

async function getCartSnapshot(req) {
  const cart = ensureCart(req);
  const ids = Object.keys(cart).map(Number);
  if (!ids.length) {
    return { positions: [], products: [], total: 0, count: 0 };
  }

  const rows = await Product.find({ id: { $in: ids } }).lean();
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  const positions = [];
  let total = 0;
  let count = 0;

  for (const id of ids) {
    const product = byId[id];
    if (!product) continue;
    const qty = cart[id];
    const lineTotal = Math.round(qty * product.price);
    positions.push({
      id: product.id,
      count: qty,
      price: product.price,
      name: product.name,
      image: product.image,
      max: product.count,
      total: lineTotal,
      url: product.url,
    });
    total += lineTotal;
    count += qty;
  }

  return { positions, products: positions, total, count };
}

function sendError(res, status, message, errors) {
  return res.status(status).json({ error: message, errors: errors || null });
}

function sortSpec(sort) {
  switch (sort) {
    case 'price_low': return { price: 1 };
    case 'price_high': return { price: -1 };
    case 'new': return { is_new: -1 };
    case 'discount': return { old_price: -1 };
    case 'hit': return { is_hit: -1 };
    default: return { bought_count: -1 };
  }
}

async function createApp() {
  await connectDb();

  const app = express();

  app.use(cors({credentials: true, origin: true}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    name: 'izi.sid',
    secret: config.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    },
  }));

  const uploadPath = path.join(__dirname, '..', 'backend', 'upload');
  if (fs.existsSync(uploadPath)) {
    app.use('/upload', express.static(uploadPath));
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, db: 'mongodb' });
  });

  app.get('/api/meta/categories', async (_req, res) => {
    try {
      const rows = await Subcategory.find().sort({ category: 1, name: 1 }).lean();
      const grouped = {};
      for (const row of rows) {
        if (!grouped[row.category]) grouped[row.category] = [];
        grouped[row.category].push(row);
      }
      res.json({ labels: CATEGORY_LABELS, categories: grouped, list: rows });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка загрузки категорий');
    }
  });

  app.get('/api/brands', async (req, res) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(60, Number(req.query.pageSize) || 30);
      const withImage = req.query.withImage !== '0';

      let filter = {};
      if (withImage) {
        filter = { image: { $nin: [null, ''] } };
      }

      let total = await Brand.countDocuments(filter);
      if (withImage && total === 0) {
        filter = {};
        total = await Brand.countDocuments(filter);
      }

      const brands = await Brand.find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();

      res.json({ brands, pagination: paginationMeta(total, page, pageSize) });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка загрузки брендов');
    }
  });

  app.get('/api/brands/all', async (_req, res) => {
    try {
      const brands = await Brand.find({}, { id: 1, name: 1, image: 1, _id: 0 }).sort({ name: 1 }).lean();
      res.json({ brands });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка загрузки брендов');
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(48, Number(req.query.pageSize) || 16);
      const category = req.query.category || null;
      const subcategory = req.query.subcategory ? Number(req.query.subcategory) : null;
      const sort = req.query.sort || null;
      const priceFrom = req.query.price_from ? Number(req.query.price_from) : null;
      const priceTo = req.query.price_to ? Number(req.query.price_to) : null;
      const sizeFrom = req.query.size_from ? Number(req.query.size_from) : null;
      const sizeTo = req.query.size_to ? Number(req.query.size_to) : null;
      const brand = req.query.brand ? Number(req.query.brand) : null;
      const skin = req.query.skin || null;
      const hitsOnly = req.query.hits === '1' || req.query.hits === 'true';

      const filter = {};

      if (hitsOnly) {
        filter.is_hit = 1;
      } else if (category) {
        if (category === 'discount') {
          filter.old_price = { $ne: null };
        } else if (category === 'hit') {
          filter.is_hit = 1;
        } else if (category === 'new') {
          filter.is_new = 1;
        } else if (subcategory) {
          filter.subcategory_id = subcategory;
        } else {
          const subs = await Subcategory.find({ category }).lean();
          const ids = subs.map((s) => s.id);
          filter.subcategory_id = ids.length ? { $in: ids } : { $in: [] };
        }
      }

      if (priceFrom != null && !Number.isNaN(priceFrom)) {
        filter.price = Object.assign(filter.price || {}, { $gte: priceFrom });
      }
      if (priceTo != null && !Number.isNaN(priceTo)) {
        filter.price = Object.assign(filter.price || {}, { $lte: priceTo });
      }
      if (sizeFrom != null && !Number.isNaN(sizeFrom)) {
        filter.size = Object.assign(filter.size || {}, { $gte: sizeFrom });
      }
      if (sizeTo != null && !Number.isNaN(sizeTo)) {
        filter.size = Object.assign(filter.size || {}, { $lte: sizeTo });
      }
      if (req.query.discount_only === '1') filter.old_price = { $gt: 0 };
      if (brand) filter.brand_id = brand;
      if (skin) filter.skin = skin;

      const total = await Product.countDocuments(filter);
      const items = await Product.find(filter)
        .sort(sortSpec(sort))
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();

      let subcategoryModel = null;
      if (subcategory) {
        subcategoryModel = await Subcategory.findOne({ id: subcategory }).lean();
      }

      res.json({
        products: await enrichProducts(items),
        pagination: paginationMeta(total, page, pageSize),
        filters: {
          category,
          subcategory,
          sort,
          price_from: priceFrom,
          price_to: priceTo,
          size_from: sizeFrom,
          size_to: sizeTo,
          brand,
          skin,
        },
        subcategory: subcategoryModel,
        categoryLabel: category ? (CATEGORY_LABELS[category] || category) : null,
      });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка загрузки товаров');
    }
  });

  app.get('/api/products/search', async (req, res) => {
    try {
      const q = (req.query.query || req.query.q || '').trim();
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(48, Number(req.query.pageSize) || 16);
      const limit = req.query.limit ? Number(req.query.limit) : null;

      if (!q) {
        return res.json({ products: [], pagination: paginationMeta(0, 1, pageSize) });
      }

      const filter = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { short_description: { $regex: q, $options: 'i' } },
        ],
      };

      if (limit) {
        const products = await Product.find(filter).limit(limit).lean();
        return res.json({ products: await enrichProducts(products) });
      }

      const total = await Product.countDocuments(filter);
      const items = await Product.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();

      res.json({
        products: await enrichProducts(items),
        pagination: paginationMeta(total, page, pageSize),
        query: q,
      });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка поиска');
    }
  });

  app.get('/api/products/:url', async (req, res) => {
    try {
      const product = await Product.findOne({ url: req.params.url }).lean();
      if (!product) return sendError(res, 404, 'Товар не найден');

      let related = await Product.find({
        subcategory_id: product.subcategory_id,
        id: { $ne: product.id },
      }).limit(3).lean();

      if (!related.length) {
        related = await Product.find({ id: { $ne: product.id } }).limit(3).lean();
      }

      const enriched = await enrichProducts([product, ...related]);
      res.json({
        product: enriched[0],
        relatedProducts: enriched.slice(1),
        categoryLabels: CATEGORY_LABELS,
      });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка загрузки товара');
    }
  });

  app.get('/api/cart', async (req, res) => {
    try {
      res.json(await getCartSnapshot(req));
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка корзины');
    }
  });

  app.post('/api/cart/add', async (req, res) => {
    try {
      const id = Number(req.body.id);
      let count = Number(req.body.count);
      if (!count) count = 1;

      if (!id || count < 1) {
        return sendError(res, 400, 'Некорректные данные', { id: 'required', count: 'min 1' });
      }

      const product = await Product.findOne({ id }).lean();
      if (!product || !product.count) {
        return sendError(res, 400, 'Товар недоступен');
      }

      const cart = ensureCart(req);
      cart[id] = Math.min((cart[id] || 0) + count, product.count);
      req.session.cart = cart;

      const snap = await getCartSnapshot(req);
      res.json({ count: snap.count, total: snap.total });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка добавления в корзину');
    }
  });

  app.post('/api/cart/change', async (req, res) => {
    try {
      const id = Number(req.body.id);
      const count = Number(req.body.count);

      if (!id || !count || count < 1) {
        return sendError(res, 400, 'Некорректные данные');
      }

      const product = await Product.findOne({ id }).lean();
      if (!product) return sendError(res, 404, 'Товар не найден');

      const cart = ensureCart(req);
      if (!cart[id]) return sendError(res, 404, 'Позиция не найдена в корзине');

      cart[id] = Math.min(count, product.count);
      req.session.cart = cart;

      const snap = await getCartSnapshot(req);
      const position = snap.positions.find((p) => p.id === id);
      res.json({
        position: position ? { count: position.count, total: position.total } : null,
        total: snap.total,
        count: snap.count,
      });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка изменения корзины');
    }
  });

  app.post('/api/cart/remove', async (req, res) => {
    try {
      const id = Number(req.body.id);
      if (!id) return sendError(res, 400, 'Некорректные данные');

      const cart = ensureCart(req);
      delete cart[id];
      req.session.cart = cart;

      res.json(await getCartSnapshot(req));
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка удаления из корзины');
    }
  });

  app.post('/api/cart/clear', (req, res) => {
    req.session.cart = {};
    res.json({ count: 0, total: 0 });
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const snap = await getCartSnapshot(req);
      if (!snap.positions.length) return sendError(res, 400, 'Корзина пуста');

      const body = req.body || {};
      const name = (body.name || '').trim();
      const phone = (body.phone || '').trim();
      const type = (body.type || '').trim();
      const city = (body.city || '').trim() || null;
      const address = (body.address || '').trim() || null;
      const comment = (body.comment || '').trim() || null;
      const pickup_info = (body.pickup_info || '').trim() || null;

      const errors = {};
      if (!name) errors.name = 'Обязательное поле';
      if (!phone) errors.phone = 'Обязательное поле';
      if (!type || !['delivery', 'pickup'].includes(type)) errors.type = 'Выберите способ получения';
      if (type === 'delivery' && !address) errors.address = 'Укажите адрес';
      if (Object.keys(errors).length) {
        return sendError(res, 422, 'Ошибка валидации', errors);
      }

      const orderId = await nextId('order');
      const info = type === 'pickup'
        ? (pickup_info || 'ПВЗ (учебный stub): будет уточнено менеджером')
        : null;

      let amount = 0;
      for (const pos of snap.positions) {
        amount += pos.total;
        const opId = await nextId('order_product');
        await OrderProduct.create({
          id: opId,
          product_id: pos.id,
          order_id: orderId,
          count: pos.count,
        });

        const product = await Product.findOne({ id: pos.id });
        if (product) {
          let left = product.count - pos.count;
          if (left < 0) left = 0;
          product.count = left;
          product.bought_count += pos.count;
          await product.save();
        }
      }

      await Order.create({
        id: orderId,
        name,
        phone,
        city,
        address,
        type,
        comment,
        status: 'paid',
        pickup_info: info,
      });

      const paymentId = await nextId('payment');
      const validTill = new Date(Date.now() + 60 * 60 * 1000);
      await Payment.create({
        id: paymentId,
        order_id: orderId,
        amount,
        description: `Оплата заказа номер ${orderId}`,
        ps_description: `Оплата заказа номер ${orderId}`,
        ps_type: 'stub',
        status: 'success',
        processed: 1,
        valid_till: validTill,
        confirmation_token: 'stub-token',
      });

      req.session.cart = {};
      res.status(201).json({
        success: true,
        order: { id: orderId, status: 'paid', amount },
        payment: {
          id: paymentId,
          status: 'success',
          stub: true,
          message: 'Оплата захардкожена (учебный проект). Заказ считается оплаченным.',
        },
        redirect: '/thanks',
      });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Не удалось создать заказ');
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const order = await Order.findOne({ id: Number(req.params.id) }).lean();
      if (!order) return sendError(res, 404, 'Заказ не найден');

      const ops = await OrderProduct.find({ order_id: order.id }).lean();
      const productIds = ops.map((o) => o.product_id);
      const products = await Product.find({ id: { $in: productIds } }).lean();
      const byId = Object.fromEntries(products.map((p) => [p.id, p]));

      const items = ops.map((op) => {
        const p = byId[op.product_id] || {};
        return {
          ...op,
          name: p.name,
          price: p.price,
          image: p.image,
          url: p.url,
        };
      });

      res.json({ order, items });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка загрузки заказа');
    }
  });

  app.get('/api/delivery/estimate', async (req, res) => {
    const cartTotal = Number(req.query.total) || (await getCartSnapshot(req)).total;
    const type = req.query.type || 'pickup';
    const freeFrom = type === 'pickup' ? 2500 : 3000;
    const cost = cartTotal < freeFrom ? (type === 'pickup' ? 200 : 350) : 0;
    res.json({
      type,
      cost,
      freeFrom,
      stub: true,
      message: 'Расчёт доставки захардкожен для учебного проекта',
    });
  });

  app.post('/api/questions', async (req, res) => {
    try {
      const name = (req.body.name || '').trim();
      const email = (req.body.email || '').trim();
      const message = (req.body.message || '').trim();
      const errors = {};
      if (!name) errors.name = 'Обязательное поле';
      if (!email) errors.email = 'Обязательное поле';
      if (!message) errors.message = 'Обязательное поле';
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Некорректный email';
      }
      if (Object.keys(errors).length) {
        return sendError(res, 422, 'Ошибка валидации', errors);
      }

      const id = await nextId('question');
      await Question.create({ id, name, email, message });

      res.status(201).json({
        success: true,
        id,
        message: 'Спасибо! Мы скоро свяжемся с Вами',
      });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Не удалось отправить сообщение');
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const email = (req.body.email || '').trim();
      const password = req.body.password || '';
      if (!email || !password) {
        return sendError(res, 422, 'Укажите email и пароль');
      }

      const user = await User.findOne({ email, status: 1 }).lean();
      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return sendError(res, 401, 'Неверный логин или пароль');
      }

      req.session.userId = user.id;
      res.json({
        user: {
          id: user.id,
          name: user.name,
          last_name: user.last_name,
          email: user.email,
          is_admin: user.is_admin,
        },
      });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка авторизации');
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.userId = null;
    res.json({ success: true });
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      if (!req.session.userId) return res.json({ user: null });
      const user = await User.findOne(
        { id: req.session.userId },
        { id: 1, name: 1, last_name: 1, email: 1, is_admin: 1, _id: 0 }
      ).lean();
      res.json({ user: user || null });
    } catch (e) {
      console.error(e);
      sendError(res, 500, 'Ошибка');
    }
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    sendError(res, 500, 'Внутренняя ошибка сервера');
  });

  app.use((_req, res) => {
    sendError(res, 404, 'Не найдено');
  });

  app.listen(config.port, () => {
    console.log(`IZI API listening on http://localhost:${config.port}`);
    console.log(`CORS origin: ${config.frontendOrigin}`);
    console.log(`MongoDB: ${config.db.dbUrl}/${config.db.dbName}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
