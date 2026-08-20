// systems/crafting/CraftingSystem.js

import { recipes } from '../../data/recipes.js';
import { items } from '../../data/items.js';

export class CraftingSystem {
  constructor() {
    this.RECIPES = recipes;
    this.ITEMS = items;

    console.log(
      `🔨 نظام الصناعة تم تهيئته. (وصفات: ${Object.keys(this.RECIPES).length})`
    );
  }

  // ===================================
  // Helpers
  // ===================================

  _shouldShowRecipe(player, recipe) {
    for (const materialId in recipe.materials) {
      if (player.getItemQuantity(materialId) > 0) {
        return true;
      }
    }

    return false;
  }

  _getRecipesByType(typeFilter) {
    const list = [];

    for (const id in this.RECIPES) {
      const recipe = this.RECIPES[id];
      const itemInfo = this.ITEMS[recipe.id] || {};

      const isFurnace =
        recipe.requiredTool === 'furnace' ||
        itemInfo.type === 'bar' ||
        itemInfo.type === 'food';

      if (typeFilter === 'FURNACE' && isFurnace) {
        list.push(recipe);
      } else if (typeFilter === 'NORMAL' && !isFurnace) {
        list.push(recipe);
      } else if (typeFilter === 'ALL') {
        list.push(recipe);
      }
    }

    return list;
  }

  // ===================================
  // تنسيق بطاقات الوصفات
  // ===================================

  _formatRecipes(recipesList, player, title) {
    let text = `\n${title} (${recipesList.length})\n`;

    // تجهيز بيانات الوصفات
    const cards = recipesList.map(recipe => {
      const levelLine = `◀️ المستوى : ${recipe.requiredLevel || 1}`;

      const materialLines = [];

      for (const matId in recipe.materials) {
        const needed = recipe.materials[matId];
        const owned = player.getItemQuantity(matId);

        const matName = this.ITEMS[matId]?.name || matId;
        const icon = owned >= needed ? '✅' : '❌';

        materialLines.push(
          `${icon} ${matName}: ${owned}/${needed}`
        );
      }

      return {
        name: recipe.name,
        contentLines: [
          levelLine,
          ...materialLines
        ]
      };
    });

    // ===================================
    // بناء كل بطاقة بعرض مستقل
    // ===================================

    cards.forEach(card => {
      // حساب أطول سطر داخل البطاقة الحالية فقط
      let maxContentLength = 0;

      for (const line of card.contentLines) {
        if (line.length > maxContentLength) {
          maxContentLength = line.length;
        }
      }

      // العنوان مع مسافة من الجهتين
      const titleText = ` ${card.name} `;
      const titleLength = titleText.length;

      /*
       * عرض البطاقة يعتمد على:
       *
       * 1. أطول سطر في المحتوى
       * 2. طول العنوان
       * 3. حد أدنى مناسب
       *
       * كل بطاقة لها totalWidth خاص بها.
       */
      const totalWidth = Math.max(
        maxContentLength + 4,
        titleLength + 2,
        14
      );

      // ===================================
      // السطر العلوي
      // ===================================

      /*
       * ┐──── العنوان ────┌
       */

      const totalDashes =
        totalWidth - 2 - titleLength;

      const leftDashes =
        Math.floor(totalDashes / 2);

      const rightDashes =
        totalDashes - leftDashes;

      const topLine =
        '┐' +
        '─'.repeat(leftDashes) +
        titleText +
        '─'.repeat(rightDashes) +
        '┌';

      text += topLine + '\n';

      // ===================================
      // محتوى البطاقة
      // ===================================

      card.contentLines.forEach(line => {
        const padding =
          totalWidth - 4 - line.length;

        text +=
          '│ ' +
          line +
          ' '.repeat(Math.max(0, padding)) +
          ' │\n';
      });

      // ===================================
      // السطر السفلي
      // ===================================

      const bottomLine =
        '┘' +
        '─'.repeat(totalWidth - 2) +
        '└';

      text += bottomLine + '\n\n';
    });

    return text;
  }

  // ===================================
  // Furnace Detection
  // ===================================

  isFurnaceRecipe(itemId) {
    const recipe = this.RECIPES[itemId];
    const itemInfo = this.ITEMS[itemId] || {};

    return (
      recipe &&
      (
        recipe.requiredTool === 'furnace' ||
        itemInfo.type === 'bar' ||
        itemInfo.type === 'food'
      )
    );
  }

  // ===================================
  // Main Crafting
  // ===================================

  async craftItem(player, itemId, quantity = 1) {
    const recipe = this.RECIPES[itemId];

    if (!recipe) {
      const name = this.ITEMS[itemId]?.name || itemId;

      return {
        error: `❌ لا توجد وصفة لـ ${name}`
      };
    }

    // التحقق من الكمية
    if (quantity < 1 || quantity > 100) {
      return {
        error: '❌ الكمية يجب أن تكون بين 1 و 100'
      };
    }

    // التحقق من المستوى
    if (player.level < (recipe.requiredLevel || 1)) {
      return {
        error:
          `❌ تحتاج المستوى ${recipe.requiredLevel || 1} لصنع ${recipe.name}`
      };
    }

    // ===================================
    // Stamina
    // ===================================

    const staminaCostPerItem = 10;
    const totalStaminaCost =
      staminaCostPerItem * quantity;

    const actualStamina =
      player.getActualStamina();

    if (actualStamina < totalStaminaCost) {
      return {
        error:
          `😩 النشاط غير كافٍ! تحتاج ${totalStaminaCost} لكن لديك ${Math.floor(actualStamina)}`
      };
    }

    // ===================================
    // التحقق من المواد
    // ===================================

    const missing = [];

    for (const matId in recipe.materials) {
      const needed =
        recipe.materials[matId] * quantity;

      const owned =
        player.getItemQuantity(matId);

      if (owned < needed) {
        const matName =
          this.ITEMS[matId]?.name || matId;

        missing.push(
          `❌ ${matName}: ${owned}/${needed}`
        );
      }
    }

    if (missing.length > 0) {
      return {
        error:
          `❌ مواد غير كافية:\n${missing.join('\n')}`
      };
    }

    // ===================================
    // إزالة المواد
    // ===================================

    for (const matId in recipe.materials) {
      player.removeItem(
        matId,
        recipe.materials[matId] * quantity
      );
    }

    // ===================================
    // استهلاك النشاط
    // ===================================

    player.useStamina(totalStaminaCost);

    // ===================================
    // إضافة العنصر المصنوع
    // ===================================

    const itemInfo =
      this.ITEMS[itemId] || {
        id: itemId,
        name: recipe.name,
        type: 'other'
      };

    player.addItem(
      itemInfo.id,
      itemInfo.name,
      itemInfo.type,
      quantity
    );

    // ===================================
    // الإحصائيات
    // ===================================

    if (player.stats) {
      player.stats.itemsCrafted =
        (player.stats.itemsCrafted || 0) +
        quantity;
    }

    // ===================================
    // حفظ اللاعب
    // ===================================

    await player.save();

    return {
      success: true,

      message:
        `✅ تم صنع ${quantity} × ${itemInfo.name} بنجاح!\n` +
        `- استهلكت ${totalStaminaCost} نشاط.`,

      item: itemInfo,
      quantity
    };
  }

  // ===================================
  // Furnace & Cooking
  // ===================================

  showFurnaceRecipes(player, showFullList = false) {
    const allFurnace =
      this._getRecipesByType('FURNACE');

    const filtered =
      showFullList
        ? allFurnace
        : allFurnace.filter(recipe =>
            this._shouldShowRecipe(player, recipe)
          );

    let message = `🔥 وصفات الفرن\n`;

    // ===================================
    // التحقق من وجود الفرن
    // ===================================

    const hasFurnace =
      player.getItemQuantity('furnace') > 0;

    if (!hasFurnace) {
      const recipe =
        this.RECIPES['furnace'];

      message += `\n❌ الفرن غير مبني!\n`;
      message +=
        `📦 لبنائه استخدم: "اصنع فرن"\n`;

      message +=
        `📋 المواد المطلوبة: `;

      if (recipe) {
        const parts = [];

        for (const [id, q] of Object.entries(
          recipe.materials
        )) {
          parts.push(
            `${q} ${this.ITEMS[id]?.name || id}`
          );
        }

        message += parts.join(' و ');
      }

      message += `\n💡 بعد بناء الفرن ستتمكن من الصهر والطهي.`;

      return {
        message
      };
    }

    // ===================================
    // تقسيم وصفات الفرن
    // ===================================

    const smelting =
      filtered.filter(
        recipe =>
          this.ITEMS[recipe.id]?.type === 'bar'
      );

    const cooking =
      filtered.filter(
        recipe =>
          this.ITEMS[recipe.id]?.type === 'food'
      );

    // ===================================
    // السبائك
    // ===================================

    if (smelting.length) {
      message += this._formatRecipes(
        smelting,
        player,
        '🪙 السبائك (صهر)'
      );
    }

    // ===================================
    // الطبخ
    // ===================================

    if (cooking.length) {
      message += this._formatRecipes(
        cooking,
        player,
        '🍲 الطبخ'
      );
    }

    // لا توجد وصفات
    if (
      !smelting.length &&
      !cooking.length
    ) {
      message +=
        `\n❌ لا توجد وصفات فرن متاحة.`;
    }

    // ===================================
    // التعليمات
    // ===================================

    message +=
      `\n💡 للصهر: "صهر [اسم الخام] [كمية]"`;

    message +=
      `\n💡 للطهي: "طهو [اسم الطعام] [كمية]"`;

    if (
      !showFullList &&
      filtered.length < allFurnace.length
    ) {
      message +=
        `\n💡 لعرض جميع وصفات الفرن: "فرن كاملة"`;
    }

    return {
      message
    };
  }

  // ===================================
  // Available Recipes
  // ===================================

  showAvailableRecipes(
    player,
    showFullList = false
  ) {
    const allNormal =
      this._getRecipesByType('NORMAL');

    const filtered =
      showFullList
        ? allNormal
        : allNormal.filter(recipe =>
            this._shouldShowRecipe(player, recipe)
          );

    let message = `🔨 الصناعة\n`;

    message +=
      `📝 الوصفات المتاحة لك (${filtered.length} / ${allNormal.length})\n`;

    // ===================================
    // تصنيف الوصفات
    // ===================================

    const categorized = {};

    filtered.forEach(recipe => {
      const type =
        this.ITEMS[recipe.id]?.type ||
        'other';

      if (!categorized[type]) {
        categorized[type] = [];
      }

      categorized[type].push(recipe);
    });

    // ترتيب الأقسام
    const order = [
      'tool_station',
      'weapon',
      'tool',
      'armor',
      'accessory',
      'potion',
      'other'
    ];

    let found = false;

    // ===================================
    // عرض الأقسام
    // ===================================

    for (const type of order) {
      const list =
        categorized[type] || [];

      if (list.length) {
        found = true;

        const typeName = {
          tool_station: '⚙️ محطات عمل',
          weapon: '⚔️ أسلحة',
          tool: '⛏️ أدوات',
          armor: '🛡️ دروع',
          accessory: '💍 إكسسوارات',
          potion: '🧪 جرعات',
          other: '📦 أخرى'
        }[type];

        message += this._formatRecipes(
          list,
          player,
          typeName
        );
      }
    }

    // ===================================
    // لا توجد وصفات
    // ===================================

    if (!found) {
      message +=
        `\n❌ لا توجد وصفات متاحة. اجمع المزيد من المواد!`;
    }

    // ===================================
    // التعليمات
    // ===================================

    message +=
      `\n💡 للصناعة: "اصنع [اسم العنصر] [كمية]"`;

    message +=
      `\n💡 للفرن: "فرن"`;

    if (
      !showFullList &&
      filtered.length < allNormal.length
    ) {
      message +=
        `\n💡 لعرض جميع الوصفات: "صناعة كاملة"`;
    }

    return {
      message
    };
  }

  // ===================================
  // Cooking
  // ===================================

  async cook(
    player,
    itemName,
    quantity = 1
  ) {
    return await this._processFurnace(
      player,
      itemName,
      quantity,
      'food'
    );
  }

  // ===================================
  // Smelting
  // ===================================

  async smelt(
    player,
    itemName,
    quantity = 1
  ) {
    return await this._processFurnace(
      player,
      itemName,
      quantity,
      'bar'
    );
  }

  // ===================================
  // Furnace Processing
  // ===================================

  async _processFurnace(
    player,
    itemName,
    quantity,
    expectedType
  ) {
    // ===================================
    // التحقق من الفرن
    // ===================================

    if (
      player.getItemQuantity('furnace') === 0
    ) {
      return {
        error:
          '❌ تحتاج إلى فرن أولاً! استخدم "اصنع فرن" لبنائه.'
      };
    }

    // ===================================
    // تحديد العنصر
    // ===================================

    const itemId =
      this._resolveItemId(itemName);

    const recipe =
      this.RECIPES[itemId];

    if (!recipe) {
      return {
        error:
          `❌ لا توجد وصفة لـ ${itemName}`
      };
    }

    // ===================================
    // التحقق من نوع العنصر
    // ===================================

    const itemInfo =
      this.ITEMS[itemId] || {};

    if (
      itemInfo.type !== expectedType
    ) {
      return {
        error:
          `❌ ${itemInfo.name} ليس ${
            expectedType === 'food'
              ? 'طعامًا'
              : 'خامًا/سبيكة'
          }`
      };
    }

    // ===================================
    // التحقق من أن الوصفة للفرن
    // ===================================

    if (!this.isFurnaceRecipe(itemId)) {
      return {
        error:
          `❌ هذه الوصفة لا تُنفذ في الفرن`
      };
    }

    // ===================================
    // تنفيذ الصناعة
    // ===================================

    return await this.craftItem(
      player,
      itemId,
      quantity
    );
  }

  // ===================================
  // Resolve Item ID
  // ===================================

  _resolveItemId(input) {
    const lower =
      input.trim().toLowerCase();

    // البحث عن ID مباشر
    if (this.ITEMS[lower]) {
      return lower;
    }

    // البحث عن الاسم الكامل
    for (const id in this.ITEMS) {
      if (
        this.ITEMS[id].name
          .toLowerCase() === lower
      ) {
        return id;
      }
    }

    // البحث الجزئي
    for (const id in this.ITEMS) {
      if (
        this.ITEMS[id].name
          .toLowerCase()
          .includes(lower)
      ) {
        return id;
      }
    }

    return lower;
  }
                            }
