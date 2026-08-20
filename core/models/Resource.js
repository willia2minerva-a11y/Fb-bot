import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  rarity: String,
  difficultyLevel: Number,
  locations: [String],
  gatherTime: Number,
  experience: Number,
  items: [{ itemId: String, min: Number, max: Number, chance: Number }],
  type: String,
  craftable: Boolean,
  recipe: mongoose.Schema.Types.Mixed
}, { timestamps: true, strict: false });

export const Resource = mongoose.model('Resource', resourceSchema);
