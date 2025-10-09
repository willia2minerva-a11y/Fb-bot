// systems/crafting/CraftingSystem.js
import { craftingRecipes } from '../../data/crafting.js';
import { items } from '../../data/items.js';

export class CraftingSystem {
    constructor() {
        try {
            this.RECIPES = craftingRecipes || {};
            this.ITEMS = items || {};
            console.log(`🔨 نظام الصناعة تم تهيئته. تم تحميل ${Object.keys(this.RECIPES).length} وصفة و ${Object.keys(this.ITEMS).length} عنصر.`);
            
            // 🔥 DEBUG: طباعة جميع الوصفات للتأكد
            console.log('📋 الوصفات المتاحة:', Object.keys(this.RECIPES));
        } catch (error) {
            console.error('❌ فشل في تحميل نظام الصناعة:', error);
            this.RECIPES = {};
            this.ITEMS = {};
        }
    }

    // 🛠️ دالة التصنيع
    async craftItem(player, itemId) {
        try {
            console.log(`🔍 محاولة صنع العنصر: ${itemId}`);
            
            const recipe = this.RECIPES[itemId];

            if (!recipe) {
                const itemName = this.ITEMS[itemId] ? this.ITEMS[itemId].name : itemId;
                return { error: `❌ لا توجد وصفة معروفة لـ **${itemName}**.` };
            }
            
            // تطبيق نظام النشاط
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
            
            // التحقق من المواد المطلوبة
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

            // التحقق من مستوى الصناعة
            if (player.skills.crafting < (recipe.requiredSkill || 1)) {
                return { error: `❌ تحتاج إلى مستوى صناعة ${recipe.requiredSkill} لصنع هذا العنصر.` };
            }
            
            // استهلاك المواد والنشاط
            player.useStamina(cost);
            for (const material of requiredMaterials) {
                player.removeItem(material.id, material.quantity);
            }

            // إضافة العنصر المصنوع
            const craftedItemInfo = this.ITEMS[itemId] || { id: itemId, name: recipe.name, type: 'other' };
            player.addItem(craftedItemInfo.id, craftedItemInfo.name, craftedItemInfo.type, 1);

            // حفظ وتحديث الإحصائيات
            player.stats.itemsCrafted += 1;

            return { 
                success: true,
                message: `✅ تم صنع **${craftedItemInfo.name}** بنجاح!\n- تم خصم ${cost} نشاط.`,
                item: craftedItemInfo 
            };
        } catch (error) {
            console.error('❌ خطأ في دالة craftItem:', error);
            return { error: `❌ حدث خطأ غير متوقع في عملية الصناعة: ${error.message}` };
        }
    }
    
    /**
     * يعرض الوصفات المتاحة مع مقارنتها بمخزون اللاعب
     */
    showAvailableRecipes(player) {
        try {
            console.log(`🔍 [CraftingSystem] عرض الوصفات للاعب ${player.name}`);
            console.log(`🔍 [CraftingSystem] عدد الوصفات في النظام: ${Object.keys(this.RECIPES).length}`);
            
            const allRecipes = Object.keys(this.RECIPES).map(id => ({ 
                id, 
                ...this.RECIPES[id],
                itemInfo: this.ITEMS[id] || { type: 'other' }
            }));
            
            console.log(`🔍 [CraftingSystem] إجمالي الوصفات المحولة: ${allRecipes.length}`);
            
            if (allRecipes.length === 0) {
                console.log('❌ [CraftingSystem] لا توجد وصفات في النظام');
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
            let hasRecipes = false;
            for (const typeKey in typeOrder) {
                const typeName = typeOrder[typeKey];
                const recipesList = availableRecipes[typeKey] || [];
                
                if (recipesList.length > 0) {
                    hasRecipes = true;
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
            
            if (!hasRecipes) {
                message += `\n📭 لا توجد وصفات متاحة حاليًا.\n`;
            }
            
            message += `\n═══════════════════════════════════════\n`;
            message += `💡 للتصنيع: استخدم أمر "اصنع [اسم العنصر]"\n`;
            message += `مثال: اصنع قوس خشبي`;
            
            console.log(`✅ [CraftingSystem] تم إنشاء رسالة الوصفات بنجاح`);
            
            return { 
                message: message,
                recipes: allRecipes 
            };
        } catch (error) {
            console.error('❌ خطأ في دالة showAvailableRecipes:', error);
            return {
                message: `❌ حدث خطأ في عرض الوصفات: ${error.message}`,
                recipes: []
            };
        }
    }
                    }
