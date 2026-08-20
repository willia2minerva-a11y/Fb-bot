import mongoose from 'mongoose';

const accessorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: 'accessory' },
  description: String,
  rarity: String,
  level: Number,
  stats: mongoose.Schema.Types.Mixed,
  effects: mongoose.Schema.Types.Mixed,
  source: String,
  price: Number,
  craftable: Boolean,
  recipe: mongoose.Schema.Types.Mixed
}, { timestamps: true, strict: false });

export const Accessory = mongoose.model('Accessory', accessorySchema);
