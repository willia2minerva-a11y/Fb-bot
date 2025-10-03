import { BattleSystem } from './systems/battle/BattleSystem.js';
import { TravelSystem } from './systems/world/TravelSystem.js';
import { WorldMap } from './systems/world/WorldMap.js';
import { GatheringSystem } from './systems/gathering/GatheringSystem.js';
import { CraftingSystem } from './systems/crafting/CraftingSystem.js';
import { ProfileSystem } from './systems/profile/ProfileSystem.js';

export default class CommandHandler {
  constructor() {
    this.battleSystem = new BattleSystem();
    this.travelSystem = new TravelSystem();
    this.worldMap = new WorldMap(this.travelSystem);
    this.gatheringSystem = new GatheringSystem();
    this.craftingSystem = new CraftingSystem();
    this.profileSystem = new ProfileSystem();
    
    this.commands = {
      'بدء': this.handleStart.bind(this),
      'حالتي': this.handleStatus.bind(this),
      'بروفايلي': this.handleProfile.bind(this),
      'مساعدة': this.handleHelp.bind(this),
      'خريطة': this.handleMap.bind(this),
      'تجميع': this.handleGather.bind(this),
      'مغامرة': this.handleAdventure.bind(this),
      'حقيبتي': this.handleInventory.bind(this),
      'مهارات': this.handleSkills.bind(this),
      'مهام': this.handleQuests.bind(this),
      'هجوم': this.handleAttack.bind(this),
      'هروب': this.handleEscape.bind(this),
      'صناعة': this.handleCrafting.bind(this),
      'انتقل': this.handleTravel.bind(this)
    };
  }

  async process(sender, message) {
    const { id, name } = sender;
    const command = message.trim().toLowerCase();

    try {
      let player = await Player.findOne({ userId: id });
      if (!player) {
        player = await Player.createNew(id, name);
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
    return `🎮 **مرحباً ${player.name} في مغارة غولد!**\n\n🏔️ عالم من المغامرات والكنوز ينتظرك!\n\nاكتب "مساعدة" لرؤية جميع الأوامر المتاحة.\n\n⚔️ **هل أنت مستعد للمغامرة؟**`;
  }

  async handleStatus(player) {
    return this.profileSystem.getPlayerStatus(player);
  }

  async handleProfile(player) {
    return this.profileSystem.getPlayerProfile(player);
  }

  async handleInventory(player) {
    return this.profileSystem.getPlayerInventory(player);
  }

  async handleMap(player) {
    return this.worldMap.showMap(player);
  }

  async handleGather(player) {
    const result = this.gatheringSystem.gatherResources(player, player.currentLocation);
    if (result.error) return result.error;
    
    await player.save();
    return result.message;
  }

  async handleAdventure(player) {
    const result = this.battleSystem.startBattle(player, player.currentLocation);
    if (result.error) return result.error;
    
    return result.message;
  }

  async handleAttack(player) {
    const result = this.battleSystem.attack(player);
    if (result.error) return result.error;
    
    await player.save();
    return result.message;
  }

  async handleEscape(player) {
    const result = this.battleSystem.escape(player);
    if (result.error) return result.error;
    
    return result.message;
  }

  async handleCrafting(player) {
    const result = this.craftingSystem.showCraftingRecipes(player);
    return result.message;
  }

  async handleTravel(player, location) {
    // هذا يحتاج معالجة إضافية لاستخراج اسم المكان من الرسالة
    return "🚧 نظام السفر قيد التطوير...";
  }

  async handleHelp(player) {
    return `🆘 **أوامر مغارة غولد**\n\n🎯 الأساسية:\n\`بدء\` - بدء اللعبة\n\`حالتي\` - عرض حالتك\n\`بروفايلي\` - بطاقة اللاعب\n\`مساعدة\` - هذه القائمة\n\n🗺️ الاستكشاف:\n\`خريطة\` - عرض الخريطة\n\`تجميع\` - جمع الموارد\n\`مغامرة\` - بدء مغامرة\n\n🎒 الإدارة:\n\`حقيبتي\` - عرض المحتويات\n\`صناعة\` - صناعة الأغراض\n\n⚔️ القتال:\n\`هجوم\` - الهجوم في المعركة\n\`هروب\` - الهروب من المعركة`;
  }

  async handleUnknown(command, player) {
    return `❓ **أمر غير معروف**: "${command}"\n\nاكتب \`مساعدة\` لرؤية الأوامر المتاحة.`;
  }
                }
