// core/commands/commands/InfoCommands.js
import { BaseCommand } from '../BaseCommand.js';
import { locations } from '../../../../data/locations.js';
import { items } from '../../../../data/items.js';

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

    async handleStatus(player) {
        let statusMessage = `📊 **حالتك الحالية:**\n\n`;
        
        if (player.isPending()) {
            statusMessage += `⏳ **حالة الحساب:** قيد الانتظار للموافقة\n`;
            statusMessage += `🆔 **المعرف:** ${player.userId}\n`;
            statusMessage += `💡 **الإجراء المطلوب:** أرسل المعرف للمدير\n\n`;
        } 
        else if (player.isApprovedButNotCompleted()) {
            statusMessage += `✅ **حالة الحساب:** تمت الموافقة - يحتاج إكمال\n`;
            statusMessage += `👤 **الاسم الحالي:** ${player.name}\n`;
            
            if (!player.gender) {
                statusMessage += `⚧️ **الجنس:** لم يتم الاختيار\n`;
                statusMessage += `💡 استخدم "ذكر" أو "أنثى" لاختيار الجنس\n\n`;
            } else if (player.registrationStatus === 'name_pending') {
                statusMessage += `⚧️ **الجنس:** ${player.gender === 'male' ? 'ذكر 👦' : 'أنثى 👧'}\n`;
                statusMessage += `📛 **الاسم الإنجليزي:** لم يتم الاختيار\n`;
                statusMessage += `💡 استخدم "اسمي [الاسم]" لاختيار اسم إنجليزي\n\n`;
            }
        }
        else {
            statusMessage += `✅ **حالة الحساب:** مكتمل ونشط\n`;
            statusMessage += `👤 **الاسم:** ${player.name}\n`;
            statusMessage += `⚧️ **الجنس:** ${player.gender === 'male' ? 'ذكر 👦' : 'أنثى 👧'}\n`;
            statusMessage += `✨ **المستوى:** ${player.level}\n`;
            statusMessage += `❤️ **الصحة:** ${player.health || 100}/${player.maxHealth || 100}\n`;
            statusMessage += `💰 **الذهب:** ${player.gold}\n`;
            statusMessage += `📍 **الموقع:** ${locations[player.currentLocation]?.name || player.currentLocation}\n\n`;
        }
        
        statusMessage += `📋 **الأوامر المتاحة:**\n`;
        if (!player.isApproved()) {
            statusMessage += `• "بدء" - متابعة التسجيل\n`;
            statusMessage += `• "معرفي" - عرض المعرف للمدير\n`;
            statusMessage += `• "مساعدة" - عرض الأوامر المتاحة\n`;
        } else if (!player.isRegistrationCompleted()) {
            statusMessage += `• "ذكر/أنثى" - اختيار الجنس\n`;
            statusMessage += `• "اسمي [الاسم]" - اختيار اسم\n`;
        } else {
            statusMessage += `• اكتب "مساعدة" لرؤية جميع الأوامر\n`;
        }
        
        return statusMessage;
    }

    async handleProfile(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const imagePath = await this.commandHandler.cardGenerator.generateCard(player);
            return {
                type: 'image',
                path: imagePath,
                caption: `📋 بطاقة بروفايلك يا ${player.name}!`
            };
        } catch (error) {
            return this.handleError(error, 'إنشاء البطاقة');
        }
    }

    async handleInventory(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const profileSystem = await this.getSystem('profile');
        return profileSystem ? profileSystem.getPlayerInventory(player) : '❌ نظام البروفايل غير متوفر.';
    }

    async handleTopPlayers(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const topPlayers = await Player.getTopPlayers(5);
            
            let topMessage = `╔═══════════ 🏆  قائمة الشجعان (Top 5) ═══════════╗\n`;
            topMessage += `\`\`\`prolog\n`;
            
            topPlayers.forEach((p, index) => {
                const rankIcon = index === 0 ? '👑' : index === 1 ? '🥇' : index === 2 ? '🥈' : index === 3 ? '🥉' : '✨';
                topMessage += `${rankIcon} #${index + 1}: ${p.name} (ID: ${p.playerId || p.userId}) - المستوى ${p.level}\n`;
            });
            
            topMessage += `\`\`\`\n`;
            
            const allPlayers = await Player.find({ registrationStatus: 'completed' }).sort({ level: -1, experience: -1, gold: -1 }).select('name level userId playerId');
            const playerRank = allPlayers.findIndex(p => p.userId === player.userId) + 1;
            
            topMessage += `📍 ترتيبك الحالي: **#${playerRank}** - **${player.name}** (المستوى ${player.level})\n`;

            return topMessage;

        } catch (error) {
            return this.handleError(error, 'عرض قائمة التوب');
        }
    }

    async handleShowPlayers(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            if (!this.adminSystem.isAdmin(player.userId)) {
                return '❌ هذا الأمر خاص بالمدراء فقط.';
            }
            
            const activePlayers = await Player.find({ 
                registrationStatus: 'completed',
                banned: false 
            })
            .sort({ level: -1, gold: -1 })
            .select('name level gold currentLocation playerId userId')
            .limit(20);

            let playerList = `╔═════════ 🧑‍💻 لوحة تحكم المدير ═════════╗\n`;
            playerList += `║     📋 قائمة اللاعبين النشطين (${activePlayers.length})       ║\n`;
            playerList += `╚═══════════════════════════════════╝\n`;
            playerList += `\`\`\`markdown\n`;
            playerList += `| ID | المستوى | الاسم | الذهب | الموقع | المعرف\n`;
            playerList += `|----|---------|--------|-------|--------|--------\n`;
            
            activePlayers.forEach((p, index) => {
                const locationName = locations[p.currentLocation]?.name || p.currentLocation;
                const shortUserId = p.userId.length > 8 ? p.userId.substring(0, 8) + '...' : p.userId;
                playerList += `| ${p.playerId || 'N/A'} | L${p.level} | ${p.name} | 💰${p.gold} | ${locationName} | ${shortUserId}\n`;
            });
            playerList += `\`\`\`\n`;
            
            playerList += `💡 **استخدم:**\n`;
            playerList += `• \`اعطاء_ذهب P476346 100\` - لإعطاء غولد\n`;
            playerList += `• \`اعطاء_مورد P476346 خشب 10\` - لإعطاء موارد\n`;

            return playerList;

        } catch (error) {
            return this.handleError(error, 'عرض قائمة اللاعبين');
        }
    }

    async handleDiscard(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length === 0) {
            return '❌ يرجى تحديد العنصر المراد رميه. مثال: رمي خشب 2';
        }

        let quantity = 1;
        let itemNameParts = [...args];

        if (!isNaN(args[args.length - 1])) {
            quantity = parseInt(args[args.length - 1]);
            itemNameParts = args.slice(0, args.length - 1);
        
            if (quantity <= 0) return '❌ الكمية يجب أن تكون أكبر من الصفر.';
        }

        const itemName = itemNameParts.join(' ');
        const itemId = this.ARABIC_ITEM_MAP[itemName.toLowerCase()] || itemName.toLowerCase();

        if (!itemId || !items[itemId]) {
            return `❌ العنصر "${itemName}" غير موجود في مخزونك.`;
        }

        const currentQuantity = player.getItemQuantity ? player.getItemQuantity(itemId) : (player.inventory?.[itemId] || 0);
        if (currentQuantity < quantity) {
            return `❌ لا تملك ${quantity} من ${items[itemId].name}. لديك ${currentQuantity} فقط.`;
        }

        if (player.removeItem) {
            player.removeItem(itemId, quantity);
        } else {
            player.inventory = player.inventory || {};
            player.inventory[itemId] = (player.inventory[itemId] || 0) - quantity;
            if (player.inventory[itemId] <= 0) {
                delete player.inventory[itemId];
            }
        }

        await player.save();

        return `🗑️ **تم رمي ${quantity} من ${items[itemId].name}**\n` +
               `📦 **المتبقي:** ${player.getItemQuantity ? player.getItemQuantity(itemId) : (player.inventory?.[itemId] || 0)}`;
    }

    async handleEquipment(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const itemsData = items;

        const weapon = player.equipment?.weapon ? itemsData[player.equipment.weapon]?.name : 'لا يوجد';
        const armor = player.equipment?.armor ? itemsData[player.equipment.armor]?.name : 'لا يوجد';
        const accessory = player.equipment?.accessory ? itemsData[player.equipment.accessory]?.name : 'لا يوجد';
        const tool = player.equipment?.tool ? itemsData[player.equipment.tool]?.name : 'لا يوجد';

        const attack = player.getAttackDamage ? player.getAttackDamage(itemsData) : 0;
        const defense = player.getDefense ? player.getDefense(itemsData) : 0;
        const totalStats = player.getTotalStats ? player.getTotalStats(itemsData) : { maxHealth: 100, maxMana: 50, maxStamina: 100, critChance: 5, healthRegen: 1 };

        let equipmentMessage = `⚔️ **المعدات المجهزة حالياً:**\n\n`;
        equipmentMessage += `• ⚔️ السلاح: ${weapon}\n`;
        equipmentMessage += `• 🛡️ الدرع: ${armor}\n`;
        equipmentMessage += `• 💍 الإكسسوار: ${accessory}\n`;
        equipmentMessage += `• ⛏️ الأداة: ${tool}\n\n`;

        equipmentMessage += `📊 **الإحصائيات الحالية:**\n`;
        equipmentMessage += `• 🔥 قوة الهجوم: ${attack}\n`;
        equipmentMessage += `• 🛡️ قوة الدفاع: ${defense}\n`;
        equipmentMessage += `• ❤️ الصحة القصوى: ${totalStats.maxHealth}\n`;
        equipmentMessage += `• ⚡ المانا القصوى: ${totalStats.maxMana}\n`;
        equipmentMessage += `• 🏃 النشاط القصوى: ${Math.floor(totalStats.maxStamina)}\n`;
        equipmentMessage += `• 🎯 فرصة حرجة: ${totalStats.critChance}%\n`;
        equipmentMessage += `• 💚 تجديد الصحة: ${totalStats.healthRegen}\n\n`;

        equipmentMessage += `💡 **الأوامر المتاحة:**\n`;
        equipmentMessage += `• \`جهز [اسم العنصر]\` - لتجهيز عنصر من المخزون\n`;
        equipmentMessage += `• \`انزع [اسم الخانة]\` - لنزع عنصر مجهز\n`;
        equipmentMessage += `• الخانات: سلاح, درع, اكسسوار, اداة`;

        return equipmentMessage;
    }
}