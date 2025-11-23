import LabTest from '../models/LabTest.js';
export const listLabTests = async (req,res)=>{ res.json(await LabTest.find().sort({createdAt:-1})); };