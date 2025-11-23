import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function(req,file,cb){
    const dir = 'uploads/prescriptions';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function(req,file,cb){
    const ts = Date.now();
    cb(null, ts + '-' + file.originalname.replace(/\s+/g,'_'));
  }
});
export const upload = multer({ storage });

export const handlePrescription = (req,res)=>{
  res.json({ message:'Uploaded', file: { path: req.file.path, size: req.file.size } });
};