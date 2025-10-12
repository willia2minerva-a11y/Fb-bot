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
        if (recipe.requiredTool && recipe.requiredTool !== 'crafting_table') {
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
     * يعرض الوصفات المتاحة مع مقارنتها بمخزون اللاعب (تنسيق مُحسّن)
     */
    showAvailableRecipes(player) {
        const allRecipes = Object.keys(this.RECIPES).map(id => ({ id, ...this.RECIPES[id] }));
        const availableRecipes = {};
        
        // 1. تجميع الوصفات حسب النوع
        allRecipes.forEach(recipe => {
            const itemInfo = this.ITEMS[recipe.id] || { type: 'other' };
            const type = itemInfo.type || 'other';

            if (!availableRecipes[type]) availableRecipes[type] = [];
            availableRecipes[type].push(recipe);
        });
        
        let message = `╔═══════════ 🛠️  ورشة الصناعة ═══════════╗\n`;
        message += `║       📝 الوصفات المتاحة: (${allRecipes.length})           ║\n`;
        message += `╚═══════════════════════════════════════╝\n`;
        
        const typeOrder = {
            'tool_station': '⚙️ محطات العمل', // 🆕 الفرن
            'bar': '🪙 السبائك (تعدين بالفرن)', // 🆕 تعدين
            'food': '🍲 طعام مطبوخ (فرن/طبخ)', // 🆕 طبخ
            'weapon': '⚔️ الأسلحة', 
            'tool': '⛏️ الأدوات', 
            'armor': '🛡️ الدروع', 
            'accessory': '💍 الإكسسوارات', 
            'potion': '🧪 البوشنات', 
            'other': '📦 مواد أخرى/متنوعة'
        };
        
        // 2. بناء الرسالة بترتيب الأنواع
        for (const typeKey in typeOrder) {
            const typeName = typeOrder[typeKey];
            const recipesList = availableRecipes[typeKey] || [];
            
            if (recipesList.length > 0) {
                message += `\n─── ${typeName} (${recipesList.length}) ───\n`;
                
                recipesList.forEach(recipe => {
                    const toolName = recipe.requiredTool ? (this.ITEMS[recipe.requiredTool]?.name || 'طاولة صناعة') : 'طاولة صناعة';
                    
                    message += `\n✨ ${recipe.name} (Lvl: ${recipe.requiredLevel || 1})\n`;
                    message += `  ├── الأداة المطلوبة: **${toolName}**\n`;

                    // عرض المواد المطلوبة (بما في ذلك الخشب كوقود)
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
        message += `مثال: اصنع سبيكة نحاس`;
        
        return { message };
    }
                 }
