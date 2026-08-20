// systems/crafting/CraftingSystem.js
import { recipes } from '../../data/recipes.js';
import { items } from '../../data/items.js';
import { resources } from '../../data/resources.js';

export class CraftingSystem {
  constructor() {
    this.RECIPES = recipes;
    this.ITEMS = items;
    this.RESOURCES = resources; // لإضافة ترجمة الموارد
    console.log(`🔨 نظام الصناعة تم تهيئته. (وصفات: ${Object.keys(this.RECIPES).length})`);
  }

  // ===================================
  // Helpers - الترجمة
  // ===================================
  _translateItemName(itemId) {
    // 1. نبحث في الموارد (أسماء عربية)
    if (this.RESOURCES[itemId]?.name) return this.RESOURCES[itemId].name;
    // 2. نبحث في العناصر (قد تحتوي أسماء عربية)
    if (this.ITEMS[itemId]?.name) return this.ITEMS[itemId].name;
    // 3. نرجع المعرف نفسه
    return itemId;
  }

  _shouldShowRecipe(player, recipe) {
    for (const materialId in recipe.materials) {
      if (player.getItemQuantity(materialId) > 0) return true;
    }
    return false;
  }

  _getRecipesByType(typeFilter) {
    const list = [];
    for (const id in this.RECIPES) {
      const recipe = this.RECIPES[id];
      // التصنيف يعتمد على recipe.type وليس على نوع العنصر
      const isFurnace = recipe.type === 'bar' || recipe.type === 'food' || recipe.requiredTool === 'furnace';
      if (typeFilter === 'FURNACE' && isFurnace) list.push(recipe);
      else if (typeFilter === 'NORMAL' && !isFurnace) list.push(recipe);
      else if (typeFilter === 'ALL') list.push(recipe);
    }
    return list;
  }

  _formatRecipes(recipesList, player, title) {
    let text = `\n${title} (${recipesList.length})\n`;

    recipesList.forEach(recipe => {
      const itemName = this._translateItemName(recipe.id);
      text += `\n◆ ${itemName}\n`;
      text += `┤─ ◀️ المستوى : ${recipe.requiredLevel || 1}\n`;

      const materialEntries = Object.entries(recipe.materials);
      materialEntries.forEach(([matId, needed], index) => {
        const owned = player.getItemQuantity(matId);
        const matName = this._translateItemName(matId);
        const icon = owned >= needed ? '✅' : '❌';
        const isLast = index === materialEntries.length - 1;
        const prefix = isLast ? '┘─' : '┤─';
        text += `${prefix} ${icon} ${matName}: ${owned}/${needed}\n`;
      });
    });

    return text;
  }

  isFurnaceRecipe(itemId) {
    const recipe = this.RECIPES[itemId];
    return recipe && (recipe.type === 'bar' || recipe.type === 'food' || recipe.requiredTool === 'furnace');
  }

  // ===================================
  // Main Crafting
  // ===================================

  async craftItem(player, itemId, quantity = 1) {
    const recipe = this.RECIPES[itemId];
    if (!recipe) {
      const name = this._translateItemName(itemId);
      return { error: `❌ لا توجد وصفة لـ ${name}` };
    }

    if (quantity < 1 || quantity > 100) {
      return { error: '❌ الكمية يجب أن تكون بين 1 و 100' };
    }

    if (player.level < (recipe.requiredLevel || 1)) {
      return { error: `❌ تحتاج المستوى ${recipe.requiredLevel || 1} لصنع ${this._translateItemName(recipe.id)}` };
    }

    const staminaCostPerItem = 10;
    const totalStaminaCost = staminaCostPerItem * quantity;
    const actualStamina = player.getActualStamina();
    if (actualStamina < totalStaminaCost) {
      return { error: `😩 النشاط غير كافٍ! تحتاج ${totalStaminaCost} لكن لديك ${Math.floor(actualStamina)}` };
    }

    const missing = [];
    for (const matId in recipe.materials) {
      const needed = recipe.materials[matId] * quantity;
      const owned = player.getItemQuantity(matId);
      if (owned < needed) {
        const matName = this._translateItemName(matId);
        missing.push(`❌ ${matName}: ${owned}/${needed}`);
      }
    }
    if (missing.length > 0) {
      return { error: `❌ مواد غير كافية:\n${missing.join('\n')}` };
    }

    for (const matId in recipe.materials) {
      player.removeItem(matId, recipe.materials[matId] * quantity);
    }
    player.useStamina(totalStaminaCost);

    const itemInfo = this.ITEMS[itemId] || { id: itemId, name: this._translateItemName(itemId), type: 'other' };
    player.addItem(itemInfo.id, itemInfo.name, itemInfo.type, quantity);

    if (player.stats) {
      player.stats.itemsCrafted = (player.stats.itemsCrafted || 0) + quantity;
    }

    await player.save();

    return {
      success: true,
      message: `✅ تم صنع ${quantity} × ${itemInfo.name} بنجاح!\n- استهلكت ${totalStaminaCost} نشاط.`,
      item: itemInfo,
      quantity
    };
  }

  // ===================================
  // Furnace & Cooking
  // ===================================

  showFurnaceRecipes(player, showFullList = false) {
    const allFurnace = this._getRecipesByType('FURNACE');
    const filtered = showFullList ? allFurnace : allFurnace.filter(r => this._shouldShowRecipe(player, r));

    let message = `🔥 وصفات الفرن\n`;

    const hasFurnace = player.getItemQuantity('furnace') > 0;
    if (!hasFurnace) {
      const recipe = this.RECIPES['furnace'];
      message += `\n❌ الفرن غير مبني!\n`;
      message += `📦 لبنائه استخدم: "اصنع فرن"\n`;
      message += `📋 المواد المطلوبة: `;
      if (recipe) {
        const parts = [];
        for (const [id, q] of Object.entries(recipe.materials)) {
          parts.push(`${q} ${this._translateItemName(id)}`);
        }
        message += parts.join(' و ');
      }
      message += `\n💡 بعد بناء الفرن ستتمكن من الصهر والطهي.`;
      return { message };
    }

    const smelting = filtered.filter(r => r.type === 'bar');
    const cooking = filtered.filter(r => r.type === 'food');

    if (smelting.length) message += this._formatRecipes(smelting, player, '🪙 السبائك (صهر)');
    if (cooking.length) message += this._formatRecipes(cooking, player, '🍲 الطبخ');
    if (!smelting.length && !cooking.length) message += `\n❌ لا توجد وصفات فرن متاحة.`;

    message += `\n💡 للصهر: "صهر [اسم الخام] [كمية]"`;
    message += `\n💡 للطهي: "طهو [اسم الطعام] [كمية]"`;
    if (!showFullList && filtered.length < allFurnace.length) {
      message += `\n💡 لعرض جميع وصفات الفرن: "فرن كاملة"`;
    }
    return { message };
  }

  showAvailableRecipes(player, showFullList = false) {
    const allNormal = this._getRecipesByType('NORMAL');
    const filtered = showFullList ? allNormal : allNormal.filter(r => this._shouldShowRecipe(player, r));

    let message = `🔨 الصناعة\n`;
    message += `📝 الوصفات المتاحة لك (${filtered.length} / ${allNormal.length})\n`;

    const categorized = {};
    filtered.forEach(r => {
      const type = r.type || this.ITEMS[r.id]?.type || 'other';
      if (!categorized[type]) categorized[type] = [];
      categorized[type].push(r);
    });

    const order = ['tool_station', 'weapon', 'tool', 'armor', 'accessory', 'potion', 'other'];
    let found = false;
    for (const type of order) {
      const list = categorized[type] || [];
      if (list.length) {
        found = true;
        const typeName = {
          'tool_station': '⚙️ محطات عمل',
          'weapon': '⚔️ أسلحة',
          'tool': '⛏️ أدوات',
          'armor': '🛡️ دروع',
          'accessory': '💍 إكسسوارات',
          'potion': '🧪 جرعات',
          'other': '📦 أخرى'
        }[type];
        message += this._formatRecipes(list, player, typeName);
      }
    }
    if (!found) message += `\n❌ لا توجد وصفات متاحة. اجمع المزيد من المواد!`;

    message += `\n💡 للصناعة: "اصنع [اسم العنصر] [كمية]"`;
    message += `\n💡 للفرن: "فرن"`;
    if (!showFullList && filtered.length < allNormal.length) {
      message += `\n💡 لعرض جميع الوصفات: "صناعة كاملة"`;
    }
    return { message };
  }

  async cook(player, itemName, quantity = 1) {
    return await this._processFurnace(player, itemName, quantity, 'food');
  }

  async smelt(player, itemName, quantity = 1) {
    return await this._processFurnace(player, itemName, quantity, 'bar');
  }

  async _processFurnace(player, itemName, quantity, expectedType) {
    if (player.getItemQuantity('furnace') === 0) {
      return { error: '❌ تحتاج إلى فرن أولاً! استخدم "اصنع فرن" لبنائه.' };
    }
    const itemId = this._resolveItemId(itemName);
    const recipe = this.RECIPES[itemId];
    if (!recipe) return { error: `❌ لا توجد وصفة لـ ${itemName}` };
    if (recipe.type !== expectedType) {
      return { error: `❌ ${this._translateItemName(itemId)} ليس ${expectedType === 'food' ? 'طعامًا' : 'خامًا/سبيكة'}` };
    }
    if (!this.isFurnaceRecipe(itemId)) return { error: `❌ هذه الوصفة لا تُنفذ في الفرن` };
    return await this.craftItem(player, itemId, quantity);
  }

  _resolveItemId(input) {
    const lower = input.trim().toLowerCase();
    // محاولة المعرف المباشر
    if (this.ITEMS[lower]) return lower;
    if (this.RESOURCES[lower]) return lower;
    // محاولة مطابقة الاسم العربي
    for (const id in this.ITEMS) {
      if (this.ITEMS[id].name?.toLowerCase() === lower) return id;
    }
    for (const id in this.RESOURCES) {
      if (this.RESOURCES[id].name?.toLowerCase() === lower) return id;
    }
    // محاولة مطابقة جزئية
    for (const id in this.ITEMS) {
      if (this.ITEMS[id].name?.toLowerCase().includes(lower)) return id;
    }
    for (const id in this.RESOURCES) {
      if (this.RESOURCES[id].name?.toLowerCase().includes(lower)) return id;
    }
    return lower;
  }
         }
