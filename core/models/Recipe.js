import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: String,
  materials: { type: Map, of: Number },
  requiredTool: String,
  requiredLevel: Number,
  requiredSkill: Number,
  craftTime: Number,
  output: { id: String, quantity: Number }
}, { timestamps: true, strict: false });

export const Recipe = mongoose.model('Recipe', recipeSchema);
