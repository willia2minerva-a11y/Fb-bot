import { Player } from './Player.js';
import { CommandHandler } from './CommandHandler.js';
import { BattleSystem } from '../systems/battle/BattleSystem.js';
import { QuestSystem } from '../systems/quests/QuestSystem.js';
import { CraftingSystem } from '../systems/crafting/CraftingSystem.js';
import { WorldMap } from '../systems/world/WorldMap.js';
import { TimeSystem } from '../systems/time/TimeSystem.js';
import { locations } from '../data/locations.js';
import { npcs } from '../data/npcs.js';
import { items } from '../data/items.js';

export class Game {
  constructor() {
    this.player = new Player();
    this.commandHandler = new CommandHandler(this.player, this);
    this.questSystem = new QuestSystem(this.player);
    this.battleSystem = new BattleSystem(this.player);
    this.craftingSystem = new CraftingSystem(this.player);
    this.worldMap = new WorldMap(locations);
    this.timeSystem = new TimeSystem();
    this.npcs = npcs;
    this.items = items;
    this.isRunning = false;
    this.currency = 0; // الذهب (غولد)
  }

  start() {
    this.isRunning = true;
    console.log('أهلاً بك في مغارة غولد! مغامرتك تبدأ الآن 🌟');
    // يمكنك هنا عرض أوامر البداية أو قصة قصيرة
    // استقبال الأوامر من اللاعب
  }

  // مثال لدالة تفاعل مع الأحداث
  onEvent(event) {
    // تنفيذ منطق مخصص حسب الحدث
  }
}