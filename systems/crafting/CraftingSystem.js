// systems/crafting/CraftingSystem.js
// 💡 يجب التأكد من وجود ملف recipes.js و items.js في المسار الصحيح
const recipes = {}; // افتراضي
const items = {};   // افتراضي
// import { recipes } from '../../data/recipes.js'; 
// import { items } from '../../data/items.js'; 
// import Player from '../../core/Player.js';

export class CraftingSystem {
    constructor() {
        this.recipes = recipes;
        this.items = items;
        console.log('🔨 نظام الصناعة تم تهيئته.');
    }

    // 🛠️ دالة التصنيع - تم تحديثها لضمان استخدام اسم عربي مُترجم وتطبيق النشاط
    async craftItem(player, itemId) {
        const recipe = this.recipes[itemId];

        if (!recipe) {
            const itemName = this.items[itemId] ? this.items[itemId].name : itemId;
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
                const materialName = this.items[materialId] ? this.items[materialId].name : materialId;
                missingMaterials.push(`❌ ${materialName}: ${ownedQuantity}/${requiredQuantity}`);
            }
        }

        if (missingMaterials.length > 0) {
            return { 
                error: `❌ **لا تملك المواد الكافية لصنع ${recipe.name}:**\n${missingMaterials.join('\n')}` 
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
        const craftedItemInfo = this.items[itemId];
        player.addItem(craftedItemInfo.id, craftedItemInfo.name, craftedItemInfo.type, 1); 

        // 5. حفظ وتحديث الإحصائيات
        player.stats.itemsCrafted += 1;
        // 💡 يجب استدعاء player.save() في CommandHandler بعد نجاح العملية
        // لكننا نتركها هنا إذا كان نظامك يستخدمها (يجب أن يتم الحفظ خارج هذه الدالة في العادة)
        // await player.save(); 

        return { 
            success: true,
            message: `✅ **تم صنع ${craftedItemInfo.name} بنجاح!**\n- تم خصم ${cost} نشاط.`,
            item: craftedItemInfo 
        };
    }
    
    // 🛠️ دالة عرض الوصفات - تم تحديثها لتقسيم القائمة
    showAvailableRecipes(player) {
        const availableRecipes = {};
        const allRecipes = Object.keys(this.recipes).map(id => ({ id, ...this.recipes[id] }));

        // تصفية وتجميع الوصفات حسب النوع
        allRecipes.forEach(recipe => {
            const itemInfo = this.items[recipe.id];
            if (!itemInfo) return; 
            
            if ((recipe.requiredSkill || 1) > (player.skills.crafting || 1)) return;
            
            const type = itemInfo.type || 'other';
            if (!availableRecipes[type]) {
                availableRecipes[type] = [];
            }
            availableRecipes[type].push(recipe);
        });
        
        let message = `🛠️ **ورشة الصناعة - الوصفات (${allRecipes.length})**\n`;
        
        const typeOrder = {
            'weapon': '⚔️ الأسلحة', 
            'tool': '⛏️ الأدوات', 
            'armor': '🛡️ الدروع', 
            'accessory': '💍 الإكسسوارات', 
            'potion': '🧪 البوشنات', 
            'other': '📦 مواد أخرى/متنوعة'
        };
        
        // بناء الرسالة بترتيب الأنواع
        for (const typeKey in typeOrder) {
            const typeName = typeOrder[typeKey];
            const recipesList = availableRecipes[typeKey] || [];
            
            if (recipesList.length > 0) {
                message += `\n**--- ${typeName} (${recipesList.length}) ---**\n`;
                
                recipesList.forEach(recipe => {
                    message += `• **${recipe.name}** (ID: ${recipe.id})\n`;
                    
                    for (const materialId in recipe.materials) {
                        const requiredQuantity = recipe.materials[materialId];
                        const ownedQuantity = player.getItemQuantity(materialId);
                        
                        const materialName = this.items[materialId] ? this.items[materialId].name : materialId;
                        const statusIcon = ownedQuantity >= requiredQuantity ? '✅' : '❌';
                        
                        message += `  ${statusIcon} ${materialName}: ${ownedQuantity}/${requiredQuantity}\n`;
                    }
                });
            }
        }
        
        message += `\n💡 **للتصنيع:** استخدم أمر "اصنع [اسم العنصر بالعربي]"\n`;
        message += `مثال: اصنع قوس خشبي`;
        
        return { message };
    }
}
