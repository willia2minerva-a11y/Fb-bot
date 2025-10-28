// core/commands/commands/CraftingCommands.js
import { BaseCommand } from './BaseCommand.js';
import { items } from '../../../data/items.js';

export class CraftingCommands extends BaseCommand {
    getCommands() {
        return {
            'وصفات': this.handleShowRecipes.bind(this),
            'صناعة': this.handleShowRecipes.bind(this),
            'اصنع': this.handleCraft.bind(this),
            'صنع': this.handleCraft.bind(this),
            'جهز': this.handleEquip.bind(this),
            'تجهيز': this.handleEquip.bind(this),
            'البس': this.handleEquip.bind(this),
            'انزع': this.handleUnequip.bind(this),
            'خلع': this.handleUnequip.bind(this),
            'فرن': this.handleFurnace.bind(this),
            'طهو': this.handleCook.bind(this),
            'صهر': this.handleSmelt.bind(this),
            'حرق': this.handleCook.bind(this)
        };
    }

    async handleShowRecipes(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const craftingSystem = await this.getSystem('crafting');
        if (!craftingSystem) {
            return '❌ نظام الصناعة غير متوفر حالياً.';
        }
        const result = craftingSystem.showAvailableRecipes(player);
        return result.message;
    }

    async handleCraft(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length === 0) {
            return this.handleShowRecipes(player);
        }

        let quantity = 1;
        let itemNameParts = [...args];

        if (!isNaN(args[args.length - 1])) {
            quantity = parseInt(args[args.length - 1]);
            itemNameParts = args.slice(0, args.length - 1);

            if (quantity <= 0) {
                return '❌ الكمية يجب أن تكون أكبر من الصفر.';
            }
            if (quantity > 100) {
                return '❌ الحد الأقصى للصناعة هو 100 مرة.';
            }
        }

        const rawItemName = itemNameParts.join(' ');
        if (!rawItemName) {
            return '❌ يرجى تحديد العنصر المراد صنعه. مثال: اصنع سيف_حديد 2';
        }

        const itemId = this.ARABIC_ITEM_MAP[rawItemName.toLowerCase()] || rawItemName.toLowerCase();

        const craftingSystem = await this.getSystem('crafting');
        if (!craftingSystem) {
            return '❌ نظام الصناعة غير متوفر حالياً.';
        }

        const result = await craftingSystem.craftItem(player, itemId, quantity);

        if (result.error) {
            return result.error;
        }

        return result.message;
    }

    async handleEquip(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const itemName = args.join(' ');
        if (!itemName) {
            return `❌ يرجى تحديد العنصر المراد تجهيزه.\n💡 مثال: جهز سيف خشبي`;
        }

        const itemId = this.ARABIC_ITEM_MAP[itemName.toLowerCase()] || itemName.toLowerCase();

        if (!itemId || !items[itemId]) {
            return `❌ لم يتم العثور على العنصر "${itemName}" في مخزونك أو غير معروف.`;
        }

        const itemInfo = items[itemId];

        const validEquipTypes = ['weapon', 'armor', 'accessory', 'tool'];
        const equipType = itemInfo.type;

        if (!validEquipTypes.includes(equipType)) {
            return `❌ العنصر "${itemInfo.name}" من نوع ${equipType} لا يمكن تجهيزه.`;
        }

        const currentQuantity = player.getItemQuantity ? player.getItemQuantity(itemId) : (player.inventory?.[itemId] || 0);
        if (currentQuantity === 0) {
            return `❌ لا تملك العنصر "${itemInfo.name}" في مخزونك.`;
        }

        const result = player.equipItem ? player.equipItem(itemId, equipType, items) : { error: '❌ نظام التجهيز غير متوفر' };

        if (result.error) {
            return result.error;
        }

        await player.save();

        let statsMessage = '';
        if (itemInfo.stats) {
            statsMessage = `\n📊 **الإحصائيات المضافة:**`;
            if (itemInfo.stats.damage) statsMessage += `\n• 🔥 ضرر: +${itemInfo.stats.damage}`;
            if (itemInfo.stats.defense) statsMessage += `\n• 🛡️ دفاع: +${itemInfo.stats.defense}`;
            if (itemInfo.stats.maxHealth) statsMessage += `\n• ❤️ صحة قصوى: +${itemInfo.stats.maxHealth}`;
            if (itemInfo.stats.maxMana) statsMessage += `\n• ⚡ مانا قصوى: +${itemInfo.stats.maxMana}`;
            if (itemInfo.stats.critChance) statsMessage += `\n• 🎯 فرصة حرجة: +${itemInfo.stats.critChance}%`;
            if (itemInfo.stats.healthRegen) statsMessage += `\n• 💚 تجديد صحة: +${itemInfo.stats.healthRegen}`;
        }

        return `✅ تم تجهيز **${itemInfo.name}** في خانة ${equipType} بنجاح.${statsMessage}`;
    }

    async handleUnequip(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const slotName = args.join(' ').toLowerCase();
        if (!slotName) {
            return `❌ يرجى تحديد الخانة المراد نزعها. (سلاح، درع، إكسسوار، أداة)`;
        }

        const slotTranslations = {
            'سلاح': 'weapon',
            'سيف': 'weapon',
            'درع': 'armor',
            'ترس': 'armor',
            'اكسسوار': 'accessory',
            'إكسسوار': 'accessory',
            'خاتم': 'accessory',
            'قلادة': 'accessory',
            'اداة': 'tool',
            'أداة': 'tool',
            'فأس': 'tool',
            'منجل': 'tool',
            'معول': 'tool'
        };

        const englishSlot = slotTranslations[slotName] || slotName;

        const validSlots = ['weapon', 'armor', 'accessory', 'tool'];
        if (!validSlots.includes(englishSlot)) {
            return `❌ الخانة "${slotName}" غير صالحة. الخانات المتاحة: سلاح, درع, اكسسوار, اداة`;
        }

        const result = player.unequipItem ? player.unequipItem(englishSlot, items) : { error: '❌ نظام نزع المعدات غير متوفر' };

        if (result.error) {
            return result.error;
        }

        await player.save();
        return result.message;
    }

    async handleFurnace(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const furnaceSystem = await this.getSystem('furnace');
        if (!furnaceSystem) {
            return '❌ نظام الفرن غير متوفر حالياً.';
        }

        const result = furnaceSystem.showRecipes(player);
        if (result.error) {
            return result.error;
        }
        return result.message;
    }

    async handleCook(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length === 0) {
            return '❌ يرجى تحديد العنصر المراد طهوه. مثال: طهو لحم 2';
        }

        let quantity = 1;
        let itemNameParts = [...args];

        if (!isNaN(args[args.length - 1])) {
            quantity = parseInt(args[args.length - 1]);
            itemNameParts = args.slice(0, args.length - 1);

            if (quantity <= 0) {
                return '❌ الكمية يجب أن تكون أكبر من الصفر.';
            }
            if (quantity > 50) {
                return '❌ الحد الأقصى للطهو هو 50 مرة.';
            }
        }

        const itemName = itemNameParts.join(' ');

        const furnaceSystem = await this.getSystem('furnace');
        if (!furnaceSystem) {
            return '❌ نظام الفرن غير متوفر حالياً.';
        }

        const result = await furnaceSystem.cook(player, itemName, quantity);
        if (result.error) {
            return result.error;
        }

        await player.save();
        return result.message;
    }

    async handleSmelt(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length === 0) {
            return '❌ يرجى تحديد الخام المراد صهره. مثال: صهر خام_حديد 3';
        }

        let quantity = 1;
        let itemNameParts = [...args];

        if (!isNaN(args[args.length - 1])) {
            quantity = parseInt(args[args.length - 1]);
            itemNameParts = args.slice(0, args.length - 1);

            if (quantity <= 0) {
                return '❌ الكمية يجب أن تكون أكبر من الصفر.';
            }
            if (quantity > 50) {
                return '❌ الحد الأقصى للصهر هو 50 مرة.';
            }
        }

        const itemName = itemNameParts.join(' ');

        const furnaceSystem = await this.getSystem('furnace');
        if (!furnaceSystem) {
            return '❌ نظام الفرن غير متوفر حالياً.';
        }

        const result = await furnaceSystem.smelt(player, itemName, quantity);
        if (result.error) {
            return result.error;
        }

        await player.save();
        return result.message;
    }
}
