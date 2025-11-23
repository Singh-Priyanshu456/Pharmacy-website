import Product from '../models/Product.js';
export const listProducts = async (req,res)=>{
  const items = await Product.find().sort({ createdAt:-1 });
  res.json(items);
};
export const getProduct = async (req,res)=>{
  const p = await Product.findOne({ slug: req.params.slug });
  if(!p) return res.status(404).json({message:'Product not found'});
  res.json(p);
};