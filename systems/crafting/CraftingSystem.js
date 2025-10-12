// systems/crafting/CraftingSystem.js
// 💡 إصلاح جوهري: الاستيراد الحقيقي لملفات البيانات من المسارات الصحيحة
import { recipes } from '../../data/recipes.js'; 
import { items } from '../../data/items.js'; 
// يمكنك استيراد Player هنا إذا لزم الأمر، لكن الأفضل تمريره كمعامل

export class CraftingSystem {
    constructor() {
        // 🛠️ استخدام البيانات المستوردة مباشرة
        this.RECIPES = recipes;
        this.ITEMS = items;
        console.log(`🔨 نظام الصناعة تم تهيئته. (وصفات: ${Object.keys(this.RECIPES).length})`);
    }

    // 🛠️ دالة التصنيع - تم تحديثها لضمان استخدام اسم عربي مُترجم وتطبيق النشاط
    async craftItem(player, itemId) {
        const recipe = this.RECIPES[itemId];

        if (!recipe) {
            const itemName = this.ITEMS[itemId] ? this.ITEMS[itemId].name : itemId;
            return { error: `❌ لا توجد وصفة معروفة لـ **${itemName}**.` };
        }
        
        // ===========================================
        // 🆕 تطبيق نظام النشاط (Stamina Check)
        // ===========================================
        const cost = 10; // تكلفة ثابتة للصناعة
        const actualStamina = player.getActualStamina();

        if (actualStamina < cost) {
            const missingStamina = cost - actualStamina;
            const recoveryRate = 5; 
            const timeToRecover = Math.ceil(missingStamina / recoveryRate);
            
            return { 
                error: `😩 **أنت متعب جداً!** الصناعة تتطلب ${cost} نشاط، لديك ${Math.floor(actualStamina)} فقط.\n⏳ ستستعيد النشاط الكافي في حوالي ${timeToRecover} دقيقة.` 
            };
        }
        
        // 1. التحقق من المستوى المطلوب
        if (player.level < (recipe.requiredLevel || 1)) {
            return { error: `❌ تحتاج إلى المستوى ${recipe.requiredLevel || 1} لصنع **${recipe.name}**.` };
        }
        
        // 2. التحقق من متطلبات محطة العمل (الفرن أو غيره)
        let missingTool = false;
        let isToolStationCraft = false; // لتحديد ما إذا كنا نصنع محطة عمل (Tool Station)
        
        if (this.ITEMS[itemId]?.type === 'tool_station') {
            isToolStationCraft = true;
        }

        if (!isToolStationCraft && recipe.requiredTool && recipe.requiredTool !== 'crafting_table') {
            // التحقق مما إذا كان اللاعب يمتلك الأداة المطلوبة (الفرن)
            if (player.getItemQuantity(recipe.requiredTool) === 0) {
                 missingTool = true;
            }
        }
        
        if (missingTool) {
             const requiredToolName = this.ITEMS[recipe.requiredTool] ? this.ITEMS[recipe.requiredTool].name : recipe.requiredTool;
             return { error: `❌ تحتاج إلى محطة عمل **${requiredToolName}** لصنع هذا العنصر. (تأكد من بنائها أولاً)` };
        }
        
        // 3. التحقق من المواد المطلوبة
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
            return { 
                error: `❌ لا تملك المواد الكافية لصنع ${recipe.name}:\n${missingMaterials.join('\n')}` 
            };
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
    
    /**
     * دالة مساعدة لتنظيم وعرض الوصفات من نوع معين
     */
    _formatRecipes(recipesList, player) {
        let text = '';
        recipesList.forEach(recipe => {
            // 🛠️ إصلاح: إظهار الأداة المطلوبة بشكل صحيح (سواء كانت محطة عمل أو أداة حفر)
            let requiredToolDisplay = '';
            if (recipe.requiredTool === 'crafting_table' || !recipe.requiredTool) {
                requiredToolDisplay = 'طاولة صناعة';
            } else {
                 requiredToolDisplay = this.ITEMS[recipe.requiredTool]?.name || recipe.requiredTool;
                 // 💡 إذا كانت محطة عمل (مثل الفرن)، نعرضها كـ "محطة"
                 if (this.ITEMS[recipe.requiredTool]?.type === 'tool_station') {
                     requiredToolDisplay = this.ITEMS[recipe.requiredTool]?.name;
                 }
            }

            text += `\n✨ ${recipe.name} (المستوى: ${recipe.requiredLevel || 1})\n`;
            text += `  ├── الأداة المطلوبة: **${requiredToolDisplay}**\n`;

            for (const materialId in recipe.materials) {
                const requiredQuantity = recipe.materials[materialId];
                const ownedQuantity = player.getItemQuantity(materialId);
                
                const materialName = this.ITEMS[materialId] ? this.ITEMS[materialId].name : materialId;
                const statusIcon = ownedQuantity >= requiredQuantity ? '✅' : '❌';
                
                // 🛠️ إصلاح التنسيق: استخدام رمز pipe (│) بدلاً من الشرطة (─)
                text += `  └── ${statusIcon} ${materialName}: ${ownedQuantity} / ${requiredQuantity}\n`;
            }
        });
        return text;
    }


    /**
     * 🛠️ دالة موحدة لفلترة الوصفات (تم تعديلها للعمل مع الفصل)
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
     * 🛠️ دالة عرض الفرن (يتم استدعاؤها بواسطة أمر "فرن")
     */
    showFurnaceRecipes(player) {
        const furnaceRecipes = this._getRecipesByType('FURNACE');
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
        
        const cooking = furnaceRecipes.filter(r => r.type === 'food');
        const smelting = furnaceRecipes.filter(r => r.type === 'bar');
        
        // 1. السبائك
        if (smelting.length > 0) {
            message += `\n─── 🪙 السبائك والتعدين (${smelting.length}) ───\n`;
            message += this._formatRecipes(smelting, player);
        }
        
        // 2. الطبخ
        if (cooking.length > 0) {
            message += `\n─── 🍲 الطبخ والأكل (${cooking.length}) ───\n`;
            message += this._formatRecipes(cooking, player);
        }

        message += `\n═══════════════════════════════════════\n💡 للتصنيع: استخدم أمر "اصنع [اسم العنصر]"`;
        return { message };
    }
    
    /**
     * 🛠️ دالة عرض القائمة الرئيسية (طاولة الصناعة) - يتم استدعاؤها بواسطة "صناعة" / "وصفات"
     */
    showAvailableRecipes(player) {
        const tableRecipes = this._getRecipesByType('TABLE');
        
        let message = `╔═════════ 🔨  طاولة الصناعة (عادي) ═════════╗\n`;
        message += `║       📝 الوصفات المتاحة: (${tableRecipes.length})           ║\n`;
        message += `╚═══════════════════════════════════════╝\n`;
        
        const categorized = {};
        tableRecipes.forEach(r => {
             const type = this.ITEMS[r.id]?.type || 'other';
             if (!categorized[type]) categorized[type] = [];
             categorized[type].push(r);
        });
        
        const typeOrder = ['tool_station', 'weapon', 'tool', 'armor', 'accessory', 'potion', 'other'];
        
        typeOrder.forEach(typeKey => {
            const recipesList = categorized[typeKey] || [];
            if (recipesList.length > 0) {
                const typeName = {
                    'tool_station': '⚙️ محطات العمل', // 🆕 الفرن
                    'weapon': '⚔️ الأسلحة', 'tool': '⛏️ الأدوات', 'armor': '🛡️ الدروع', 
                    'accessory': '💍 الإكسسوارات', 'potion': '🧪 البوشنات', 'other': '📦 مواد أخرى/متنوعة'
                }[typeKey];
                
                message += `\n─── ${typeName} (${recipesList.length}) ───\n`;
                message += this._formatRecipes(recipesList, player);
            }
        });


        message += `\n═══════════════════════════════════════\n`;
        message += `💡 للتصنيع: استخدم أمر "اصنع [اسم العنصر]"\n`;
        message += `💡 للطبخ/التعدين: استخدم أمر "فرن"\n`;
        
        return { message };
    }
    
    // ... (بقية الدوال تبقى كما هي)
            
    /**
     * يعرض وصفات طاولة الصناعة (الأسلحة والأدوات).
     */
    showCraftingTableRecipes(player) {
        const tableRecipes = this._getRecipesByType('TABLE');
        const availableRecipes = {};
        
        // تجميع الوصفات حسب النوع
        tableRecipes.forEach(recipe => {
            const itemInfo = this.ITEMS[recipe.id] || { type: 'other' };
            const type = itemInfo.type || 'other';

            if (!availableRecipes[type]) availableRecipes[type] = [];
            availableRecipes[type].push(recipe);
        });
        
        let message = `╔═════════ 🔨  طاولة الصناعة (عادي) ═════════╗\n`;
        message += `║       📝 الوصفات المتاحة: (${tableRecipes.length})           ║\n`;
        message += `╚═══════════════════════════════════════╝\n`;
        
        // ... (بقية منطق تقسيم وعرض الأنواع يبقى كما هو)
        // 💡 سنعيد استخدام جزء من المنطق السابق هنا لتقسيم العرض
        
        const typeOrder = {
            'tool_station': '⚙️ محطات العمل',
            'weapon': '⚔️ الأسلحة', 
            'tool': '⛏️ الأدوات', 
            'armor': '🛡️ الدروع', 
            'accessory': '💍 الإكسسوارات', 
            'potion': '🧪 البوشنات', 
            'other': '📦 مواد أخرى/متنوعة'
        };
        
        for (const typeKey in typeOrder) {
            const typeName = typeOrder[typeKey];
            const recipesList = availableRecipes[typeKey] || [];
            
            if (recipesList.length > 0) {
                message += `\n─── ${typeName} (${recipesList.length}) ───\n`;
                
                recipesList.forEach(recipe => {
                    const toolName = recipe.requiredTool ? (this.ITEMS[recipe.requiredTool]?.name || 'طاولة صناعة') : 'طاولة صناعة';
                    
                    message += `\n✨ ${recipe.name} (Lvl: ${recipe.requiredLevel || 1})\n`;
                    message += `  ├── الأداة المطلوبة: **${toolName}**\n`;

                    for (const materialId in recipe.materials) {
                        const requiredQuantity = recipe.materials[materialId];
                        const ownedQuantity = player.getItemQuantity(materialId);
                        
                        const materialName = this.ITEMS[materialId] ? this.ITEMS[materialId].name : materialId;
                        const statusIcon = ownedQuantity >= requiredQuantity ? '✅' : '❌';
                        
                        message += `  └── ${statusIcon} ${materialName}: ${ownedQuantity} / ${requiredQuantity}\n`;
                    }
                });
            }
        }
        
        message += `\n═══════════════════════════════════════\n`;
        message += `💡 للتصنيع: استخدم أمر "اصنع [اسم العنصر]"\n`;
        message += `مثال: اصنع قوس خشبي`;

        return { message };
    }
    
    /**
     * دالة العرض الموحدة (يتم استدعاؤها بواسطة "صناعة" / "وصفات")
     */
    showAvailableRecipes(player) {
        return this.showCraftingTableRecipes(player);
    }
    }
