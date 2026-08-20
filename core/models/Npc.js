import mongoose from 'mongoose';

const npcSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  location: String,
  role: String,
  dialogue: [String],
  services: mongoose.Schema.Types.Mixed,
  quests: [String]
}, { timestamps: true, strict: false });

export const Npc = mongoose.model('Npc', npcSchema);
