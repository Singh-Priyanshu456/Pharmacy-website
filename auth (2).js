import jwt from 'jsonwebtoken';
export function auth(req,res,next){
  const hdr = req.headers.authorization || '';
  if(!hdr.startsWith('Bearer ')) return res.status(401).json({message:'Unauthorized'});
  try{
    const token = hdr.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch(e){ return res.status(401).json({message:'Invalid token'}); }
}
export function asyncWrap(fn){ return (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next) }