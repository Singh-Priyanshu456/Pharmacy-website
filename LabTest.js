import mongoose from 'mongoose';
const labTestSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  price: Number,
  mrp: Number,
  report_tat: String,
  prep: String,
  parameters: Number
},{timestamps:true});
export default mongoose.model('LabTest', labTestSchema);
