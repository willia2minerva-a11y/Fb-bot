import { items } from '../../data/items.js';

export class CraftingSystem {
  constructor() {
    this.craftableItems = items.filter(item => item.craft);
  }

  getCraftableItems(player) {
    return this.craftableItems.filter(item => {
      if (!item.craft) return false;
      
      // التحقق إذا كان اللاعب يمتلك المواد المطلوبة
      return item.craft.materials.every(material => 
        player.inventory.some(invItem => 
          invItem.name === material.item && invItem.quantity >= material.quantity
        )
      );
    });
  }

  craftItem(player, itemId) {
    const item = this.craftableItems.find(i => i.id === itemId);
    
    if (!item) {
      return { error: "❌ هذا العنصر غير قابل للصناعة." };
    }

    if (!item.craft) {
      return { error: "❌ لا يمكن صناعة هذا العنصر." };
    }

    // التحقق من المواد
    const missingMaterials = item.craft.materials.filter(material => 
      !player.inventory.some(invItem => 
        invItem.name === material.item && invItem.quantity >= material.quantity
      )
    );

    if (missingMaterials.length > 0) {
      const missingText = missingMaterials.map(m => `${m.quantity} × ${m.item}`).join(', ');
      return { error: `❌ المواد التالية ناقصة: ${missingText}` };
    }

    // استهلاك المواد
    item.craft.materials.forEach(material => {
      const invItem = player.inventory.find(i => i.name === material.item);
      invItem.quantity -= material.quantity;
      
      // إزالة العنصر إذا أصبحت الكمية صفر
      if (invItem.quantity <= 0) {
        player.inventory = player.inventory.filter(i => i.name !== material.item);
      }
    });

    // إضافة العنصر المصنوع
    player.addItem(item.id, item.name, item.type, 1);

    return {
      success: true,
      message: `🛠️ **تم صناعة ${item.name} بنجاح!**\n\n📊 الضرر: ${item.damage || 'N/A'}\n🎯 المستوى: ${item.tier}`,
      item: item
    };
  }

  showCraftingRecipes(player) {
    const craftable = this.getCraftableItems(player);
    
    if (craftable.length === 0) {
      return { 
        message: "🛠️ **لا توجد عناصر يمكنك صناعتها حالياً.**\n\nاجمع المزيد من المواد لفتح وصفات جديدة.",
        items: [] 
      };
    }

    let recipesText = `🛠️ **ورشة الصناعة**\n\n`;
    
    craftable.forEach((item, index) => {
      recipesText += `${index + 1}. **${item.name}**\n`;
      recipesText += `   📊 الضرر: ${item.damage || 'N/A'}\n`;
      recipesText += `   🎯 المستوى: ${item.tier}\n`;
      recipesText += `   📦 المواد: ${item.craft.materials.map(m => `${m.quantity} × ${m.item}`).join(', ')}\n\n`;
    });

    recipesText += `استخدم \`صنع [اسم العنصر]\` لصناعة العنصر.`;

    return {
      message: recipesText,
      items: craftable
    };
  }
                                     }
