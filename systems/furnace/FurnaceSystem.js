// systems/furnace/FurnaceSystem.js
import { items } from '../../data/items.js';

export class FurnaceSystem {
    constructor() {
        this.furnaceRecipes = this.getFurnaceRecipes();
    }

    getFurnaceRecipes() {
        const recipes = {};
        for (const itemId in items) {
            if (items[itemId].furnace && items[itemId].recipe) {
                recipes[itemId] = items[itemId];
            }
        }
        return recipes;
    }

    showRecipes(player) {
        if (!player.hasItem('furnace')) {
            return { error: '❌ تحتاج إلى فرن لرؤية الوصفات.' };
        }

        let message = "🔥 **وصفات الفرن المتاحة:**\n\n";
        
        for (const itemId in this.furnaceRecipes) {
            const item = this.furnaceRecipes[itemId];
            message += `• **${item.name}**: `;
            
            for (const ingredient in item.recipe) {
                const ingredientItem = items[ingredient];
                if (ingredientItem) {
                    message += `${ingredientItem.name} (${item.recipe[ingredient]}) `;
                }
            }
            message += "\n";
        }

        message += "\n💡 **استخدم:** طهو [اسم] [كمية] أو صهر [اسم] [كمية]";
        return { message };
    }

    async processRecipe(player, itemName, quantity = 1, actionType) {
        // التحقق من وجود الفرن
        if (!player.hasItem('furnace')) {
            return { error: '❌ تحتاج إلى فرن لاستخدام هذه الوصفة.' };
        }

        // البحث عن الوصفة
        const itemId = Object.keys(items).find(id => 
            items[id].name === itemName || id === itemName
        );
        
        const recipe = this.furnaceRecipes[itemId];
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
        player.addItem(itemId, quantity);

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
