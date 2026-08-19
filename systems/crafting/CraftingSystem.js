import { recipes } from '../../data/recipes.js';
import { items } from '../../data/items.js';

export class CraftingSystem {
  constructor() {
    this.RECIPES = recipes;
    this.ITEMS = items;
    console.log(`🔨 نظام الصناعة تم تهيئته. (وصفات: ${Object.keys(this.RECIPES).length})`);
  }

  // ===================================
  // Helpers
  // ===================================
  _shouldShowRecipe(player, recipe, showFullList) {
    if (showFullList) return true;
    for (const materialId in recipe.materials) {
      if (player.getItemQuantity(materialId) > 0) return true;
    }
    return false;
  }

  _getRecipesByType(typeFilter) {
    const list = [];
    for (const id in this.RECIPES) {
      const recipe = this.RECIPES[id];
      const itemInfo = this.ITEMS[recipe.id] || {};
      const isFurnace = recipe.requiredTool === 'furnace' || itemInfo.type === 'bar' || itemInfo.type === 'food';
      const isToolStation = itemInfo.type === 'tool_station';
      
      if (typeFilter === 'FURNACE' && isFurnace) {
        list.push(recipe);
      } else if (typeFilter === 'TABLE') {
        if (isToolStation) list.push(recipe);
        else if (!isFurnace && (recipe.requiredTool === 'crafting_table' || !recipe.requiredTool)) list.push(recipe);
      } else if (typeFilter === 'ALL') {
        list.push(recipe);
      }
    }
    return list;
  }

  _formatRecipes(recipesList, player, title) {
    let text = `\n${title} (${recipesList.length})\n`;
    recipesList.forEach(recipe => {
      const toolName = recipe.requiredTool === 'crafting_table' || !recipe.requiredTool
        ? 'طاولة صناعة'
        : (this.ITEMS[recipe.requiredTool]?.name || recipe.requiredTool);
      
      text += `\n✨ ${recipe.name} (المستوى ${recipe.requiredLevel || 1})\n`;
      text += `   🛠️ الأداة: ${toolName}\n`;
      
      const matParts = [];
      for (const matId in recipe.materials) {
        const needed = recipe.materials[matId];
        const owned = player.getItemQuantity(matId);
        const matName = this.ITEMS[matId]?.name || matId;
        const icon = owned >= needed ? '✅' : '❌';
        matParts.push(`${icon} ${matName}: ${owned}/${needed}`);
      }
      text += `   📦 المواد: ${matParts.join(' | ')}\n`;
    });
    return text;
  }

  isFurnaceRecipe(itemId) {
    const recipe = this.RECIPES[itemId];
    const itemInfo = this.ITEMS[itemId] || {};
    return recipe && (recipe.requiredTool === 'furnace' || itemInfo.type === 'bar' || itemInfo.type === 'food');
  }

  // ===================================
  // Main Crafting
  // ===================================
  async craftItem(player, itemId, quantity = 1) {
    const recipe = this.RECIPES[itemId];
    if (!recipe) {
      const name = this.ITEMS[itemId]?.name || itemId;
      return { error: `❌ لا توجد وصفة لـ ${name}` };
    }
    
    if (quantity < 1 || quantity > 100) {
      return { error: '❌ الكمية يجب أن تكون بين 1 و 100' };
    }

    // Check level
    if (player.level < (recipe.requiredLevel || 1)) {
      return { error: `❌ تحتاج المستوى ${recipe.requiredLevel || 1} لصنع ${recipe.name}` };
    }

    // Check stamina
    const staminaCostPerItem = 10;
    const totalStaminaCost = staminaCostPerItem * quantity;
    const actualStamina = player.getActualStamina();
    if (actualStamina < totalStaminaCost) {
      return { error: `😩 النشاط غير كافٍ! تحتاج ${totalStaminaCost} لكن لديك ${Math.floor(actualStamina)}` };
    }

    // Check required tool
    const isToolStation = this.ITEMS[itemId]?.type === 'tool_station';
    if (!isToolStation && recipe.requiredTool && recipe.requiredTool !== 'crafting_table') {
      if (player.getItemQuantity(recipe.requiredTool) === 0) {
        const toolName = this.ITEMS[recipe.requiredTool]?.name || recipe.requiredTool;
        return { error: `❌ تحتاج إلى ${toolName} لصنع هذا العنصر` };
      }
    }

    // Check materials
    const missing = [];
    for (const matId in recipe.materials) {
      const needed = recipe.materials[matId] * quantity;
      const owned = player.getItemQuantity(matId);
      if (owned < needed) {
        const matName = this.ITEMS[matId]?.name || matId;
        missing.push(`❌ ${matName}: ${owned}/${needed}`);
      }
    }
    if (missing.length > 0) {
      return { error: `❌ مواد غير كافية:\n${missing.join('\n')}` };
    }

    // Consume materials
    for (const matId in recipe.materials) {
      player.removeItem(matId, recipe.materials[matId] * quantity);
    }

    // Consume stamina
    player.useStamina(totalStaminaCost);

    // Add crafted item(s)
    const itemInfo = this.ITEMS[itemId] || { id: itemId, name: recipe.name, type: 'other' };
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
    const all = this._getRecipesByType('FURNACE');
    const filtered = all.filter(r => this._shouldShowRecipe(player, r, showFullList));
    
    let message = `🔥 وصفات الفرن والتعدين\n`;
    
    const hasFurnace = player.getItemQuantity('furnace') > 0;
    if (!hasFurnace) {
      const recipe = this.RECIPES['furnace'];
      if (recipe) {
        message += `\n❌ الفرن غير مبني!\n`;
        message += `📦 لبنائه تحتاج: ${Object.entries(recipe.materials).map(([id, q]) => `${q} ${this.ITEMS[id]?.name || id}`).join(' و ')}\n`;
        message += `💡 استخدم "اصنع فرن" أولاً.`;
      } else {
        message += `❌ وصفة الفرن غير متوفرة.`;
      }
      return { message };
    }

    const smelting = filtered.filter(r => this.ITEMS[r.id]?.type === 'bar');
    const cooking = filtered.filter(r => this.ITEMS[r.id]?.type === 'food');

    if (smelting.length) message += this._formatRecipes(smelting, player, '🪙 السبائك');
    if (cooking.length) message += this._formatRecipes(cooking, player, '🍲 الطبخ');
    if (!smelting.length && !cooking.length) message += `\n❌ لا توجد وصفات متاحة لك حالياً.`;

    message += `\n💡 للصهر: "صهر [اسم الخام] [كمية]"`;
    message += `\n💡 للطهي: "طهو [اسم الطعام] [كمية]"`;
    return { message };
  }

  showAvailableRecipes(player, showFullList = false) {
    const all = this._getRecipesByType('TABLE');
    const filtered = all.filter(r => this._shouldShowRecipe(player, r, showFullList));
    
    let message = `🔨 طاولة الصناعة\n`;
    message += `📝 الوصفات المتاحة: ${filtered.length} / ${all.length}\n`;

    const categorized = {};
    filtered.forEach(r => {
      const type = this.ITEMS[r.id]?.type || 'other';
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
    return { message };
  }

  async cook(player, itemName, quantity = 1) {
    return await this._processFurnace(player, itemName, quantity, 'food');
  }

  async smelt(player, itemName, quantity = 1) {
    return await this._processFurnace(player, itemName, quantity, 'bar');
  }

  async _processFurnace(player, itemName, quantity, expectedType) {
    const itemId = this._resolveItemId(itemName);
    const recipe = this.RECIPES[itemId];
    if (!recipe) return { error: `❌ لا توجد وصفة لـ ${itemName}` };
    const itemInfo = this.ITEMS[itemId] || {};
    if (itemInfo.type !== expectedType) {
      return { error: `❌ ${itemInfo.name} ليس ${expectedType === 'food' ? 'طعامًا' : 'خامًا/سبيكة'}` };
    }
    if (!this.isFurnaceRecipe(itemId)) return { error: `❌ هذه الوصفة لا تُنفذ في الفرن` };
    return await this.craftItem(player, itemId, quantity);
  }

  _resolveItemId(input) {
    const lower = input.trim().toLowerCase();
    if (this.ITEMS[lower]) return lower;
    for (const id in this.ITEMS) {
      if (this.ITEMS[id].name.toLowerCase() === lower) return id;
    }
    for (const id in this.ITEMS) {
      if (this.ITEMS[id].name.toLowerCase().includes(lower)) return id;
    }
    return lower;
  }
    }
