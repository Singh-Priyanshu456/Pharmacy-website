import { Router } from 'express';
import { createOrder, listOrders } from '../controllers/orders.js';
import { auth, asyncWrap } from '../middleware/auth.js';
const r = Router();
r.get('/', auth, asyncWrap(listOrders));
r.post('/', auth, asyncWrap(createOrder));
export default r;