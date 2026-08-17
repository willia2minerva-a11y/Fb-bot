// systems/gathering/GatheringSystem.js
import { resources } from '../../data/resources.js';

export class GatheringSystem {
  constructor() {
    this.allResources = resources;
    this.gatheringCooldowns = new Map(); // userId => timestamp
    console.log('🌿 نظام جمع الموارد تم تهيئته. عدد الموارد القابلة للجمع:', Object.keys(this.allResources).length);
  }

  // ✅ دالة لتحديد الكولداون حسب ندرة المورد - نسخة أطول
  _getCooldownByRarity(rarity) {
    const cooldowns = {
      'common': 15000,      // 15 ثانية
      'uncommon': 25000,    // 25 ثانية
      'rare': 45000,        // 45 ثانية
      'epic': 90000,        // 1.5 دقيقة
      'legendary': 180000,  // 3 دقائق
      'mythic': 300000      // 5 دقائق
    };
    return cooldowns[rarity] || 15000; // افتراضي 15 ثانية
  }

  // ✅ دالة لتحديد الكولداون حسب مستوى الصعوبة - نسخة أطول
  _getCooldownByDifficulty(difficultyLevel) {
    const cooldowns = {
      1: 15000,   // 15 ثانية
      2: 25000,   // 25 ثانية
      3: 45000,   // 45 ثانية
      4: 90000,   // 1.5 دقيقة
      5: 180000   // 3 دقائق
    };
    return cooldowns[difficultyLevel] || 15000;
  }

  // ✅ دالة موحدة لتحديد الكولداون
  _getCooldownForResource(resource) {
    if (resource.rarity) {
      return this._getCooldownByRarity(resource.rarity);
    } else if (resource.difficultyLevel) {
      return this._getCooldownByDifficulty(resource.difficultyLevel);
    }
    return 15000; // افتراضي 15 ثانية
  }

  // ✅ دالة لتنسيق الوقت بشكل جميل
  _formatCooldown(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds} ثانية`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds > 0) {
        return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
      }
      return `${minutes} دقيقة`;
    }
  }

  // ✅ دالة للتحقق من الكولداون
  _isOnCooldown(userId) {
    const cooldownData = this.gatheringCooldowns.get(userId);
    if (!cooldownData) return false;
    
    const now = Date.now();
    return now < cooldownData.endTime;
  }

  // ✅ دالة للحصول على الوقت المتبقي
  _getRemainingCooldown(userId) {
    const cooldownData = this.gatheringCooldowns.get(userId);
    if (!cooldownData) return 0;
    
    const now = Date.now();
    return Math.max(0, cooldownData.endTime - now);
  }

  // ✅ دالة لتحديث الكولداون
  _setCooldown(userId, duration) {
    this.gatheringCooldowns.set(userId, {
      startTime: Date.now(),
      endTime: Date.now() + duration,
      duration: duration
    });
  }

  // ✅ دالة لتنظيف الكولداونات المنتهية
  _cleanupCooldowns() {
    const now = Date.now();
    for (const [userId, cooldownData] of this.gatheringCooldowns.entries()) {
      if (now >= cooldownData.endTime) {
        this.gatheringCooldowns.delete(userId);
      }
    }
  }

  showAvailableResources(player) {
    // تنظيف الكولداونات القديمة
    this._cleanupCooldowns();
    
    const playerLocationId = player?.currentLocation || 'forest';
    
    let message = `🔍 **موارد قابلة للجمع في ${playerLocationId}**:\n`;
    let found = false;

    // ✅ عرض الكولداون المتبقي إذا كان هناك
    if (this._isOnCooldown(player.userId)) {
      const remainingTime = this._getRemainingCooldown(player.userId);
      const formattedTime = this._formatCooldown(remainingTime);
      const cooldownData = this.gatheringCooldowns.get(player.userId);
      message += `\n⏳ **في فترة انتظار التجميع:** ${formattedTime}\n`;
      message += `📦 **آخر مورد:** ${cooldownData?.resourceName || 'غير معروف'}\n`;
    }

    for (const resourceId in this.allResources) {
      const resource = this.allResources[resourceId];
      
      // تخطي العناصر بدون locations
      if (!resource || !resource.locations || !Array.isArray(resource.locations)) {
        continue;
      }
      
      // تخطي العناصر التي بدون items أو gatherTime
      if (!resource.items || !resource.gatherTime) {
        continue;
      }
      
      if (resource.locations.includes(playerLocationId)) {
        found = true;
        const cooldownTime = this._getCooldownForResource(resource);
        const formattedCooldown = this._formatCooldown(cooldownTime);
        
        message += `\n- **${resource.name}** (${resource.id}):\n`;
        message += `  • الخبرة: +${resource.experience} EXP\n`;
        message += `  • الندرة: ${resource.rarity || 'عادي'}\n`;
        message += `  • ⏳ وقت الانتظار: ${formattedCooldown}\n`;
      }
    }

    if (!found) {
        message += "\n❌ لا توجد موارد قابلة للجمع هنا حاليًا.";
    }

    message += `\n\n💡 **للتجميع:** استخدم أمر "اجمع [ID المورد]" (مثال: اجمع wood)\n`;
    message += `⚠️ **ملاحظة:** كل مورد له وقت انتظار حسب ندرته - لا يمكنك السبام!`;
    return { message };
  }

  async gatherResources(player, resourceId) {
    // تنظيف الكولداونات القديمة
    this._cleanupCooldowns();
    
    // ✅ التحقق من الكولداون أولاً
    if (this._isOnCooldown(player.userId)) {
      const remainingTime = this._getRemainingCooldown(player.userId);
      const formattedTime = this._formatCooldown(remainingTime);
      const cooldownData = this.gatheringCooldowns.get(player.userId);
      const lastResource = cooldownData?.resourceName || 'المورد';
      
      return { 
        error: `⏳ **انتظر!** لا يمكنك التجميع الآن.\n\n📦 **آخر مورد جمعته:** ${lastResource}\n⏱️ **الوقت المتبقي:** ${formattedTime}\n\n⚠️ لا ترسل سبام، انتظر حتى ينتهي الوقت!` 
      };
    }

    const resource = this.allResources[resourceId];
    const playerLocationId = player?.currentLocation || 'forest';

    if (!resource) {
      return { error: `❌ المورد "${resourceId}" غير موجود في قاعدة البيانات.` };
    }

    if (!resource.locations || !Array.isArray(resource.locations)) {
      return { error: `❌ **${resource.name}** ليس مورداً قابلاً للجمع.` };
    }

    if (!resource.items || !resource.gatherTime) {
      return { error: `❌ **${resource.name}** ليس مورداً قابلاً للجمع.` };
    }

    if (!resource.locations.includes(playerLocationId)) {
      return { error: `❌ لا يمكنك جمع **${resource.name}** في موقعك الحالي (${playerLocationId}).` };
    }

    // ✅ تحديد الكولداون حسب ندرة المورد
    const cooldownTime = this._getCooldownForResource(resource);
    
    // ✅ تعيين الكولداون قبل بدء التجميع
    this._setCooldown(player.userId, cooldownTime);
    
    // ✅ حفظ اسم المورد في الكولداون
    const cooldownData = this.gatheringCooldowns.get(player.userId);
    cooldownData.resourceName = resource.name;

    let totalQuantity = 0;
    let itemsGained = [];
    
    for (const itemDrop of resource.items) {
      if (Math.random() <= itemDrop.chance) {
        const quantity = Math.floor(Math.random() * (itemDrop.max - itemDrop.min + 1)) + itemDrop.min;
        
        if (quantity > 0) {
            player.addItem(itemDrop.itemId, itemDrop.itemId, 'resource', quantity);
            itemsGained.push({ name: itemDrop.itemId, quantity });
            totalQuantity += quantity;
        }
      }
    }
    
    if (totalQuantity === 0) {
        return { 
          success: false, 
          message: `🌿 حاولت جمع **${resource.name}** لكنك لم تجد شيئًا هذه المرة!\n\n⏳ **وقت الانتظار قبل المحاولة التالية:** ${this._formatCooldown(cooldownTime)}` 
        };
    }

    player.addExperience(resource.experience || 0);
    
    await player.save(); 
    
    const itemsMessage = itemsGained.map(item => `   • ${item.quantity} × ${item.name}`).join('\n');
    const formattedCooldown = this._formatCooldown(cooldownTime);

    return {
      success: true,
      message: `⛏️ **نجاح! تم جمع الموارد في ${playerLocationId}**\n\n**المورد:** ${resource.name}\n**الندرة:** ${resource.rarity || 'عادي'}\n\n**الموارد المكتسبة:**\n${itemsMessage}\n\n✨ +${resource.experience || 0} خبرة\n\n⏳ **وقت الانتظار قبل التجميع التالي:** ${formattedCooldown}`,
      gainedExp: resource.experience || 0
    };
  }
}
