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
    console.log('🔄 تهيئة CommandHandler...');
    
    // تهيئة الأنظمة الأساسية فقط (تعليق الباقي مؤقتاً)
    this.battleSystem = new BattleSystem();
    this.travelSystem = new TravelSystem();
    this.worldMap = new WorldMap(this.travelSystem);
    this.gatheringSystem = new GatheringSystem();
    this.craftingSystem = new CraftingSystem();
    this.profileSystem = new ProfileSystem();
    
    // الأنظام الاختيارية - مؤقتاً نعلقها
    // this.questSystem = new QuestSystem();
    // this.timeSystem = new TimeSystem();
    
    // الأوامر الأساسية فقط
    this.commands = {
      // الأساسية
      'بدء': this.handleStart.bind(this),
      'حالتي': this.handleStatus.bind(this),
      'بروفايلي': this.handleProfile.bind(this),
      'مساعدة': this.handleHelp.bind(this),
      'حقيبتي': this.handleInventory.bind(this),
      
      // الاستكشاف
      'خريطة': this.handleMap.bind(this),
      'تجميع': this.handleGather.bind(this),
      'مغامرة': this.handleAdventure.bind(this),
      
      // القتال
      'هجوم': this.handleAttack.bind(this),
      'هروب': this.handleEscape.bind(this)
    };
    
    console.log('✅ CommandHandler تم تهيئته بنجاح');
  }

  async process(sender, message) {
    const { id, name } = sender;
    const command = message.trim().toLowerCase();

    console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);

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

  // ========== الأوامر الأساسية ==========

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
    const expNeeded = player.level * 100;
    const expProgress = Math.floor((player.exp / expNeeded) * 100);

    return `📊 **حالة ${player.name}**
──────────────
❤️  الصحة: ${player.health}/${player.maxHealth}
✨  المستوى: ${player.level}
⭐  الخبرة: ${player.exp}/${expNeeded} (${expProgress}%)
💰  الذهب: ${player.gold} غولد
⚔️  الهجوم: ${player.attack}
🛡️  الدفاع: ${player.defense}
📍  الموقع: ${player.currentLocation}
🎒  الأغراض: ${player.inventory.length} نوع`;
  }

  async handleProfile(player) {
    const expNeeded = player.level * 100;
    const expProgress = Math.floor((player.exp / expNeeded) * 100);
    const equippedWeapon = player.equipment.weapon ? 
      player.inventory.find(item => item.itemId === player.equipment.weapon)?.name : 'لا يوجد';

    return `📋 **بروفايل ${player.name}**
────────────────
✨ المستوى: ${player.level} 
⭐ الخبرة: ${player.exp}/${expNeeded} (${expProgress}%)
❤️ الصحة: ${player.health}/${player.maxHealth}
💰 الذهب: ${player.gold} غولد
⚔️ السلاح: ${equippedWeapon}

🎯 **الإحصائيات:**
• ⚔️ المعارك: ${player.stats.battlesWon} فوز
• 🐉 الوحوش: ${player.stats.monstersKilled} قتيل
• 📜 المهام: ${player.stats.questsCompleted} مكتمل
• 🌿 الموارد: ${player.stats.resourcesCollected} مجمع

📍 **الموقع الحالي:** ${player.currentLocation}`;
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

⚔️ **القتال:**
\`هجوم\` - الهجوم في المعركة
\`هروب\` - الهروب من المعركة

🛠️ **التطوير:**
\`صناعة\` - صناعة الأغراض (قريباً)
\`مهارات\` - المهارات (قريباً)

📜 **المهام:**
\`مهام\` - المهام الحالية (قريباً)`;
  }

  async handleMap(player) {
    const locations = {
      'القرية': '🏠 مكان آمن للراحة والتجارة',
      'الغابة الخضراء': '🌿 موارد وفيرة ووحوش ضعيفة',
      'جبال الظلام': '⛰️ معادن ثمينة ووحوش متوسطة',
      'كهوف التنين': '🐉 كنوز نادرة ومخاطر كبيرة'
    };

    let mapText = `🗺️ **خريطة مغارة غولد**\n\n`;
    
    for (const [location, description] of Object.entries(locations)) {
      const indicator = location === player.currentLocation ? '📍 ' : '• ';
      mapText += `${indicator}**${location}**: ${description}\n`;
    }

    mapText += `\nأنت حالياً في: **${player.currentLocation}**`;
    return mapText;
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
    return `❓ **أمر غير معروف**: "${command}"\n\nاكتب \`مساعدة\` لرؤية الأوامر المتاحة.`;
  }
          }
