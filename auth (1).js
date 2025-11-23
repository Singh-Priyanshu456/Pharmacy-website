import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const sign = (user) => jwt.sign({ id:user._id, email:user.email, role:user.role }, process.env.JWT_SECRET, { expiresIn:'7d' });

export const register = async (req,res)=>{
  const { name, email, password } = req.body;
  if(!name || !email || !password) return res.status(400).json({message:'All fields required'});
  const exists = await User.findOne({email});
  if(exists) return res.status(400).json({message:'Email already registered'});
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role: 'user' });
  const token = sign(user);
  res.json({ user: { _id:user._id, name:user.name, email:user.email, role:user.role }, token });
};

export const login = async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({message:'Invalid credentials'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({message:'Invalid credentials'});
  const token = sign(user);
  res.json({ user: { _id:user._id, name:user.name, email:user.email, role:user.role }, token });
};