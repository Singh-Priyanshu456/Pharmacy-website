import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import LabTest from '../src/models/LabTest.js';
import { connectDB } from '../src/config/db.js';
import fs from 'fs';

const products = JSON.parse(fs.readFileSync(new URL('./products.json', import.meta.url)));
const labtests = JSON.parse(fs.readFileSync(new URL('./labtests.json', import.meta.url)));

(async () => {
  try{
    await connectDB(process.env.MONGO_URI);
    await Product.deleteMany({}); await LabTest.deleteMany({});
    await Product.insertMany(products);
    await LabTest.insertMany(labtests);
    console.log('Seeded successfully');
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();

import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

// Create default admin
const adminEmail = process.env.ADMIN_EMAIL || 'admin@carekart.local';
const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123';
const adminName = 'Admin';

(async () => {
  try{
    await connectDB(process.env.MONGO_URI);
    await Product.deleteMany({}); await LabTest.deleteMany({});
    await Product.insertMany(products);
    await LabTest.insertMany(labtests);
    // upsert admin
    const exists = await User.findOne({email: adminEmail});
    const hash = await bcrypt.hash(adminPass, 10);
    if(!exists){
      await User.create({ name: adminName, email: adminEmail, password: hash, role:'admin' });
      console.log('Admin created:', adminEmail);
    }else{
      exists.password = hash; exists.role='admin'; await exists.save();
      console.log('Admin updated:', adminEmail);
    }
    console.log('Seeded successfully');
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
