import mongoose from 'mongoose';

const craftingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: 'crafting' },
  description: String,
  materials: mongoose.Schema.Types.Mixed,
  tools: [String],
  requiredLevel: Number,
  time: Number,
  output: mongoose.Schema.Types.Mixed,
  category: String
}, { timestamps: true, strict: false });

export const Crafting = mongoose.model('Crafting', craftingSchema);
