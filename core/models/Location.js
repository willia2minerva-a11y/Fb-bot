import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  levelRequired: Number,
  dangerLevel: Number,
  monsters: [String],
  resources: [String],
  gates: [String],
  connectedLocations: [String],
  npcs: [String]
}, { timestamps: true, strict: false });

export const Location = mongoose.model('Location', locationSchema);
