// systems/crafting/CraftingSystem.js
import { craftingRecipes } from '../../data/crafting.js';
import { items } from '../../data/items.js';

export class CraftingSystem {
    constructor() {
        this.RECIPES = craftingRecipes; // 🔥 تصحيح: استخدام craftingRecipes بدلاً من recipes
        this.ITEMS = items;
        console.log(`🔨 نظام الصناعة تم تهيئته. تم تحميل ${Object.keys(this.RECIPES).length} وصفة و ${Object.keys(this.ITEMS).length} عنصر.`);
    }

    // 🛠️ دالة التصنيع - تم تحديثها لتعمل مع التنسيق الجديد
    async craftItem(player, itemId) {
        const recipe = this.RECIPES[itemId];

        if (!recipe) {
            const itemName = this.ITEMS[itemId] ? this.ITEMS[itemId].name : itemId;
            return { error: `❌ لا توجد وصفة معروفة لـ **${itemName}**.` };
        }
        
        // ===========================================
        // 🆕 تطبيق نظام النشاط (Stamina Check)
        // ===========================================
        const cost = 10;
        const actualStamina = player.getActualStamina();

        if (actualStamina < cost) {
            const missingStamina = cost - actualStamina;
            const recoveryRate = 5; 
            const timeToRecover = Math.ceil(missingStamina / recoveryRate);
            
            return { 
                error: `😩 **أنت متعب جداً!** الصناعة تتطلب ${cost} نشاط، لديك ${Math.floor(actualStamina)} فقط.\n⏳ ستستعيد النشاط الكافي في حوالي ${timeToRecover} دقيقة.` 
            };
        }
        
        // 1. التحقق من المواد المطلوبة (التنسيق الجديد)
        const requiredMaterials = recipe.materials;
        let missingMaterials = [];

        for (const material of requiredMaterials) {
            const materialId = material.id;
            const requiredQuantity = material.quantity;
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

        // 2. التحقق من مستوى الصناعة
        if (player.skills.crafting < (recipe.requiredSkill || 1)) {
            return { error: `❌ تحتاج إلى مستوى صناعة ${recipe.requiredSkill} لصنع هذا العنصر.` };
        }
        
        // 3. استهلاك المواد والنشاط
        player.useStamina(cost);
        for (const material of requiredMaterials) {
            player.removeItem(material.id, material.quantity);
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
     * يعرض الوصفات المتاحة مع مقارنتها بمخزون اللاعب
     */
    showAvailableRecipes(player) {
        const allRecipes = Object.keys(this.RECIPES).map(id => ({ 
            id, 
            ...this.RECIPES[id],
            itemInfo: this.ITEMS[id] || { type: 'other' }
        }));
        
        console.log(`🔍 عرض الوصفات للاعب ${player.name}. إجمالي الوصفات: ${allRecipes.length}`);
        
        if (allRecipes.length === 0) {
            return {
                message: `🛠️ **لا توجد وصفات صناعة متاحة حالياً**\n\nسيتم إضافة وصفات قريباً!`,
                recipes: []
            };
        }

        // تجميع الوصفات حسب النوع
        const availableRecipes = {};
        
        allRecipes.forEach(recipe => {
            const type = recipe.itemInfo.type || 'other';
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
            'other': '📦 مواد أخرى'
        };
        
        // بناء الرسالة بترتيب الأنواع
        for (const typeKey in typeOrder) {
            const typeName = typeOrder[typeKey];
            const recipesList = availableRecipes[typeKey] || [];
            
            if (recipesList.length > 0) {
                message += `\n─── ${typeName} (${recipesList.length}) ───\n`;
                
                recipesList.forEach(recipe => {
                    message += `\n✨ ${recipe.name}\n`;
                    message += `  📍 المستوى المطلوب: ${recipe.requiredLevel || 1}\n`;
                    message += `  🧩 المواد المطلوبة:\n`;
                    
                    recipe.materials.forEach(material => {
                        const materialId = material.id;
                        const requiredQuantity = material.quantity;
                        const ownedQuantity = player.getItemQuantity(materialId);
                        
                        const materialName = this.ITEMS[materialId] ? this.ITEMS[materialId].name : materialId;
                        const statusIcon = ownedQuantity >= requiredQuantity ? '✅' : '❌';
                        
                        message += `     ${statusIcon} ${materialName}: ${ownedQuantity}/${requiredQuantity}\n`;
                    });
                });
            }
        }
        
        message += `\n═══════════════════════════════════════\n`;
        message += `💡 للتصنيع: استخدم أمر "اصنع [اسم العنصر]"\n`;
        message += `مثال: اصنع قوس خشبي`;
        
        return { 
            message: message,
            recipes: allRecipes 
        };
    }
            }
