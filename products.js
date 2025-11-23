import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/products.js';
const r = Router();
r.get('/', listProducts);
r.get('/:slug', getProduct);
export default r;