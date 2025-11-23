import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const createOrder = async (req,res)=>{
  const userId = req.user?.id;
  const { items, address, payment } = req.body;
  if(!Array.isArray(items) || !items.length) return res.status(400).json({message:'Cart empty'});
  // items: [{slug, qty}]
  const slugs = items.map(i=>i.slug);
  const products = await Product.find({ slug: { $in: slugs } });
  const productMap = Object.fromEntries(products.map(p=>[p.slug, p]));
  const lineItems = items.map(i => ({ product: productMap[i.slug]._id, qty: Math.max(1, i.qty||1) }));
  const total = lineItems.reduce((a,li)=>a + (productMap[items.find(i=>productMap[i.slug]._id.equals(li.product)).slug].price * li.qty), 0);
  const order = await Order.create({ user: userId, items: lineItems, address, payment, total });
  res.json(order);
};

export const listOrders = async (req,res)=>{
  const items = await Order.find({ user: req.user.id }).sort({ createdAt:-1 }).populate('items.product');
  res.json(items);
};