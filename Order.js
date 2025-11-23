import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, default: 1 }
  }],
  address: {
    name: String, phone: String, line: String, city: String, pincode: String
  },
  payment: String,
  status: { type: String, default: 'Processing' },
  total: Number
},{timestamps:true});
export default mongoose.model('Order', orderSchema);
