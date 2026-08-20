import mongoose from 'mongoose';

const armorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: 'armor' },
  description: String,
  rarity: String,
  level: Number,
  defense: Number,
  healthBonus: Number,
  manaBonus: Number,
  stats: mongoose.Schema.Types.Mixed,
  materials: [{ id: String, count: Number }],
  source: String,
  price: Number,
  craftable: Boolean,
  recipe: mongoose.Schema.Types.Mixed
}, { timestamps: true, strict: false });

export const Armor = mongoose.model('Armor', armorSchema);
