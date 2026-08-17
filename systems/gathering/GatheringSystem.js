// systems/gathering/GatheringSystem.js
import { resources } from '../../data/resources.js';

export class GatheringSystem {
  constructor() {
    this.allResources = resources;
    console.log('🌿 نظام جمع الموارد تم تهيئته. عدد الموارد القابلة للجمع:', Object.keys(this.allResources).length);
  }

  showAvailableResources(player) {
    console.log('🔍 showAvailableResources called');
    console.log('👤 player:', player ? 'exists' : 'null');
    console.log('📍 player.currentLocation:', player?.currentLocation);
    console.log('📦 resources count:', Object.keys(this.allResources).length);
    
    const playerLocationId = player?.currentLocation || 'forest';
    console.log('📍 استخدام الموقع:', playerLocationId);
    
    let message = `🔍 **موارد قابلة للجمع في ${playerLocationId}**:\n`;
    let found = false;

    for (const resourceId in this.allResources) {
      const resource = this.allResources[resourceId];
      
      // ✅ تشخيص الموارد التي بدون locations
      if (!resource.locations) {
        console.log(`⚠️ المورد ${resourceId} بدون locations - تم تخطيه`);
        continue;
      }
      
      if (!Array.isArray(resource.locations)) {
        console.log(`⚠️ المورد ${resourceId} - locations ليست مصفوفة:`, typeof resource.locations);
        continue;
      }
      
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

  async gatherResources(player, resourceId) {
    const resource = this.allResources[resourceId];
    const playerLocationId = player?.currentLocation || 'forest';

    if (!resource) {
      return { error: `❌ المورد "${resourceId}" غير موجود في قاعدة البيانات.` };
    }

    if (!resource.locations || !Array.isArray(resource.locations)) {
      return { error: `❌ **${resource.name}** ليس مورداً قابلاً للجمع.` };
    }

    if (!resource.locations.includes(playerLocationId)) {
      return { error: `❌ لا يمكنك جمع **${resource.name}** في موقعك الحالي (${playerLocationId}).` };
    }

    let totalQuantity = 0;
    let itemsGained = [];
    
    if (resource.items && Array.isArray(resource.items)) {
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
    }
    
    if (totalQuantity === 0) {
        return { success: false, message: `🌿 حاولت جمع **${resource.name}** لكنك لم تجد شيئًا هذه المرة! حاول مجددًا.` };
    }

    player.addExperience(resource.experience || 0);
    
    await player.save(); 
    
    const itemsMessage = itemsGained.map(item => `   • ${item.quantity} × ${item.name}`).join('\n');

    return {
      success: true,
      message: `⛏️ **نجاح! تم جمع الموارد في ${playerLocationId}**\n\n**الموارد المكتسبة:**\n${itemsMessage}\n\n✨ +${resource.experience || 0} خبرة`,
      gainedExp: resource.experience || 0
    };
  }
  }
