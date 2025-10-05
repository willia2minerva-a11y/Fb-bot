// systems/gathering/GatheringSystem.js
import { resources } from '../../data/resources.js';

export class GatheringSystem {
  constructor() {
    this.allResources = resources;
    console.log('🌿 نظام جمع الموارد تم تهيئته. عدد الموارد القابلة للجمع:', Object.keys(this.allResources).length);
  }

  showAvailableResources(player) {
    const playerLocationId = player.currentLocation; 
    let message = `🔍 **موارد قابلة للجمع في ${playerLocationId}**:\n`;
    let found = false;

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

  // الدالة أصبحت async لحفظ الموديل
  async gatherResources(player, resourceId) {
    const resource = this.allResources[resourceId];
    const playerLocationId = player.currentLocation; 

    if (!resource) {
      return { error: `❌ المورد "${resourceId}" غير موجود في قاعدة البيانات.` };
    }

    if (!resource.locations.includes(playerLocationId)) {
      return { error: `❌ لا يمكنك جمع **${resource.name}** في موقعك الحالي (${playerLocationId}).` };
    }
    
    // يمكنك إضافة منطق التحقق من الأداة هنا لاحقًا

    let totalQuantity = 0;
    let itemsGained = [];
    
    for (const itemDrop of resource.items) {
      if (Math.random() <= itemDrop.chance) {
        const quantity = Math.floor(Math.random() * (itemDrop.max - itemDrop.min + 1)) + itemDrop.min;
        
        if (quantity > 0) {
            // يفترض أن itemDrop.itemId هو اسم العنصر أيضاً
            player.addItem(itemDrop.itemId, itemDrop.itemId, 'resource', quantity);
            itemsGained.push({ name: itemDrop.itemId, quantity });
            totalQuantity += quantity;
        }
      }
    }
    
    if (totalQuantity === 0) {
        return { success: false, message: `🌿 حاولت جمع **${resource.name}** لكنك لم تجد شيئًا هذه المرة! حاول مجددًا.` };
    }

    // إضافة الخبرة
    player.addExperience(resource.experience);
    
    // 💾 حفظ التغييرات على موديل Mongoose
    await player.save(); 
    
    const itemsMessage = itemsGained.map(item => `   • ${item.quantity} × ${item.name}`).join('\n');

    return {
      success: true,
      message: `⛏️ **نجاح! تم جمع الموارد في ${playerLocationId}**\n\n**الموارد المكتسبة:**\n${itemsMessage}\n\n✨ +${resource.experience} خبرة`,
      gainedExp: resource.experience
    };
  }
}
