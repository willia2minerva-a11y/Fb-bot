// systems/gathering/GatheringSystem.js
import { resources } from '../../data/resources.js';
// 💡 ملاحظة: يُفترض أن ملف اللاعب (player object) يحتوي على دالة مثل: 
// player.addItem(itemId, quantity) و player.addExperience(exp)
// و player.getCurrentLocation()

export class GatheringSystem {
  constructor() {
    this.allResources = resources;
    console.log('🌿 نظام جمع الموارد تم تهيئته. عدد الموارد القابلة للجمع:', Object.keys(this.allResources).length);
  }

  // 1. عرض الموارد المتاحة في الموقع الحالي
  showAvailableResources(player) {
    const playerLocationId = player.currentLocation; 
    let message = `🔍 **موارد قابلة للجمع في ${playerLocationId}**:\n`;
    let found = false;

    // المرور على جميع الموارد للتحقق من توافرها في موقع اللاعب
    for (const resourceId in this.allResources) {
      const resource = this.allResources[resourceId];
      if (resource.locations.includes(playerLocationId)) {
        found = true;
        const gatherTimeSeconds = (resource.gatherTime / 1000).toFixed(1);
        message += `\n- **${resource.name}** (${resource.id}):\n`;
        message += `  • وقت التجميع: ${gatherTimeSeconds} ثواني\n`;
        message += `  • خبرة مكتسبة: +${resource.experience} EXP\n`;
      }
    }

    if (!found) {
        message += "\n❌ لا توجد موارد قابلة للجمع هنا حاليًا.";
    }

    message += `\n\n💡 **للتجميع:** استخدم أمر "اجمع [ID المورد]" (مثال: اجمع wood)`;
    return { message };
  }

  // 2. تنفيذ عملية التجميع
  gatherResources(player, resourceId) {
    const resource = this.allResources[resourceId];
    const playerLocationId = player.currentLocation; 

    if (!resource) {
      return { error: `❌ المورد "${resourceId}" غير موجود في قاعدة البيانات.` };
    }

    if (!resource.locations.includes(playerLocationId)) {
      return { error: `❌ لا يمكنك جمع **${resource.name}** في موقعك الحالي (${playerLocationId}).` };
    }
    
    // محاكاة وقت التجميع (يمكن استخدامها لاحقاً لمنع التجميع السريع)
    // console.log(`⏳ جاري جمع ${resource.name}... تستغرق ${resource.gatherTime} مللي ثانية.`);

    let totalQuantity = 0;
    let itemsGained = [];
    
    // جمع العناصر المحددة في خاصية items
    for (const itemDrop of resource.items) {
      // التحقق من نسبة السقوط (chance)
      if (Math.random() <= itemDrop.chance) {
        // حساب الكمية العشوائية المكتسبة
        const quantity = Math.floor(Math.random() * (itemDrop.max - itemDrop.min + 1)) + itemDrop.min;
        
        if (quantity > 0) {
            // يفترض أن دالة player.addItem(itemId, quantity) موجودة
            // وإلا، ستحتاج إلى تعديلها لتتناسب مع كيفية إضافة العناصر لجرد اللاعب
            player.addItem(itemDrop.itemId, quantity); 
            itemsGained.push({ name: itemDrop.itemId, quantity });
            totalQuantity += quantity;
        }
      }
    }
    
    if (totalQuantity === 0) {
        return { success: false, message: `🌿 حاولت جمع **${resource.name}** لكنك لم تجد شيئًا هذه المرة! حاول مجددًا.` };
    }

    // إضافة الخبرة (يفترض أن دالة player.addExperience(exp) موجودة)
    player.addExperience(resource.experience);
    
    const itemsMessage = itemsGained.map(item => `   • ${item.quantity} × ${item.name}`).join('\n');

    return {
      success: true,
      message: `⛏️ **نجاح! تم جمع الموارد في ${playerLocationId}**\n\n**الموارد المكتسبة:**\n${itemsMessage}\n\n✨ +${resource.experience} خبرة`,
      gainedExp: resource.experience
    };
  }
}
