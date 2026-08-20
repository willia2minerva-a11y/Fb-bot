import mongoose from 'mongoose';

const gateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  availableLocations: [String],
  requiredLevel: Number,
  bossId: String,
  drops: mongoose.Schema.Types.Mixed,
  events: mongoose.Schema.Types.Mixed,
  rewards: mongoose.Schema.Types.Mixed
}, { timestamps: true, strict: false });

export const Gate = mongoose.model('Gate', gateSchema);
