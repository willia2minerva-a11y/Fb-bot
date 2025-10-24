// systems/furnace/FurnaceSystem.js
import { items } from '../../data/items.js';

export class FurnaceSystem {
    constructor() {
        this.furnaceRecipes = this.getFurnaceRecipes();
    }

    getFurnaceRecipes() {
        const recipes = {};
        
        // وصفات الطهو
        recipes['cooked_meat'] = {
            id: 'cooked_meat',
            name: 'لحم مطهو',
            type: 'food',
            description: 'لحم مطهو يزيد النشاط والصحة',
            recipe: { 'raw_meat': 1, 'coal': 1 },
            stats: { health: 20, stamina: 30 }
        };

        recipes['cooked_fish'] = {
            id: 'cooked_fish', 
            name: 'سمك مطهو',
            type: 'food',
            description: 'سمك مطهو يزيد النشاط',
            recipe: { 'raw_fish': 1, 'coal': 1 },
            stats: { health: 15, stamina: 25 }
        };

        recipes['bread'] = {
            id: 'bread',
            name: 'خبز',
            type: 'food',
            description: 'خبز طازج يزيد الصحة',
            recipe: { 'wheat': 2, 'coal': 1 },
            stats: { health: 25, stamina: 15 }
        };

        // وصفات الصهر
        recipes['copper_bar'] = {
            id: 'copper_bar',
            name: 'سبيكة نحاسية', 
            type: 'material',
            description: 'نحاس مصهور جاهز للصناعة',
            recipe: { 'copper_ore': 1, 'coal': 1 },
            stats: {}
        };

        recipes['iron_bar'] = {
            id: 'iron_bar',
            name: 'سبيكة حديدية',
            type: 'material',
            description: 'حديد مصهور جاهز للصناعة',
            recipe: { 'iron_ore': 1, 'coal': 1 },
            stats: {}
        };

        recipes['silver_bar'] = {
            id: 'silver_bar',
            name: 'سبيكة فضية',
            type: 'material',
            description: 'فضة مصهورة جاهزة للصناعة', 
            recipe: { 'silver_ore': 1, 'coal': 1 },
            stats: {}
        };

        recipes['gold_bar'] = {
            id: 'gold_bar',
            name: 'سبيكة ذهبية',
            type: 'material',
            description: 'ذهب مصهور جاهز للصناعة',
            recipe: { 'gold_ore': 1, 'coal': 1 },
            stats: {}
        };

        return recipes;
    }

    showRecipes(player) {
        if (!this.hasFurnace(player)) {
            return { error: '❌ تحتاج إلى فرن لرؤية وصفات الطهو والصهر.' };
        }

        let message = "🔥 **وصفات الفرن المتاحة:**\n\n";
        
        // وصفات الطهو
        message += "🍳 **الطهو:**\n";
        const foodRecipes = Object.values(this.furnaceRecipes).filter(recipe => recipe.type === 'food');
        foodRecipes.forEach(recipe => {
            message += `• **${recipe.name}**: `;
            for (const ingredient in recipe.recipe) {
                const ingredientItem = items[ingredient];
                if (ingredientItem) {
                    message += `${ingredientItem.name} (${recipe.recipe[ingredient]}) `;
                }
            }
            message += "\n";
        });

        // وصفات الصهر
        message += "\n⚒️ **الصهر:**\n";
        const smeltRecipes = Object.values(this.furnaceRecipes).filter(recipe => recipe.type === 'material');
        smeltRecipes.forEach(recipe => {
            message += `• **${recipe.name}**: `;
            for (const ingredient in recipe.recipe) {
                const ingredientItem = items[ingredient];
                if (ingredientItem) {
                    message += `${ingredientItem.name} (${recipe.recipe[ingredient]}) `;
                }
            }
            message += "\n";
        });

        message += "\n💡 **استخدم:**\n• `طهو [اسم] [كمية]` - لطهو الطعام\n• `صهر [اسم] [كمية]` - لصهر الخامات";
        return { message };
    }

    hasFurnace(player) {
        return player.getItemQuantity && player.getItemQuantity('furnace') > 0;
    }

    async processRecipe(player, itemName, quantity = 1, actionType) {
        if (!this.hasFurnace(player)) {
            return { error: '❌ تحتاج إلى فرن لاستخدام هذه الوصفة.' };
        }

        // البحث عن الوصفة
        const recipe = Object.values(this.furnaceRecipes).find(r => 
            r.name === itemName || r.id === itemName
        );
        
        if (!recipe) {
            return { error: `❌ لا توجد وصفة للعنصر "${itemName}" في الفرن.` };
        }

        // التحقق من المكونات
        for (const ingredient in recipe.recipe) {
            const required = recipe.recipe[ingredient] * quantity;
            if (player.getItemQuantity(ingredient) < required) {
                const ingredientName = items[ingredient]?.name || ingredient;
                return { error: `❌ تحتاج إلى ${required} ${ingredientName} ل${actionType} ${quantity} ${recipe.name}.` };
            }
        }

        // استهلاك المكونات
        for (const ingredient in recipe.recipe) {
            const required = recipe.recipe[ingredient] * quantity;
            player.removeItem(ingredient, required);
        }

        // إعطاء المنتج
        player.addItem(recipe.id, quantity);

        const actionText = actionType === 'طهو' ? 'طهو' : 'صهر';
        return { 
            message: `✅ تم ${actionText} ${quantity} ${recipe.name} بنجاح!` 
        };
    }

    async cook(player, itemName, quantity = 1) {
        return this.processRecipe(player, itemName, quantity, 'طهو');
    }

    async smelt(player, itemName, quantity = 1) {
        return this.processRecipe(player, itemName, quantity, 'صهر');
    }
            }
