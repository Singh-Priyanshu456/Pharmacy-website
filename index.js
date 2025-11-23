import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import labtestRoutes from './routes/labtests.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/uploads.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// static frontend
app.use(express.static(path.join(__dirname, '../../client')));
// static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// api
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/labtests', labtestRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// spa-ish fallback: send index for root
app.get('/', (req,res)=>res.sendFile(path.join(__dirname, '../../client/index.html')));

app.use((req,res)=>res.status(404).json({message:'Not Found'}));

const PORT = process.env.PORT || 8080;
connectDB(process.env.MONGO_URI).then(()=>{
  app.listen(PORT, ()=>console.log('Server running on port', PORT));
}).catch(err=>{
  console.error('DB error', err);
  process.exit(1);
});
