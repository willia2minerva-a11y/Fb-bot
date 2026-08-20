import mongoose from 'mongoose';

const itemGateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: 'item_gate' },
  description: String,
  rarity: String,
  level: Number,
  stats: mongoose.Schema.Types.Mixed,
  source: String,
  price: Number
}, { timestamps: true, strict: false });

export const ItemGate = mongoose.model('ItemGate', itemGateSchema);
