import { BattleSystem } from './systems/battle/BattleSystem.js';
import { TravelSystem } from './systems/world/TravelSystem.js';
import { WorldMap } from './systems/world/WorldMap.js';
import { GatheringSystem } from './systems/gathering/GatheringSystem.js';
import { CraftingSystem } from './systems/crafting/CraftingSystem.js';
import { ProfileSystem } from './systems/profile/ProfileSystem.js';
import { QuestSystem } from './systems/quest/QuestSystem.js';
import { TimeSystem } from './systems/time/TimeSystem.js';
import Player from './Player.js';

export default class CommandHandler {
  constructor() {
    // تهيئة جميع الأنظمة
    this.battleSystem = new BattleSystem();
    this.travelSystem = new TravelSystem();
    this.worldMap = new WorldMap(this.travelSystem);
    this.gatheringSystem = new GatheringSystem();
    this.craftingSystem = new CraftingSystem();
    this.profileSystem = new ProfileSystem();
    this.questSystem = new QuestSystem();
    this.timeSystem = new TimeSystem();
    
    // تسجيل جميع الأوامر
    this.commands = {
      // الأساسية
      'بدء': this.handleStart.bind(this),
      'حالتي': this.handleStatus.bind(this),
      'بروفايلي': this.handleProfile.bind(this),
      'مساعدة': this.handleHelp.bind(this),
      'حقيبتي': this.handleInventory.bind(this),
      
      // الاستكشاف والتنقل
      'خريطة': this.handleMap.bind(this),
      'انتقل': this.handleTravel.bind(this),
      
      // الأنظمة
      'تجميع': this.handleGather.bind(this),
      'مغامرة': this.handleAdventure.bind(this),
      'صناعة': this.handleCrafting.bind(this),
      'مهام': this.handleQuests.bind(this),
      'مهارات': this.handleSkills.bind(this),
      
      // القتال
      'هجوم': this.handleAttack.bind(this),
      'هروب': this.handleEscape.bind(this),
      
      // المدير (إذا needed)
      'حظر_لاعب': this.handleBanPlayer.bind(this),
      'الغاء_حظر': this.handleUnbanPlayer.bind(this),
      'اعطاء_غرض': this.handleGiveItem.bind(this)
    };
  }

  async process(sender, message) {
    const { id, name } = sender;
    const command = message.trim().toLowerCase();

    console.log(`📨 معالجة أمر: "${command}" من ${name}`);

    try {
      // الحصول على اللاعب أو إنشاء جديد
      let player = await Player.findOne({ userId: id });
      if (!player) {
        player = await Player.createNew(id, name);
        console.log(`🎮 لاعب جديد: ${name} (${id})`);
      }

      // التحقق من الحظر
      if (player.banned) {
        return '❌ تم حظرك من اللعبة. لا يمكنك استخدام الأوامر.';
      }

      // معالجة الأمر
      if (this.commands[command]) {
        const result = await this.commands[command](player, message);
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

  // === الأوامر الأساسية ===
  async handleStart(player) {
    return `🎮 **مرحباً ${player.name} في مغارة غولد!**

🏔️ عالم من المغامرات والكنوز ينتظرك!

📍 موقعك الحالي: ${player.currentLocation}
✨ مستواك: ${player.level}
💰 ذهبك: ${player.gold} غولد
❤️ صحتك: ${player.health}/${player.maxHealth}

اكتب "مساعدة" لرؤية جميع الأوامر المتاحة.

⚔️ **هل أنت مستعد للمغامرة؟**`;
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

  async handleHelp(player) {
    return `🆘 **أوامر مغارة غولد**

🎯 **الأساسية:**
\`بدء\` - بدء اللعبة
\`حالتي\` - عرض حالتك
\`بروفايلي\` - بطاقة اللاعب الشخصية
\`مساعدة\` - عرض هذه القائمة

🗺️ **الاستكشاف:**
\`خريطة\` - عرض الخريطة
\`تجميع\` - جمع الموارد
\`مغامرة\` - بدء مغامرة

🎒 **الإدارة:**
\`حقيبتي\` - عرض المحتويات
\`صناعة\` - صناعة الأغراض
\`مهارات\` - عرض المهارات
\`مهام\` - المهام الحالية

⚔️ **القتال:**
\`هجوم\` - الهجوم في المعركة
\`هروب\` - الهروب من المعركة

🛠️ **التطوير:**
\`صناعة\` - صناعة الأغراض

📜 **المهام:**
\`مهام\` - المهام الحالية`;
  }

  // === الاستكشاف والتنقل ===
  async handleMap(player) {
    return this.worldMap.showMap(player);
  }

  async handleTravel(player, message) {
    // استخراج اسم المكان من الرسالة
    const locationName = message.replace('انتقل', '').trim();
    
    if (!locationName) {
      const availableLocations = this.travelSystem.getAvailableLocations(player);
      let locationsText = `🧭 **أماكن السفر المتاحة:**\n\n`;
      
      availableLocations.forEach(location => {
        locationsText += `• **${location.name}** - ${location.description}\n`;
        locationsText += `  📍 المستوى المطلوب: ${location.requiredLevel}\n\n`;
      });
      
      locationsText += `استخدم: \`انتقل [اسم المكان]\``;
      return locationsText;
    }

    const result = this.travelSystem.travelTo(player, locationName);
    if (result.error) return result.error;
    
    return result.message;
  }

  // === أنظمة اللعبة ===
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

  async handleCrafting(player) {
    const result = this.craftingSystem.showCraftingRecipes(player);
    return result.message;
  }

  async handleQuests(player) {
    const result = this.questSystem.getActiveQuests(player);
    return result.message;
  }

  async handleSkills(player) {
    const result = this.profileSystem.getPlayerSkills(player);
    return result.message;
  }

  // === نظام القتال ===
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

  // === أوامر المدير ===
  async handleBanPlayer(player, message) {
    if (!this.isAdmin(player.userId)) {
      return '❌ ليس لديك صلاحية لاستخدام هذا الأمر.';
    }
    // منطق حظر اللاعب
    return '🚫 أمر الحظر قيد التطوير...';
  }

  async handleUnbanPlayer(player, message) {
    if (!this.isAdmin(player.userId)) {
      return '❌ ليس لديك صلاحية لاستخدام هذا الأمر.';
    }
    // منطق فك الحظر
    return '✅ أمر فك الحظر قيد التطوير...';
  }

  async handleGiveItem(player, message) {
    if (!this.isAdmin(player.userId)) {
      return '❌ ليس لديك صلاحية لاستخدام هذا الأمر.';
    }
    // منطق إعطاء الأغراض
    return '🎁 أمر إعطاء الأغراض قيد التطوير...';
  }

  // === أدوات مساعدة ===
  async handleUnknown(command, player) {
    return `❓ **أمر غير معروف**: "${command}"\n\nاكتب \`مساعدة\` لرؤية الأوامر المتاحة.`;
  }

  isAdmin(userId) {
    // قائمة بمعرفات المديرين
    const adminIds = ['ADMIN_USER_ID_1', 'ADMIN_USER_ID_2'];
    return adminIds.includes(userId);
  }
  }
