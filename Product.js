import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  brand: String,
  price: Number,
  mrp: Number,
  pack_size: String,
  rx_required: Boolean,
  category: String,
  thumbnail: String,
  description: String,
  uses: [String],
  directions: String,
  safety: String
},{timestamps:true});
export default mongoose.model('Product', productSchema);
