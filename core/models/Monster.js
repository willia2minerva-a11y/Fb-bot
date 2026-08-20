import mongoose from 'mongoose';

const monsterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  level: Number,
  health: Number,
  maxHealth: Number,
  damage: Number,
  gold: Number,
  exp: Number,
  isBoss: { type: Boolean, default: false },
  locations: [String],
  spawnTime: String,
  spawnCondition: String,
  drops: [{ itemId: String, chance: Number, min: Number, max: Number }]
}, { timestamps: true, strict: false });

export const Monster = mongoose.model('Monster', monsterSchema);
