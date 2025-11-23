import { Router } from 'express';
import { auth, asyncWrap } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import { createProduct, updateProduct, deleteProduct, createLabTest, updateLabTest, deleteLabTest } from '../controllers/admin.js';

const r = Router();
r.post('/products', auth, adminOnly, asyncWrap(createProduct));
r.put('/products/:slug', auth, adminOnly, asyncWrap(updateProduct));
r.delete('/products/:slug', auth, adminOnly, asyncWrap(deleteProduct));

r.post('/labtests', auth, adminOnly, asyncWrap(createLabTest));
r.put('/labtests/:slug', auth, adminOnly, asyncWrap(updateLabTest));
r.delete('/labtests/:slug', auth, adminOnly, asyncWrap(deleteLabTest));

export default r;