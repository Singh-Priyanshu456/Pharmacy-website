import { Router } from 'express';
import { upload, handlePrescription } from '../controllers/uploads.js';
import { auth } from '../middleware/auth.js';
const r = Router();
r.post('/prescription', auth, upload.single('file'), handlePrescription);
export default r;