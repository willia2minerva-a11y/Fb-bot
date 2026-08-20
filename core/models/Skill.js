import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  level: Number,
  maxLevel: Number,
  effects: mongoose.Schema.Types.Mixed,
  requirements: mongoose.Schema.Types.Mixed,
  type: String
}, { timestamps: true, strict: false });

export const Skill = mongoose.model('Skill', skillSchema);
