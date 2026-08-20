import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: 'other' },
  description: String,
  rarity: String,
  level: Number,
  attack: Number,
  defense: Number,
  attackSpeed: Number,
  critChance: Number,
  element: String,
  stats: mongoose.Schema.Types.Mixed,
  materials: [{ id: String, count: Number }],
  source: String,
  dropChance: Number,
  craftable: Boolean,
  recipe: mongoose.Schema.Types.Mixed,
  price: Number,
  stackable: { type: Boolean, default: true },
  maxStack: Number,
  emoji: String
}, { timestamps: true, strict: false });

export const Item = mongoose.model('Item', itemSchema);
