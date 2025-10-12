// systems/crafting/CraftingSystem.js
// 💡 إصلاح جوهري: الاستيراد الحقيقي لملفات البيانات من المسارات الصحيحة
import { recipes } from '../../data/recipes.js'; 
import { items } from '../../data/items.js'; 


export class CraftingSystem {
    constructor() {
        // 🛠️ استخدام البيانات المستوردة مباشرة
        this.RECIPES = recipes;
        this.ITEMS = items;
        console.log(`🔨 نظام الصناعة تم تهيئته. (وصفات: ${Object.keys(this.RECIPES).length})`);
    }

    // ===================================
    // 🛠️ دوال المساعدة (Helpers)
    // ===================================

    /**
     * يحدد ما إذا كان يجب عرض الوصفة للاعب بناءً على الفلتر والمخزون.
     */
    _shouldShowRecipe(player, recipe, showFullList) {
        if (showFullList) return true;

        for (const materialId in recipe.materials) {
            // يكفي امتلاك قطعة واحدة من أي مادة مطلوبة لعرض الوصفة
            if (player.getItemQuantity(materialId) > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * 🆕 دالة موحدة لفلترة الوصفات
     */
    _getRecipesByType(typeFilter) {
        const recipesList = [];
        for (const id in this.RECIPES) {
            const recipe = this.RECIPES[id];
            const itemInfo = this.ITEMS[recipe.id] || {};

            const isFurnaceRecipe = recipe.requiredTool === 'furnace' || itemInfo.type === 'bar' || itemInfo.type === 'food';
            const isToolStationBuild = itemInfo.type === 'tool_station';
            
            if (typeFilter === 'FURNACE' && isFurnaceRecipe) {
                recipesList.push(recipe);
            } else if (typeFilter === 'TABLE') {
                // إضافة بناء الفرن + محطات العمل
                if (isToolStationBuild) {
                    recipesList.push(recipe);
                } 
                // إضافة باقي وصفات الطاولة العادية (الأسلحة، الأدوات، إلخ)
                else if (!isFurnaceRecipe && (recipe.requiredTool === 'crafting_table' || !recipe.requiredTool)) {
                     recipesList.push(recipe);
                }
            } else if (typeFilter === 'ALL') {
                recipesList.push(recipe);
            }
        }
        return recipesList;
    }

    /**
     * دالة مساعدة لتنظيم وعرض الوصفات من نوع معين (تنسيق مُحسّن)
     */
    _formatRecipes(recipesList, player, title) {
        let text = `\n═╡ ${title} (${recipesList.length}) ╞═\n`;
        
        recipesList.forEach(recipe => {
            let requiredToolDisplay = '';
            
            if (recipe.requiredTool === 'crafting_table' || !recipe.requiredTool) {
                requiredToolDisplay = 'طاولة صناعة';
            } else {
                 requiredToolDisplay = this.ITEMS[recipe.requiredTool]?.name || recipe.requiredTool;
                 if (this.ITEMS[recipe.requiredTool]?.type === 'tool_station') {
                     requiredToolDisplay = this.ITEMS[recipe.requiredTool]?.name;
                 }
            }
            
            // 💡 تنسيق العنصر
            text += `\n✨ **${recipe.name}** (المستوى: ${recipe.requiredLevel || 1})\n`;
            text += `  ├── الأداة المطلوبة: **${requiredToolDisplay}**\n`;

            // 💡 تنسيق المواد
            let materialsText = [];
            for (const materialId in recipe.materials) {
                const requiredQuantity = recipe.materials[materialId];
                const ownedQuantity = player.getItemQuantity(materialId);
                const materialName = this.ITEMS[materialId] ? this.ITEMS[materialId].name : materialId;
                const statusIcon = ownedQuantity >= requiredQuantity ? '✅' : '❌';
                materialsText.push(`${statusIcon} ${materialName}: ${ownedQuantity}/${requiredQuantity}`);
            }
            
            text += `  └── المواد: ${materialsText.join(' | ')}\n`;
        });
        return text;
    }
    
    /**
     * 🆕 لتحديد ما إذا كان العنصر يُصنع/يُطهى بالفرن. (مطلوبة لتفريق أوامر الطهي والصناعة)
     */
    isFurnaceRecipe(itemId) {
        const recipe = this.RECIPES[itemId];
        const itemInfo = this.ITEMS[itemId] || {};
        
        return recipe && (recipe.requiredTool === 'furnace' || itemInfo.type === 'bar' || itemInfo.type === 'food');
    }

    // ===================================
    // 🛠️ دالة التصنيع الرئيسية (Craft Item)
    // ===================================

    async craftItem(player, itemId) {
        const recipe = this.RECIPES[itemId];

        if (!recipe) {
            const itemName = this.ITEMS[itemId] ? this.ITEMS[itemId].name : itemId;
            return { error: `❌ لا توجد وصفة معروفة لـ **${itemName}**.` };
        }
        
        // 1. التحقق من النشاط
        const cost = 10; 
        const actualStamina = player.getActualStamina();

        if (actualStamina < cost) {
            const missingStamina = cost - actualStamina;
            const recoveryRate = 5; 
            const timeToRecover = Math.ceil(missingStamina / recoveryRate);
            
            return { error: `😩 **أنت متعب جداً!** الصناعة تتطلب ${cost} نشاط، لديك ${Math.floor(actualStamina)} فقط.\n⏳ ستستعيد النشاط الكافي في حوالي ${timeToRecover} دقيقة.` };
        }
        
        // 2. التحقق من المستوى والأداة
        if (player.level < (recipe.requiredLevel || 1)) {
            return { error: `❌ تحتاج إلى المستوى ${recipe.requiredLevel || 1} لصنع **${recipe.name}**.` };
        }
        
        let missingTool = false;
        let isToolStationCraft = this.ITEMS[itemId]?.type === 'tool_station';
        
        if (!isToolStationCraft && recipe.requiredTool && recipe.requiredTool !== 'crafting_table') {
            if (player.getItemQuantity(recipe.requiredTool) === 0) {
                 missingTool = true;
            }
        }
        
        if (missingTool) {
             const requiredToolName = this.ITEMS[recipe.requiredTool] ? this.ITEMS[recipe.requiredTool].name : recipe.requiredTool;
             return { error: `❌ تحتاج إلى محطة عمل **${requiredToolName}** لصنع هذا العنصر. (تأكد من بنائها أولاً)` };
        }
        
        // 3. التحقق من المواد
        const requiredMaterials = recipe.materials;
        let missingMaterials = [];

        for (const materialId in requiredMaterials) {
            const requiredQuantity = requiredMaterials[materialId];
            const ownedQuantity = player.getItemQuantity(materialId);
            
            if (ownedQuantity < requiredQuantity) {
                const materialName = this.ITEMS[materialId] ? this.ITEMS[materialId].name : materialId;
                missingMaterials.push(`❌ ${materialName}: ${ownedQuantity}/${requiredQuantity}`);
            }
        }

        if (missingMaterials.length > 0) {
            return { error: `❌ لا تملك المواد الكافية لصنع ${recipe.name}:\n${missingMaterials.join('\n')}` };
        }

        // 4. استهلاك المواد والنشاط
        for (const materialId in requiredMaterials) {
            player.removeItem(materialId, requiredMaterials[materialId]);
        }
        
        player.useStamina(cost);
        
        // 5. إضافة العنصر المصنوع
        const craftedItemInfo = this.ITEMS[itemId] || { id: itemId, name: recipe.name, type: 'other' };
        player.addItem(craftedItemInfo.id, craftedItemInfo.name, craftedItemInfo.type, 1);
        
        if (player.stats) {
            player.stats.itemsCrafted = (player.stats.itemsCrafted || 0) + 1;
        }

        await player.save();

        return { 
            success: true,
            message: `✅ تم صنع **${craftedItemInfo.name}** بنجاح!\n- تم خصم **${cost}** نشاط.`,
            item: craftedItemInfo 
        };
    }
    
    // ===================================
    // 🛠️ دالة عرض الفرن (Furnace Display)
    // ===================================

    showFurnaceRecipes(player, showFullList = false) {
        const allFurnaceRecipes = this._getRecipesByType('FURNACE');
        
        // 💡 تطبيق الفلترة
        const furnaceRecipes = allFurnaceRecipes.filter(recipe => this._shouldShowRecipe(player, recipe, showFullList));

        let message = `╔═════════ 🔥  وصفات الفرن والتعدين ═════════╗\n`;
        
        const isFurnaceBuilt = player.getItemQuantity('furnace') > 0;

        if (!isFurnaceBuilt) {
            const buildRecipe = this.RECIPES['furnace'];
            message += `\n❌ الفرن غير مبني!`;
            message += `\n  للبناء: اصنع **${this.ITEMS['furnace']?.name || 'الفرن'}** من قائمة الصناعة العادية.`;
            message += `\n  المواد: ${buildRecipe.materials['stone']} حجر و ${buildRecipe.materials['wood']} خشب.`;
            message += `\n╚═══════════════════════════════════════╝`;
            return { message };
        }
        
        message += `║       🔥 الوقود المطلوب: 1 خشب لكل عملية          ║\n`;
        message += `╚═══════════════════════════════════════╝\n`;
        
        const cooking = furnaceRecipes.filter(r => this.ITEMS[r.id]?.type === 'food');
        const smelting = furnaceRecipes.filter(r => this.ITEMS[r.id]?.type === 'bar');
        
        let foundRecipes = false;

        // 1. السبائك
        if (smelting.length > 0) {
            foundRecipes = true;
            message += this._formatRecipes(smelting, player, '🪙 السبائك والتعدين');
        }
        
        // 2. الطبخ
        if (cooking.length > 0) {
            foundRecipes = true;
            message += this._formatRecipes(cooking, player, '🍲 الطبخ والأكل');
        }

        if (!foundRecipes) {
            message += `\n❌ لا توجد وصفات متاحة لك حالياً. اجمع المزيد من الخامات/المكونات!\n`;
        }

        message += `\n═══════════════════════════════════════\n`;
        message += `💡 للطهي/التعدين: استخدم أمر "اطهو [اسم العنصر]"\n`;
        if (!showFullList && allFurnaceRecipes.length > furnaceRecipes.length) {
            message += `💡 لعرض القائمة الكاملة (غير المتاحة حالياً): "فرن كاملة"\n`;
        }
        
        return { message };
    }
    
    /**
     * 🛠️ دالة عرض القائمة الرئيسية (طاولة الصناعة) - يتم استدعاؤها بواسطة "صناعة" / "وصفات"
     */
    showAvailableRecipes(player, showFullList = false) {
        const allTableRecipes = this._getRecipesByType('TABLE');
        
        // 💡 تطبيق الفلترة
        const tableRecipes = allTableRecipes.filter(recipe => this._shouldShowRecipe(player, recipe, showFullList));
        
        let message = `╔═════════ 🔨  طاولة الصناعة (عادي) ═════════╗\n`;
        message += `║       📝 الوصفات المتاحة: (${tableRecipes.length} / ${allTableRecipes.length})           ║\n`;
        message += `╚═══════════════════════════════════════╝\n`;
        
        const categorized = {};
        tableRecipes.forEach(r => {
             const type = this.ITEMS[r.id]?.type || 'other';
             if (!categorized[type]) categorized[type] = [];
             categorized[type].push(r);
        });
        
        const typeOrder = ['tool_station', 'weapon', 'tool', 'armor', 'accessory', 'potion', 'other'];
        
        let foundRecipes = false;
        
        typeOrder.forEach(typeKey => {
            const recipesList = categorized[typeKey] || [];
            if (recipesList.length > 0) {
                foundRecipes = true;
                const typeName = {
                    'tool_station': '⚙️ محطات العمل (مثل الفرن)',
                    'weapon': '⚔️ الأسلحة', 'tool': '⛏️ الأدوات', 'armor': '🛡️ الدروع', 
                    'accessory': '💍 الإكسسوارات', 'potion': '🧪 البوشنات', 'other': '📦 مواد أخرى/متنوعة'
                }[typeKey];
                
                message += this._formatRecipes(recipesList, player, typeName);
            }
        });

        if (!foundRecipes) {
            message += `\n❌ لا توجد وصفات صناعة متاحة لك حالياً. اجمع المزيد من المواد!\n`;
        }

        message += `\n═══════════════════════════════════════\n`;
        message += `💡 للتصنيع: استخدم أمر "اصنع [اسم العنصر]"\n`;
        message += `💡 للطبخ/التعدين: استخدم أمر "فرن" أو "اطهو [اسم العنصر]"\n`;
        if (!showFullList && allTableRecipes.length > tableRecipes.length) {
             message += `💡 لعرض القائمة الكاملة (غير المتاحة حالياً): "صناعة كاملة"\n`;
        }
        
        return { message };
    }
                            }
