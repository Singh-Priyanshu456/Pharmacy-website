import { Router } from 'express';
import { listLabTests } from '../controllers/labtests.js';
const r = Router();
r.get('/', listLabTests);
export default r;