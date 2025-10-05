// systems/crafting/CraftingSystem.js
import { craftingRecipes } from '../../data/crafting.js';
// 💡 ملاحظة: تحتاج إلى إنشاء أو التأكد من مسار item.js و player.js (أو استخدام كائنات وهمية)
import { items } from '../../data/items.js'; 

export class CraftingSystem {
  constructor() {
    this.recipes = craftingRecipes;
    this.items = items;
    console.log('🛠️ نظام الصناعة تم تهيئته. عدد الوصفات:', Object.keys(this.recipes).length);
  }

  // دالة مساعدة للحصول على اسم العنصر
  getItemName(itemId) {
    return this.items[itemId] ? this.items[itemId].name : itemId;
  }

  // 1. عرض الوصفات المتاحة
  showCraftingRecipes(player) {
    let message = `🛠️ **ورشة الصناعة - الوصفات (${Object.keys(this.recipes).length})**\n\n`;
    
    for (const itemId in this.recipes) {
      const recipe = this.recipes[itemId];
      const itemName = this.getItemName(itemId);
      
      const materialsList = recipe.materials.map(mat => {
        const matName = this.getItemName(mat.id);
        // يفترض أن اللاعب لديه خاصية inventory
        const playerQuantity = player.inventory[mat.id] || 0; 
        const status = (playerQuantity >= mat.quantity) ? '✅' : '❌';
        return `  • ${status} ${matName}: ${playerQuantity}/${mat.quantity}`;
      }).join('\n');
      
      message += `\n**🔗 ${itemName}**\n`;
      message += `${materialsList}`;
    }

    message += `\n\n💡 **للتصنيع:** استخدم أمر "اصنع [ID العنصر]"\nمثال: اصنع ${Object.keys(this.recipes)[0]}`;
    return { message };
  }

  // 2. تنفيذ عملية الصناعة
  craftItem(player, itemId) {
    const recipe = this.recipes[itemId];

    if (!recipe) {
      return { error: `❌ لا توجد وصفة لـ "${this.getItemName(itemId)}".` };
    }

    if (!player.inventory) {
        return { error: '❌ ملف اللاعب لا يحتوي على جرد (Inventory).' };
    }

    // 1. التحقق من توافر المواد
    const missingMaterials = [];
    for (const mat of recipe.materials) {
      if ((player.inventory[mat.id] || 0) < mat.quantity) {
        missingMaterials.push(`${this.getItemName(mat.id)} (${mat.quantity - (player.inventory[mat.id] || 0)} مفقود)`);
      }
    }

    if (missingMaterials.length > 0) {
      return { 
        error: `❌ لا يمكنك صنع ${this.getItemName(itemId)}! المواد المفقودة:\n${missingMaterials.join('\n')}` 
      };
    }

    // 2. خصم المواد
    for (const mat of recipe.materials) {
      player.inventory[mat.id] -= mat.quantity;
      if (player.inventory[mat.id] <= 0) {
        delete player.inventory[mat.id]; // حذف إذا أصبحت الكمية صفر
      }
    }

    // 3. إضافة العنصر المصنوع
    player.inventory[itemId] = (player.inventory[itemId] || 0) + 1;

    return {
      success: true,
      message: `✨ **نجاح!** تم صنع **${this.getItemName(itemId)}** بنجاح.`,
      craftedItem: this.items[itemId]
    };
  }
}
