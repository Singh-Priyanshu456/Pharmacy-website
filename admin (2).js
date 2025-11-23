import Product from '../models/Product.js';
import LabTest from '../models/LabTest.js';

export const createProduct = async (req,res)=>{ const p = await Product.create(req.body); res.json(p); };
export const updateProduct = async (req,res)=>{ const p = await Product.findOneAndUpdate({slug:req.params.slug}, req.body, {new:true}); if(!p) return res.status(404).json({message:'Not found'}); res.json(p); };
export const deleteProduct = async (req,res)=>{ const p = await Product.findOneAndDelete({slug:req.params.slug}); if(!p) return res.status(404).json({message:'Not found'}); res.json({ok:true}); };

export const createLabTest = async (req,res)=>{ const t = await LabTest.create(req.body); res.json(t); };
export const updateLabTest = async (req,res)=>{ const t = await LabTest.findOneAndUpdate({slug:req.params.slug}, req.body, {new:true}); if(!t) return res.status(404).json({message:'Not found'}); res.json(t); };
export const deleteLabTest = async (req,res)=>{ const t = await LabTest.findOneAndDelete({slug:req.params.slug}); if(!t) return res.status(404).json({message:'Not found'}); res.json({ok:true}); };
