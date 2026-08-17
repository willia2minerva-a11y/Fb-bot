// systems/gathering/GatheringSystem.js
import { resources } from '../../data/resources.js';

export class GatheringSystem {
  constructor() {
    this.allResources = resources;
    console.log('🌿 نظام جمع الموارد تم تهيئته. عدد الموارد القابلة للجمع:', Object.keys(this.allResources).length);
  }

  showAvailableResources(player) {
    const playerLocationId = player.currentLocation || 'forest'; // ✅ قيمة افتراضية
    
    if (!playerLocationId) {
      return { message: '❌ موقعك الحالي غير معروف. استخدم "استكشف" لتحديد موقعك.' };
    }
    
    let message = `🔍 **موارد قابلة للجمع في ${playerLocationId}**:\n`;
    let found = false;

    for (const resourceId in this.allResources) {
      const resource = this.allResources[resourceId];
      
      // ✅ التحقق من وجود locations قبل استخدام includes
      if (resource.locations && Array.isArray(resource.locations) && resource.locations.includes(playerLocationId)) {
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

  // الدالة أصبحت async لحفظ الموديل
  async gatherResources(player, resourceId) {
    const resource = this.allResources[resourceId];
    const playerLocationId = player.currentLocation || 'forest'; // ✅ قيمة افتراضية

    if (!resource) {
      return { error: `❌ المورد "${resourceId}" غير موجود في قاعدة البيانات.` };
    }

    // ✅ التحقق من وجود locations قبل استخدام includes
    if (!resource.locations || !Array.isArray(resource.locations) || !resource.locations.includes(playerLocationId)) {
      return { error: `❌ لا يمكنك جمع **${resource.name}** في موقعك الحالي (${playerLocationId}).` };
    }
    
    // يمكنك إضافة منطق التحقق من الأداة هنا لاحقًا

    let totalQuantity = 0;
    let itemsGained = [];
    
    // ✅ التحقق من وجود items قبل التكرار
    if (resource.items && Array.isArray(resource.items)) {
      for (const itemDrop of resource.items) {
        if (Math.random() <= itemDrop.chance) {
          const quantity = Math.floor(Math.random() * (itemDrop.max - itemDrop.min + 1)) + itemDrop.min;
          
          if (quantity > 0) {
              // ✅ استخدام الاسم الصحيح للعنصر
              const itemName = itemDrop.itemId || 'مورد';
              player.addItem(itemDrop.itemId, itemName, 'resource', quantity);
              itemsGained.push({ name: itemName, quantity });
              totalQuantity += quantity;
          }
        }
      }
    }
    
    if (totalQuantity === 0) {
        return { success: false, message: `🌿 حاولت جمع **${resource.name}** لكنك لم تجد شيئًا هذه المرة! حاول مجددًا.` };
    }

    // إضافة الخبرة
    if (typeof player.addExperience === 'function') {
      player.addExperience(resource.experience || 0);
    }
    
    // 💾 حفظ التغييرات على موديل Mongoose
    await player.save(); 
    
    const itemsMessage = itemsGained.map(item => `   • ${item.quantity} × ${item.name}`).join('\n');

    return {
      success: true,
      message: `⛏️ **نجاح! تم جمع الموارد في ${playerLocationId}**\n\n**الموارد المكتسبة:**\n${itemsMessage}\n\n✨ +${resource.experience || 0} خبرة`,
      gainedExp: resource.experience || 0
    };
  }
}
