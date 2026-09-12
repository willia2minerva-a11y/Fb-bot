// core/commands/InfoCommands.js
import { BaseCommand } from './BaseCommand.js';
import { locations } from '../../data/locations.js';
import { items } from '../../data/items.js';
import { resources } from '../../data/resources.js';
import Player from '../Player.js';

export class InfoCommands extends BaseCommand {
    getCommands() {
        return {
            'حالتي': this.handleStatus.bind(this),
            'حالة': this.handleStatus.bind(this),
            'توب': this.handleTopPlayers.bind(this),
            'افضل': this.handleTopPlayers.bind(this),
            'لاعبين': this.handleShowPlayers.bind(this),
            'بروفايلي': this.handleProfile.bind(this),
            'بروفايل': this.handleProfile.bind(this),
            'بطاقتي': this.handleProfile.bind(this),
            'بطاقة': this.handleProfile.bind(this),
            'حقيبتي': this.handleInventory.bind(this),
            'حقيبة': this.handleInventory.bind(this),
            'جرد': this.handleInventory.bind(this),
            'مخزن': this.handleInventory.bind(this),
            'معداتي': this.handleEquipment.bind(this),
            'رمي': this.handleDiscard.bind(this)
        };
    }

    _translateItemName(itemId) {
        if (!itemId || itemId === 'null' || itemId === 'undefined') return 'لا يوجد';
        if (resources[itemId]?.name) return resources[itemId].name;
        if (items[itemId]?.name) return items[itemId].name;
        return itemId;
    }

    _getLocationName(locationId) {
        if (!locationId) return 'الغابة';
        return locations[locationId]?.name || locationId;
    }

    _getRank(level) {
        if (level >= 90) return 'SS';
        if (level >= 75) return 'S';
        if (level >= 60) return 'A';
        if (level >= 45) return 'B';
        if (level >= 30) return 'C';
        if (level >= 15) return 'D';
        return 'E';
    }

    async handleStatus(player) {
        if (!player.isApproved()) {
            let msg = `📊 حالتك\n\n`;

            if (player.isPending()) {
                msg += `⏳ حالة الحساب: قيد الانتظار\n`;
                msg += `🆔 المعرف: ${player.playerId || player.userId}\n`;
                msg += `💡 أرسل المعرف للأدمن\n\n`;
            } else if (player.isApprovedButNotCompleted()) {
                msg += `✅ تمت الموافقة - يحتاج إكمال\n`;
                msg += `👤 الاسم: ${player.name}\n`;

                if (!player.gender) {
                    msg += `⚧️ الجنس: لم يتم الاختيار\n`;
                    msg += `💡 اكتب "ذكر" أو "أنثى"\n\n`;
                } else if (player.registrationStatus === 'name_pending') {
                    msg += `⚧️ الجنس: ${player.gender === 'male' ? 'ذكر 👦' : 'أنثى 👧'}\n`;
                    msg += `📛 الاسم: لم يتم الاختيار\n`;
                    msg += `💡 اكتب "اسمي [الاسم]"\n\n`;
                }
            }

            msg += `📋 الأوامر المسموحة:\n`;
            if (player.isPending()) {
                msg += `• بدء\n• معرفي\n• مساعدة`;
            } else {
                msg += `• ذكر / أنثى\n• اسمي [الاسم]`;
            }

            return msg;
        }

        try {
            const actualStamina = player.getActualStamina ? player.getActualStamina() : player.stamina;
            const locationName = this._getLocationName(player.currentLocation);

            return `👤 ملف اللاعب: ${player.name}

📜 معلومات أساسية
• المعرف: ${player.playerId || player.userId}
• المستوى: ${player.level}
• الرانك: ${this._getRank(player.level)}
• الرصيد: ${player.gold} ريو
• الموقع: ${locationName}

💪 الإحصائيات
• الصحة: ${Math.floor(player.health)}/${player.maxHealth}
• المانا: ${Math.floor(player.mana)}/${player.maxMana}
• النشاط: ${Math.floor(actualStamina)}/${player.maxStamina}

⚔️ القتال والمعدات
• الهجوم: ${player.getAttackDamage(global.itemsData)}
• الدفاع: ${player.getDefense(global.itemsData)}
• السلاح: ${this._translateItemName(player.equipment?.weapon)}
• الدرع: ${this._translateItemName(player.equipment?.armor)}
• الإكسسوار: ${this._translateItemName(player.equipment?.accessory)}
• الأداة: ${this._translateItemName(player.equipment?.tool)}

📈 الخبرة
• التقدم: ${player.expProgress}% (${player.experience}/${player.requiredExp})`;

        } catch (error) {
            console.error('Error in handleStatus:', error);
            return `❌ حدث خطأ في عرض حالتك:\n${error.message}`;
        }
    }

    async handleProfile(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const imagePath = await this.commandHandler.cardGenerator.generateCard(player);
            return {
                type: 'image',
                path: imagePath,
                caption: `📋 بطاقة بروفايلك يا ${player.name}`
            };
        } catch (error) {
            return this.handleError(error, 'إنشاء البطاقة');
        }
    }

    async handleInventory(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (!player.inventory || player.inventory.length === 0) {
            return `🎒 حقيبة ${player.name}

الحقيبة فارغة`;
        }

        let text = `🎒 حقيبة ${player.name}\n\n`;

        if (player.equipment) {
            text += `⚔️ المجهز حالياً:\n`;
            text += `• سلاح: ${this._translateItemName(player.equipment.weapon)}\n`;
            text += `• درع: ${this._translateItemName(player.equipment.armor)}\n`;
            text += `• إكسسوار: ${this._translateItemName(player.equipment.accessory)}\n`;
            text += `• أداة: ${this._translateItemName(player.equipment.tool)}\n\n`;
        }

        text += `📦 المخزون:\n`;
        player.inventory.forEach(item => {
            const displayName = this._translateItemName(item.id) || item.name;
            text += `• ${displayName} ×${item.quantity}\n`;
        });

        return text;
    }

    async handleTopPlayers(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const topPlayers = await Player.getTopPlayers(5);

            let msg = `🏆 الأفضل (Top 5)\n\n`;
            topPlayers.forEach((p, index) => {
                const icons = ['👑', '🥇', '🥈', '🥉', '✨'];
                msg += `${icons[index]} ${index + 1}. ${p.name} - المستوى ${p.level}\n`;
            });

            const allPlayers = await Player.find({ registrationStatus: 'completed' })
                .sort({ level: -1, experience: -1, gold: -1 })
                .select('name level userId');
            const playerRank = allPlayers.findIndex(p => p.userId === player.userId) + 1;

            msg += `\n📍 ترتيبك: #${playerRank} - ${player.name}`;

            return msg;
        } catch (error) {
            return this.handleError(error, 'عرض قائمة التوب');
        }
    }

    async handleShowPlayers(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            if (!this.commandHandler.adminSystem.isAdmin(player.userId)) {
                return '❌ هذا الأمر خاص بالمدراء فقط.';
            }

            const activePlayers = await Player.find({
                registrationStatus: 'completed',
                banned: false
            })
            .sort({ level: -1 })
            .select('name level currentLocation playerId userId')
            .limit(20);

            let msg = `📋 اللاعبين النشطين (${activePlayers.length})\n\n`;

            activePlayers.forEach((p, index) => {
                const locationName = this._getLocationName(p.currentLocation);
                msg += `• ${index + 1}. ${p.name} (${p.playerId || p.userId})\n`;
                msg += `  المستوى: ${p.level}\n`;
                msg += `  الموقع: ${locationName}\n\n`;
            });

            return msg;
        } catch (error) {
            return this.handleError(error, 'عرض قائمة اللاعبين');
        }
    }

    async handleDiscard(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length === 0) {
            return '❌ اكتب اسم العنصر. مثال: رمي خشب 2';
        }

        let quantity = 1;
        let itemNameParts = [...args];

        if (!isNaN(args[args.length - 1])) {
            quantity = parseInt(args[args.length - 1]);
            itemNameParts = args.slice(0, -1);
            if (quantity <= 0) return '❌ الكمية يجب أن تكون أكبر من الصفر.';
        }

        const itemName = itemNameParts.join(' ');
        const itemId = this.commandHandler?.ARABIC_ITEM_MAP?.[itemName.toLowerCase()] || itemName.toLowerCase();

        const currentQuantity = player.getItemQuantity ? player.getItemQuantity(itemId) : 0;
        if (currentQuantity < quantity) {
            return `❌ لا تملك ${quantity} من ${this._translateItemName(itemId)}. لديك ${currentQuantity} فقط.`;
        }

        if (player.removeItem) {
            player.removeItem(itemId, quantity);
        }

        await player.save();

        return `🗑️ تم رمي ${quantity} من ${this._translateItemName(itemId)}\n📦 المتبقي: ${player.getItemQuantity(itemId)}`;
    }

    async handleEquipment(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const weapon = this._translateItemName(player.equipment?.weapon);
        const armor = this._translateItemName(player.equipment?.armor);
        const accessory = this._translateItemName(player.equipment?.accessory);
        const tool = this._translateItemName(player.equipment?.tool);

        const attack = player.getAttackDamage ? player.getAttackDamage(items) : 0;
        const defense = player.getDefense ? player.getDefense(items) : 0;

        return `⚔️ معداتك

• السلاح: ${weapon}
• الدرع: ${armor}
• الإكسسوار: ${accessory}
• الأداة: ${tool}

📊 الإحصائيات
• الهجوم: ${attack}
• الدفاع: ${defense}

💡 للتجهيز: جهز [اسم العنصر]
💡 للنزع: انزع [الخانة]`;
    }
                }
