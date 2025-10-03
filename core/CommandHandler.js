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

  console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);

  try {
    // ========== التحقق من الصحة الأساسية ==========
    if (!id || !name) {
      console.error('❌ بيانات المرسل غير مكتملة');
      return '⚠️ بيانات المستخدم غير مكتملة. حاول مرة أخرى.';
    }

    if (!message || message.trim().length === 0) {
      return '❌ يرجى إدخال أمر صحيح. اكتب "مساعدة" لرؤية الأوامر المتاحة.';
    }

    // ========== إدارة اللاعب ==========
    let player = await Player.findOne({ userId: id });
    
    // إنشاء لاعب جديد إذا لم يكن موجوداً
    if (!player) {
      try {
        player = await Player.createNew(id, name);
        console.log(`🎮 لاعب جديد: ${name} (${id})`);
        
        // إرسال رسالة ترحيب خاصة للاعبين الجدد
        await this.sendWelcomeMessage(player);
      } catch (createError) {
        console.error('❌ فشل في إنشاء لاعب جديد:', createError);
        return '❌ حدث خطأ في إنشاء حسابك. حاول مرة أخرى.';
      }
    }

    // ========== التحقق من الحظر والقيود ==========
    if (player.banned) {
      const banInfo = await this.getBanInfo(player);
      return `❌ **تم حظرك من اللعبة**\n\n📋 السبب: ${banInfo.reason}\n⏰ المدة: ${banInfo.duration}\n📅 حتى: ${banInfo.until}`;
    }

    if (player.restrictedCommands && player.restrictedCommands.includes(command)) {
      return `⛔ **هذا الأمر مقيد بالنسبة لك**\n\nالأمر "${command}" غير متاح حالياً.`;
    }

    // ========== التحقق من التبريد (Cooldown) ==========
    const cooldownCheck = this.checkCooldown(player, command);
    if (!cooldownCheck.allowed) {
      return `⏳ **يجب الانتظار ${cooldownCheck.remaining}** قبل استخدام هذا الأمر مرة أخرى.`;
    }

    // ========== معالجة الأمر ==========
    let result;
    
    if (this.commands[command]) {
      // تنفيذ الأمر الأساسي
      result = await this.commands[command](player, message);
    } else {
      // محاولة معالجة الأوامر المركبة (مثل "انتقل إلى الغابة")
      const complexCommandResult = await this.handleComplexCommand(player, message);
      if (complexCommandResult.handled) {
        result = complexCommandResult.message;
      } else {
        result = await this.handleUnknown(command, player);
      }
    }

    // ========== تحديث البيانات ==========
    try {
      // تحديث وقت آخر إجراء
      player.updateLastAction();
      
      // تحديث إحصائيات الاستخدام
      await this.updateUsageStats(player, command);
      
      // حفظ التغييرات
      await player.save();
      
      // تحديث التبريد
      this.updateCooldown(player, command);
      
      // تسجيل النشاط
      await this.logActivity(player, command, 'success');
      
    } catch (saveError) {
      console.error('❌ خطأ في حفظ بيانات اللاعب:', saveError);
      // لا نعيد الخطأ للمستخدم لأن العملية تمت بنجاح
    }

    return result;

  } catch (error) {
    console.error('❌ خطأ في معالجة الأمر:', error);
    
    // تسجيل الخطأ
    await this.logError(sender, command, error);
    
    // رسالة خطأ مناسبة للمستخدم
    return this.getErrorMessage(error, command);
  }
}

// ========== الدوال المساعدة الجديدة ==========

async sendWelcomeMessage(player) {
  // إرسال رسالة ترحيب خاصة للاعبين الجدد
  const welcomeMessages = [
    `🎉 **أهلاً وسهلاً بك ${player.name} في مغارة غولد!**`,
    `⚔️ ابدأ رحلتك بأمر "بدء" لاكتشاف العالم`,
    `💎 كل مغامر يبدأ بحلم... وحلمك يبدأ الآن!`
  ];
  
  // يمكن إرسالها كرسالة منفصلة أو دمجها
  return welcomeMessages.join('\n\n');
}

async getBanInfo(player) {
  // في الواقع، قد ترغب في تخزين هذه المعلومات في قاعدة البيانات
  return {
    reason: player.banReason || 'انتهاك شروط اللعبة',
    duration: 'دائمة', // أو يمكن حساب مدة محددة
    until: 'غير محدد'
  };
}

checkCooldown(player, command) {
  const cooldowns = {
    'تجميع': 2 * 60 * 1000,    // 2 دقيقة
    'مغامرة': 3 * 60 * 1000,   // 3 دقائق
    'هجوم': 10 * 1000,         // 10 ثواني
    'صناعة': 1 * 60 * 1000     // 1 دقيقة
  };

  const cooldown = cooldowns[command];
  if (!cooldown) {
    return { allowed: true };
  }

  const now = Date.now();
  const lastUsed = player.cooldowns?.[command] || 0;
  const remaining = lastUsed + cooldown - now;

  if (remaining > 0) {
    const remainingMinutes = Math.ceil(remaining / 1000 / 60);
    const remainingSeconds = Math.ceil(remaining / 1000);
    
    return {
      allowed: false,
      remaining: remainingMinutes >= 1 ? 
        `${remainingMinutes} دقيقة` : 
        `${remainingSeconds} ثانية`
    };
  }

  return { allowed: true };
}

updateCooldown(player, command) {
  const cooldowns = {
    'تجميع': 2 * 60 * 1000,
    'مغامرة': 3 * 60 * 1000,
    'هجوم': 10 * 1000,
    'صناعة': 1 * 60 * 1000
  };

  if (cooldowns[command]) {
    if (!player.cooldowns) {
      player.cooldowns = {};
    }
    player.cooldowns[command] = Date.now();
  }
}

async handleComplexCommand(player, message) {
  const parts = message.split(' ');
  const mainCommand = parts[0].toLowerCase();
  
  // معالجة الأوامر المركبة مثل "انتقل إلى الغابة"
  switch (mainCommand) {
    case 'انتقل':
      if (parts.length > 1) {
        const location = parts.slice(1).join(' ');
        const travelResult = this.travelSystem.travelTo(player, location);
        if (travelResult.success) {
          return { handled: true, message: travelResult.message };
        }
      }
      break;
      
    case 'استخدم':
      if (parts.length > 1) {
        const itemName = parts.slice(1).join(' ');
        const useResult = await this.useItem(player, itemName);
        if (useResult.handled) {
          return { handled: true, message: useResult.message };
        }
      }
      break;
      
    case 'تعلم':
      if (parts.length > 1) {
        const skillName = parts.slice(1).join(' ');
        const learnResult = await this.learnSkill(player, skillName);
        if (learnResult.handled) {
          return { handled: true, message: learnResult.message };
        }
      }
      break;
  }
  
  return { handled: false };
}

async useItem(player, itemName) {
  const item = player.inventory.find(item => 
    item.name.toLowerCase().includes(itemName.toLowerCase())
  );
  
  if (!item) {
    return { handled: true, message: `❌ لم تجد "${itemName}" في حقيبتك.` };
  }
  
  // منطق استخدام العناصر المختلفة
  switch (item.type) {
    case 'potion':
      if (item.name.includes('صحة')) {
        const healAmount = 30;
        player.heal(healAmount);
        player.removeItem(item.itemId, 1);
        return { 
          handled: true, 
          message: `🧪 **استخدمت ${item.name}!**\n\n❤️ استعدت ${healAmount} نقطة صحة.` 
        };
      }
      break;
      
    case 'resource':
      return { 
        handled: true, 
        message: `📦 **${item.name}**\n\nهذا مورد للصناعة وليس للاستخدام المباشر.` 
      };
  }
  
  return { handled: true, message: `❌ لا يمكن استخدام ${item.name} بهذه الطريقة.` };
}

async learnSkill(player, skillName) {
  const availableSkills = this.skillSystem.getAvailableSkills(player);
  const skill = availableSkills.find(s => 
    s.name.toLowerCase().includes(skillName.toLowerCase())
  );
  
  if (!skill) {
    return { 
      handled: true, 
      message: `❌ المهارة "${skillName}" غير متاحة أو لم تستوف المتطلبات.` 
    };
  }
  
  const learnResult = player.learnSkill(skill);
  if (learnResult.learned) {
    return { 
      handled: true, 
      message: `🎓 **تعلمت مهارة جديدة: ${skill.name}!**\n\n📊 القوة: ${skill.power}\n💧 كلفة المانا: ${skill.manaCost}` 
    };
  }
  
  return { handled: true, message: learnResult.message };
}

async updateUsageStats(player, command) {
  // تحديث إحصائيات الاستخدام
  if (!player.stats.commandUsage) {
    player.stats.commandUsage = {};
  }
  
  player.stats.commandUsage[command] = (player.stats.commandUsage[command] || 0) + 1;
  player.stats.totalCommands = (player.stats.totalCommands || 0) + 1;
}

async logActivity(player, command, status) {
  // تسجيل النشاط للأغراض التحليلية
  const activity = {
    playerId: player.userId,
    command: command,
    status: status,
    timestamp: new Date(),
    location: player.currentLocation,
    level: player.level
  };
  
  console.log('📊 نشاط:', activity);
  // يمكن حفظ هذا في قاعدة بيانات منفصلة للتحليلات
}

async logError(sender, command, error) {
  // تسجيل الأخطاء للتصحيح
  const errorLog = {
    userId: sender.id,
    userName: sender.name,
    command: command,
    error: error.message,
    stack: error.stack,
    timestamp: new Date()
  };
  
  console.error('❌ خطأ مسجل:', errorLog);
}

getErrorMessage(error, command) {
  // رسائل خطأ مناسبة للمستخدم
  const errorMessages = {
    'MongoNetworkError': '❌ مشكلة في الاتصال بقاعدة البيانات. حاول مرة أخرى.',
    'MongoTimeoutError': '⏰ المهلة انتهت. حاول مرة أخرى.',
    'ValidationError': '❌ بيانات غير صالحة. يرجى المحاولة لاحقاً.'
  };
  
  // البحث عن نوع الخطأ في السلسلة
  for (const [errorType, message] of Object.entries(errorMessages)) {
    if (error.message.includes(errorType)) {
      return message;
    }
  }
  
  // رسالة افتراضية
  return `⚠️ حدث خطأ غير متوقع أثناء معالجة الأمر "${command}". حاول مرة أخرى.`;
}

// ========== تحديث constructor لإضافة الأنظمة الجديدة ==========
constructor() {
  // ... الأنظمة الحالية
  
  // إضافة الأنظمة الجديدة
  this.skillSystem = new SkillSystem();
  
  // تسجيل الأوامر الإضافية
  this.commands = {
    // ... الأوامر الحالية
    'استخدم': this.handleUseItem.bind(this),
    'تعلم': this.handleLearnSkill.bind(this),
  };
}

async handleUseItem(player, message) {
  const itemName = message.replace('استخدم', '').trim();
  if (!itemName) {
    return '❌ يرجى تحديد اسم الغرض. مثال: "استخدم جرعة صحة"';
  }
  
  const result = await this.useItem(player, itemName);
  return result.message;
}

async handleLearnSkill(player, message) {
  const skillName = message.replace('تعلم', '').trim();
  if (!skillName) {
    return '❌ يرجى تحديد اسم المهارة. مثال: "تعلم ضربة قوية"';
  }
  
  const result = await this.learnSkill(player, skillName);
  return result.message;
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
