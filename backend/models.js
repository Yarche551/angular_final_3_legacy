const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, default: null },
}, { collection: 'brands' });

const subcategorySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  category: { type: String, required: true },
  name: { type: String, required: true },
}, { collection: 'subcategories' });

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  brand_id: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  old_price: { type: Number, default: null },
  short_description: { type: String, default: null },
  is_hit: { type: Number, default: 0 },
  is_new: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  description: { type: String, default: null },
  ingridients: { type: String, default: null },
  applying: { type: String, default: null },
  count: { type: Number, default: 0 },
  image: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true, unique: true },
  bought_count: { type: Number, default: 0 },
  skin: { type: String, default: null },
  subcategory_id: { type: Number, required: true },
}, { collection: 'products' });

const orderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, default: null },
  address: { type: String, default: null },
  type: { type: String, required: true },
  comment: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  status: { type: String, default: 'new' },
  pickup_info: { type: String, default: null },
}, { collection: 'orders' });

const orderProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  product_id: { type: Number, required: true },
  order_id: { type: Number, required: true },
  count: { type: Number, required: true },
}, { collection: 'order_products' });

const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
}, { collection: 'questions' });

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, default: null },
  last_name: { type: String, default: null },
  is_admin: { type: Number, default: 0 },
  auth_key: { type: String, default: null },
  password_hash: { type: String, required: true },
  password_reset_token: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  status: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  verification_token: { type: String, default: null },
  updated_at: { type: Date, default: Date.now },
}, { collection: 'users' });

const paymentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  order_id: { type: Number, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: null },
  ps_description: { type: String, default: null },
  ps_type: { type: String, default: null },
  ps_id: { type: String, default: null },
  cancel_party: { type: String, default: null },
  cancel_reason: { type: String, default: null },
  status: { type: String, default: 'new' },
  processed: { type: Number, default: 0 },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  valid_till: { type: Date, default: null },
  confirmation_token: { type: String, default: null },
}, { collection: 'payments' });

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
}, { collection: 'counters' });

const Brand = mongoose.model('Brand', brandSchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const OrderProduct = mongoose.model('OrderProduct', orderProductSchema);
const Question = mongoose.model('Question', questionSchema);
const User = mongoose.model('User', userSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Counter = mongoose.model('Counter', counterSchema);

async function nextId(name) {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

module.exports = {
  Brand,
  Subcategory,
  Product,
  Order,
  OrderProduct,
  Question,
  User,
  Payment,
  Counter,
  nextId,
};
