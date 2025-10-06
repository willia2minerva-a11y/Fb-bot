// systems/crafting/CraftingSystem.js
// 💡 يجب التأكد من وجود ملف recipes.js و items.js في المسار الصحيح
const recipes = {}; // placeholder
const items = {};   // placeholder
// import { recipes } from '../../data/recipes.js'; 
// import { items } from '../../data/items.js'; 


export class CraftingSystem {
    constructor() {
        this.RECIPES = recipes;
        this.ITEMS = items;
        console.log('🔨 نظام الصناعة تم تهيئته.');
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
        
        // 1. التحقق من المواد المطلوبة
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

        // 2. التحقق من مستوى الصناعة (اختياري)
        if (player.skills.crafting < (recipe.requiredSkill || 1)) {
            return { error: `❌ تحتاج إلى مستوى صناعة ${recipe.requiredSkill} لصنع هذا العنصر.` };
        }
        
        // 3. استهلاك المواد والنشاط
        player.useStamina(cost);
        for (const materialId in requiredMaterials) {
            player.removeItem(materialId, requiredMaterials[materialId]);
        }

        // 4. إضافة العنصر المصنوع
        const craftedItemInfo = this.ITEMS[itemId] || { id: itemId, name: recipe.name, type: 'other' };
        player.addItem(craftedItemInfo.id, craftedItemInfo.name, craftedItemInfo.type, 1); 

        // 5. حفظ وتحديث الإحصائيات
        player.stats.itemsCrafted += 1;

        return { 
            success: true,
            message: `✅ تم صنع **${craftedItemInfo.name}** بنجاح!\n- تم خصم ${cost} نشاط.`,
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
                    // إزالة **
                    message += `\n✨ ${recipe.name} (Lvl: ${recipe.requiredLevel || 1})\n`;
                    message += `  ├── المواد المطلوبة:\n`;
                    
                    for (const materialId in recipe.materials) {
                        const requiredQuantity = recipe.materials[materialId];
                        const ownedQuantity = player.getItemQuantity(materialId);
                        
                        const materialName = this.ITEMS[materialId] ? this.ITEMS[materialId].name : materialId;
                        const statusIcon = ownedQuantity >= requiredQuantity ? '✅' : '❌';
                        
                        // إزالة **
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
    }
