import { BattleSystem } from '../systems/battle/BattleSystem.js';
import { TravelSystem } from '../systems/world/TravelSystem.js';
import { WorldMap } from '../systems/world/WorldMap.js';
import { GatheringSystem } from '../systems/gathering/GatheringSystem.js';
import { CraftingSystem } from '../systems/crafting/CraftingSystem.js';
import { ProfileSystem } from '../systems/profile/ProfileSystem.js';
import Player from './Player.js';

export default class CommandHandler {
  constructor() {
    console.log('🔄 تهيئة CommandHandler...');
    
    // تهيئة الأنظمة الأساسية فقط
    this.battleSystem = new BattleSystem();
    this.travelSystem = new TravelSystem();
    this.worldMap = new WorldMap(this.travelSystem);
    this.gatheringSystem = new GatheringSystem();
    this.craftingSystem = new CraftingSystem();
    this.profileSystem = new ProfileSystem();
    
    // الأوامر الأساسية فقط
    this.commands = {
      'بدء': this.handleStart.bind(this),
      'حالتي': this.handleStatus.bind(this),
      'بروفايلي': this.handleProfile.bind(this),
      'مساعدة': this.handleHelp.bind(this),
      'حقيبتي': this.handleInventory.bind(this),
      'خريطة': this.handleMap.bind(this),
      'تجميع': this.handleGather.bind(this),
      'مغامرة': this.handleAdventure.bind(this),
      'هجوم': this.handleAttack.bind(this),
      'هروب': this.handleEscape.bind(this)
    };
    
    console.log('✅ CommandHandler تم تهيئته بنجاح');
  }

  // ... بقية الدوال تبقى كما هي
  async process(sender, message) {
    const { id, name } = sender;
    const command = message.trim().toLowerCase();

    console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);

    try {
      let player = await Player.findOne({ userId: id });
      if (!player) {
        player = await Player.createNew(id, name);
        console.log(`🎮 لاعب جديد: ${name} (${id})`);
      }

      if (player.banned) {
        return '❌ تم حظرك من اللعبة. لا يمكنك استخدام الأوامر.';
      }

      if (this.commands[command]) {
        const result = await this.commands[command](player);
        await player.save();
        return result;
      } else {
        return await this.handleUnknown(command, player);
      }

    } catch (error) {
      console.error('❌ خطأ في معالجة الأمر:', error);
      return '❌ حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى.';
    }
  }

  async handleStart(player) {
    return `🎮 **مرحباً ${player.name} في مغارة غولد!**

📍 موقعك الحالي: ${player.currentLocation}
✨ مستواك: ${player.level}
💰 ذهبك: ${player.gold} غولد
❤️ صحتك: ${player.health}/${player.maxHealth}

اكتب "مساعدة" لرؤية الأوامر المتاحة.`;
  }

  async handleStatus(player) {
    return this.profileSystem.getPlayerStatus(player);
  }

  async handleProfile(player) {
    return this.profileSystem.getPlayerProfile(player);
  }

  async handleHelp(player) {
    return `🆘 **أوامر مغارة غولد**

🎯 **الأساسية:**
بدء - بدء اللعبة
حالتي - عرض حالتك
بروفايلي - بطاقة اللاعب
مساعدة - عرض هذه القائمة

🗺️ **الاستكشاف:**
خريطة - عرض الخريطة
تجميع - جمع الموارد
مغامرة - بدء مغامرة

🎒 **الإدارة:**
حقيبتي - عرض المحتويات

⚔️ **القتال:**
هجوم - الهجوم في المعركة
هروب - الهروب من المعركة`;
  }

  async handleMap(player) {
    return this.worldMap.showMap(player);
  }

  async handleGather(player) {
    const result = this.gatheringSystem.gatherResources(player, player.currentLocation);
    if (result.error) return result.error;
    return result.message;
  }

  async handleAdventure(player) {
    const result = this.battleSystem.startBattle(player, player.currentLocation);
    if (result.error) return result.error;
    return result.message;
  }

  async handleInventory(player) {
    return this.profileSystem.getPlayerInventory(player);
  }

  async handleAttack(player) {
    const result = this.battleSystem.attack(player);
    if (result.error) return result.error;
    return result.message;
  }

  async handleEscape(player) {
    const result = this.battleSystem.escape(player);
    if (result.error) return result.error;
    return result.message;
  }

  async handleUnknown(command, player) {
    return `❓ **أمر غير معروف**: "${command}"\n\nاكتب "مساعدة" لرؤية الأوامر المتاحة.`;
  }
  }
