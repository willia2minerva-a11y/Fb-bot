// systems/crafting/CraftingSystem.js
// 💡 إصلاح جوهري: توفير بيانات وهمية للـ RECIPES و ITEMS لضمان عمل showAvailableRecipes
const recipes = {
    'wooden_bow': { name: 'قوس خشبي', materials: { 'wood': 10, 'iron_bar': 3 }, requiredLevel: 1, type: 'weapon' },
    'silver_shortsword': { name: 'سيف فضة', materials: { 'silver_bar': 7 }, requiredLevel: 3, type: 'weapon' },
    'health_potion': { name: 'جرعة صحة', materials: { 'herb': 2, 'water': 1 }, requiredLevel: 1, type: 'potion' }
}; // Placeholder for actual import
const items = {
    'wooden_bow': { name: 'قوس خشبي', type: 'weapon' },
    'iron_bar': { name: 'سبيكة حديد', type: 'resource' },
    'silver_bar': { name: 'سبيكة فضة', type: 'resource' },
    'herb': { name: 'عشب', type: 'resource' },
    'water': { name: 'ماء', type: 'resource' },
    'health_potion': { name: 'جرعة صحة', type: 'potion' }
};   // Placeholder for actual import


export class CraftingSystem {
    constructor() {
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

        if (player.skills.crafting < (recipe.requiredSkill || 1)) {
            return { error: `❌ تحتاج إلى مستوى صناعة ${recipe.requiredSkill} لصنع هذا العنصر.` };
        }
        
        player.useStamina(cost);
        for (const materialId in requiredMaterials) {
            player.removeItem(materialId, requiredMaterials[materialId]);
        }

        const craftedItemInfo = this.ITEMS[itemId] || { id: itemId, name: recipe.name, type: 'other' };
        player.addItem(craftedItemInfo.id, craftedItemInfo.name, craftedItemInfo.type, 1); 

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
                    message += `\n✨ ${recipe.name} (Lvl: ${recipe.requiredLevel || 1})\n`;
                    message += `  ├── المواد المطلوبة:\n`;
                    
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
}
