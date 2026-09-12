// systems/admin/AdminSystem.js
import Player from '../../core/Player.js';
import BannedPlayer from '../../core/models/BannedPlayer.js';
import { items } from '../../data/items.js';
import { AutoResponseSystem } from '../autoResponse/AutoResponseSystem.js';
import { PermissionSystem } from '../permissions/PermissionSystem.js';

export class AdminSystem {
    constructor() {
        this.adminCommands = new Map();
        this.autoResponseSystem = new AutoResponseSystem();
        this.permissionSystem = new PermissionSystem();
        this.commandHandler = null;
        console.log('👑 نظام المدير (مغارة ريو) تم تهيئته');
    }

    setCommandHandler(handler) {
        this.commandHandler = handler;
    }

    isAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
        const rootAdmins = [
            ADMIN_PSID,
            ADMIN_TELEGRAM_ID ? `tg_${ADMIN_TELEGRAM_ID}` : null
        ].filter(Boolean);
        return rootAdmins.includes(userId);
    }

    async isAdminAsync(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
        const rootAdmins = [
            ADMIN_PSID,
            ADMIN_TELEGRAM_ID ? `tg_${ADMIN_TELEGRAM_ID}` : null
        ].filter(Boolean);
        if (rootAdmins.includes(userId)) return true;
        try {
            const player = await Player.findOne({ userId });
            if (!player) return false;
            return player.getActivePermissions().length > 0;
        } catch (error) {
            return false;
        }
    }

    // ✅ فحص إذا كان الأدمن الرئيسي
    isRootAdmin(userId) {
        return this.permissionSystem.isRootAdmin(userId);
    }

    _translateRarity(rarity) {
        const map = {
            'common': 'عادي', 'uncommon': 'غير عادي', 'rare': 'نادر',
            'epic': 'ملحمي', 'legendary': 'أسطوري', 'mythic': 'خرافي',
            'divine': 'إلهي', 'special': 'خاص'
        };
        return map[rarity] || rarity || 'عادي';
    }

    _parseDuration(input) {
        if (!input) return null;
        const str = input.toString().trim().toLowerCase();
        const numMatch = str.match(/^(\d+)$/);
        if (numMatch) return parseInt(numMatch[1]) * 60 * 60 * 1000;
        const match = str.match(/^(\d+)(د|س|ي|m|h|d)$/);
        if (!match) return null;
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 'د': case 'm': return value * 60 * 1000;
            case 'س': case 'h': return value * 60 * 60 * 1000;
            case 'ي': case 'd': return value * 24 * 60 * 60 * 1000;
        }
        return null;
    }

    _formatDuration(ms) {
        if (ms < 60 * 1000) return `${Math.floor(ms / 1000)} ثانية`;
        if (ms < 60 * 60 * 1000) return `${Math.floor(ms / (60 * 1000))} دقيقة`;
        if (ms < 24 * 60 * 60 * 1000) return `${Math.floor(ms / (60 * 60 * 1000))} ساعة`;
        return `${Math.floor(ms / (24 * 60 * 60 * 1000))} يوم`;
    }

    async setupAdminPlayer(userId, userName) {
        try {
            let player = await Player.findOne({ userId });
            if (!player) player = await Player.createNew(userId, userName);
            
            if (!player.playerId) {
                const newAdminId = await this.permissionSystem.getNextAdminId();
                player.playerId = newAdminId;
            }

            player.registrationStatus = 'completed';
            player.gender = 'male';
            player.name = userName || 'المدير';
            player.level = 100;
            player.gold = 500;
            player.health = 1000;
            player.maxHealth = 1000;
            player.mana = 500;
            player.maxMana = 500;
            player.stamina = 100;
            player.maxStamina = 100;
            await player.save();
            return player;
        } catch (error) {
            console.error('❌ خطأ في إعداد المدير:', error);
            throw error;
        }
    }

    getAdminCommands() {
        return {
            'مدير': 'مدير',
            'موافقة_لاعب': 'موافقة لاعب',
            'تغيير_اسم': 'تغيير اسم',
            'تغيير_جنس': 'تغيير جنس',
            'حظر_لاعب': 'حظر لاعب',
            'نزع_ادمن': 'نزع أدمن',
            'قائمة_المحظورين': 'قائمة المحظورين',
            'حذف_محظور': 'حذف محظور',
            'اعادة_بيانات': 'اعادة بيانات',
            'اضف_رد': 'إضافة رد',
            'ازل_رد': 'إزالة رد',
            'عرض_الردود': 'عرض الردود',
            'عرض_اسلحة': 'عرض الأسلحة',
            'عرض_وحوش': 'عرض الوحوش',
            'عرض_مواقع': 'عرض المواقع',
            'عرض_موارد': 'عرض الموارد',
            'عرض_لاعبين': 'عرض اللاعبين',
            'اضف_سلاح': 'إضافة سلاح',
            'حذف_سلاح': 'حذف سلاح',
            'اضف_وحش': 'إضافة وحش',
            'حذف_وحش': 'حذف وحش',
            'اضف_مورد': 'إضافة مورد',
            'حذف_مورد': 'حذف مورد',
            'اضف_مهمة': 'إضافة مهمة',
            'حذف_مهمة': 'حذف مهمة',
            'قائمة_المهام': 'قائمة المهام',
            'اعطاء_ادمن': 'إعطاء ادمن',
            'ازالة_ادمن': 'إزالة ادمن',
            'اعطاء_صلاحية': 'إعطاء صلاحية',
            'ازالة_صلاحية': 'إزالة صلاحية',
            'قائمة_الادمن': 'قائمة الادمن',
            'صلاحيات': 'صلاحيات',
            'سجن': 'سجن',
            'اطلاق': 'إطلاق',
            'قائمة_المسجونين': 'قائمة المسجونين',
            'اعطاء_ذهب': 'إعطاء رصيد',
            'اعطاء_مورد': 'إعطاء مورد',
            'زيادة_صحة': 'زيادة صحة',
            'زيادة_مانا': 'زيادة مانا'
        };
    }

    getAdminHelp() {
        return `👑 أوامر المدير - مغارة ريو

🛠️ الإدارة
• موافقة_لاعب [ID]
• تغيير_اسم [ID] [الاسم]
• تغيير_جنس [ID] [ذكر/أنثى]
• اعادة_بيانات [ID]

🚫 الحظر
• حظر_لاعب [ID] [صحيح/خطأ]
• قائمة_المحظورين [صفحة]
• حذف_محظور [ID]

🔐 الصلاحيات
• اعطاء_ادمن [ID] [مدة]
• اعطاء_صلاحية [ID] [النوع] [مدة]
• ازالة_صلاحية [ID] [النوع]
• نزع_ادمن [ID] - إزالة كل الصلاحيات
• ازالة_ادمن [ID] - نفس الشيء
• قائمة_الادمن
• صلاحيات [ID]

🎁 المنح
• اعطاء_ذهب [ID] [الكمية]
• اعطاء_مورد [ID] [العنصر] [الكمية]
• زيادة_صحة [ID] [الكمية]
• زيادة_مانا [ID] [الكمية]

🤖 الردود
• اضف_رد [الكلمة] || [الرد]
• ازل_رد [الكلمة]
• عرض_الردود

📋 العرض
• عرض_لاعبين [صفحة]
• عرض_اسلحة [ص] | عرض_وحوش [ص]
• عرض_مواقع [ص] | عرض_موارد [ص]

🚔 السجن
• سجن [ID] [المدة]
• اطلاق [ID]
• قائمة_المسجونين

➕ الإضافة والحذف
• اضف_سلاح [اسم] [قوة] [مستوى]
• حذف_سلاح [اسم]
• اضف_وحش [اسم] [صحة] [ضرر] [مستوى]
• حذف_وحش [اسم]
• اضف_مورد [اسم] [ندرة] [موقع]
• حذف_مورد [اسم]
• اضف_مهمة | حذف_مهمة | قائمة_المهام

💡 الأوامر تقبل أي شكل:
موافقة_لاعب | موافقة لاعب | موافقةلاعب`;
    }

    _getCommandMap() {
        return {
            'مدير': 'مدير',
            'موافقةلاعب': 'موافقة_لاعب',
            'اعادةبيانات': 'اعادة_بيانات',
            'تغييراسم': 'تغيير_اسم',
            'تغييرجنس': 'تغيير_جنس',
            'حظرلاعب': 'حظر_لاعب',
            'نزعادمن': 'نزع_ادمن',
            'قائمةالمحظورين': 'قائمة_المحظورين',
            'حذفمحظور': 'حذف_محظور',
            'اعطاءذهب': 'اعطاء_ذهب',
            'اعطاءمورد': 'اعطاء_مورد',
            'زيادةصحة': 'زيادة_صحة',
            'زيادةمانا': 'زيادة_مانا',
            'اضفرد': 'اضف_رد',
            'ازلرد': 'ازل_رد',
            'عرضالردود': 'عرض_الردود',
            'عرضاسلحة': 'عرض_اسلحة',
            'عرضوحوش': 'عرض_وحوش',
            'عرضمواقع': 'عرض_مواقع',
            'عرضموارد': 'عرض_موارد',
            'عرضلاعبين': 'عرض_لاعبين',
            'اضفمهمة': 'اضف_مهمة',
            'حذفمهمة': 'حذف_مهمة',
            'قائمةالمهام': 'قائمة_المهام',
            'اضفسلاح': 'اضف_سلاح',
            'حذفسلاح': 'حذف_سلاح',
            'اضفوحش': 'اضف_وحش',
            'حذفوحش': 'حذف_وحش',
            'اضفمورد': 'اضف_مورد',
            'حذفمورد': 'حذف_مورد',
            'اعطاءادمن': 'اعطاء_ادمن',
            'ازالةادمن': 'ازالة_ادمن',
            'اعطاءصلاحية': 'اعطاء_صلاحية',
            'ازالةصلاحية': 'ازالة_صلاحية',
            'قائمةالادمن': 'قائمة_الادمن',
            'صلاحيات': 'صلاحيات',
            'سجن': 'سجن',
            'اطلاق': 'اطلاق',
            'قائمةالمسجونين': 'قائمة_المسجونين'
        };
    }

    async handleAdminCommand(command, args, senderId, player, itemMap) {
        const normalizedCommand = command.replace(/[_\s]/g, '');
        const commandMap = this._getCommandMap();
        const canonicalCommand = commandMap[normalizedCommand] || command;

        const findTargetPlayer = async (id) => {
            if (!id) return null;
            const cleanId = id.trim();
            let target = await Player.findOne({ userId: cleanId });
            if (target) return target;
            target = await Player.findOne({ playerId: cleanId });
            if (target) return target;
            target = await Player.findOne({ playerId: cleanId.toUpperCase() });
            if (target) return target;
            target = await Player.findOne({ name: new RegExp(`^${cleanId}$`, 'i') });
            if (target) return target;
            target = await Player.findOne({ name: new RegExp(cleanId, 'i') });
            return target;
        };

        switch (canonicalCommand) {
            case 'مدير': return this.getAdminHelp();
            case 'موافقة_لاعب': return await this.handleApprovePlayer(args, senderId);
            case 'اعادة_بيانات': return await this.handleResetPlayer(args, findTargetPlayer);
            case 'تغيير_اسم': return await this.handleSetPlayerName(args, findTargetPlayer);
            case 'تغيير_جنس': return await this.handleSetPlayerGender(args, findTargetPlayer);
            case 'حظر_لاعب': return await this.handleBanPlayer(args, findTargetPlayer, senderId);
            case 'نزع_ادمن': return await this.handleRevokeAdmin(args, senderId);
            case 'قائمة_المحظورين': return await this.handleBannedList(args);
            case 'حذف_محظور': return await this.handleRemoveBanned(args, senderId);
            case 'اعطاء_ذهب': return await this.handleGiveGold(args, findTargetPlayer);
            case 'اعطاء_مورد': return await this.handleGiveItem(args, findTargetPlayer, itemMap);
            case 'زيادة_صحة': return await this.handleIncreaseStat(args, 'maxHealth', findTargetPlayer);
            case 'زيادة_مانا': return await this.handleIncreaseStat(args, 'maxMana', findTargetPlayer);
            case 'اضف_رد': return await this.handleAddAutoResponse(args, senderId);
            case 'ازل_رد': return await this.handleRemoveAutoResponse(args, senderId);
            case 'عرض_الردود': return await this.handleShowAutoResponses(args, senderId);
            case 'عرض_اسلحة': return await this.handleShowItemsByType(args, 'weapon');
            case 'عرض_وحوش': return await this.handleShowMonsters(args);
            case 'عرض_مواقع': return await this.handleShowLocations(args);
            case 'عرض_موارد': return await this.handleShowResources(args);
            case 'عرض_لاعبين': return await this.handleShowPlayers(args);
            case 'اضف_سلاح': return await this.handleAddWeapon(args);
            case 'حذف_سلاح': return await this.handleDeleteWeapon(args);
            case 'اضف_وحش': return await this.handleAddMonster(args);
            case 'حذف_وحش': return await this.handleDeleteMonster(args);
            case 'اضف_مورد': return await this.handleAddResource(args);
            case 'حذف_مورد': return await this.handleDeleteResource(args);
            case 'اضف_مهمة': return await this.handleAddTaskCommand(args, senderId);
            case 'حذف_مهمة': return await this.handleRemoveTaskCommand(args, senderId);
            case 'قائمة_المهام': return await this.handleListTasksCommand(args, senderId);
            case 'اعطاء_ادمن': return await this.handleGrantAdmin(args, senderId);
            case 'ازالة_ادمن': return await this.handleRevokeAdmin(args, senderId);
            case 'اعطاء_صلاحية': return await this.handleGrantPermission(args, senderId);
            case 'ازالة_صلاحية': return await this.handleRevokePermission(args, senderId);
            case 'قائمة_الادمن': return await this.handleListAdmins(senderId);
            case 'صلاحيات': return await this.handleShowPermissions(args, senderId);
            case 'سجن': return await this.handleJail(args, senderId);
            case 'اطلاق': return await this.handleRelease(args, senderId);
            case 'قائمة_المسجونين': return await this.handleJailList(senderId);
            default: return null;
        }
    }

    // ===================================
    // الموافقة على اللاعبين
    // ===================================

    async handleApprovePlayer(args, senderId) {
        if (args.length === 0) {
            const pendingPlayers = await Player.find({
                registrationStatus: 'pending',
                banned: { $ne: true }
            }).select('userId name playerId createdAt').sort({ createdAt: 1 });

            if (pendingPlayers.length === 0) {
                return '✅ لا يوجد لاعبين بانتظار الموافقة.';
            }

            let message = `⏳ اللاعبين المنتظرين (${pendingPlayers.length}):\n\n`;
            pendingPlayers.forEach((p, index) => {
                message += `${index + 1}. ${p.name}\n`;
                message += `   🆔 ${p.playerId || 'N/A'}\n`;
                message += `   📱 ${p.userId}\n\n`;
            });
            message += `💡 للموافقة: موافقة_لاعب [ID]`;
            return message;
        }

        const targetId = args[0];

        let target = await Player.findOne({ userId: targetId });
        if (!target) target = await Player.findOne({ playerId: targetId });
        if (!target) target = await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;
        if (target.banned) return '❌ هذا اللاعب محظور!';
        if (target.registrationStatus === 'completed') return '❌ هذا اللاعب مسجل بالفعل.';

        target.registrationStatus = 'approved';
        target.approvedAt = new Date();
        target.approvedBy = senderId;
        await target.save();

        return `✅ تمت الموافقة على اللاعب ${target.name}!\n\n🆔 ID: ${target.playerId}\n📱 userId: ${target.userId}\n\n📋 الخطوة التالية للاعب:\n• اكتب "بدء"\n• اختر الجنس\n• اختر الاسم`;
    }

    // ===================================
    // الحظر الجديد (نقل إلى BannedPlayers)
    // ===================================

    async handleBanPlayer(args, findTargetPlayer, senderId) {
        const targetId = args[0];
        const banStatusRaw = args[1] ? args[1].toLowerCase() : 'true';

        if (!targetId) return '❌ الاستخدام: حظر_لاعب [ID] [صحيح/خطأ]';

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        // ✅ منع حظر الأدمن الرئيسي
        if (this.isRootAdmin(target.userId)) {
            return '❌ لا يمكن حظر الأدمن الرئيسي!';
        }

        const isBanning = banStatusRaw === 'true' || banStatusRaw === 'صحيح' || banStatusRaw === 'حظر';

        // ✅ إذا كان الحظر
        if (isBanning) {
            // فحص أنه ليس محظوراً بالفعل
            const alreadyBanned = await BannedPlayer.findOne({ userId: target.userId });
            if (alreadyBanned) {
                return `❌ اللاعب ${target.name} محظور بالفعل.`;
            }

            // حفظ معلومات في BannedPlayers
            const bannedPlayer = new BannedPlayer({
                userId: target.userId,
                name: target.name,
                playerId: target.playerId,
                platform: target.platform,
                bannedBy: senderId,
                bannedAt: new Date(),
                reason: 'حظر إداري',
                level: target.level,
                gold: target.gold,
                wasAdmin: target.getActivePermissions().length > 0,
                adminPermissions: target.adminPermissions || []
            });
            await bannedPlayer.save();

            // حذف اللاعب من players
            const oldName = target.name;
            const oldId = target.playerId;
            await target.deleteOne();

            return `🚫 تم حظر اللاعب نهائياً

👤 الاسم: ${oldName}
🆔 ID: ${oldId}
📱 userId: ${target.userId}

📋 الإجراءات المتخذة:
• نقل بياناته إلى قائمة المحظورين
• حذف حسابه بالكامل
• الاسم "${oldName}" أصبح متاحاً
• ID "${oldId}" أصبح متاحاً

💡 للعرض: قائمة_المحظورين`;
        }
        // رفع الحظر
        else {
            const bannedRecord = await BannedPlayer.findOne({ userId: target.userId });
            if (!bannedRecord) {
                return `❌ اللاعب ${target.name} غير محظور.`;
            }

            // حذف من قائمة المحظورين
            await BannedPlayer.deleteOne({ userId: target.userId });

            return `✅ تم رفع الحظر عن اللاعب

👤 الاسم السابق: ${bannedRecord.name}
📱 userId: ${bannedRecord.userId}

⚠️ ملاحظة: اللاعب يحتاج للتسجيل من جديد
حيث أن بياناته السابقة تم حذفها عند الحظر.`;
        }
    }

    // ===================================
    // قائمة المحظورين
    // ===================================

    async handleBannedList(args) {
        const page = parseInt(args[0]) || 1;

        const result = await BannedPlayer.getBannedList(page);

        if (result.error) return result.error;

        let msg = `🚫 قائمة المحظورين - صفحة ${result.page}/${result.totalPages}\n`;
        msg += `📊 الإجمالي: ${result.total}\n\n`;

        result.banned.forEach((b, index) => {
            const rank = (result.page - 1) * 20 + index + 1;
            const date = new Date(b.bannedAt).toLocaleDateString('ar-EG');
            const icon = b.wasAdmin ? '👑🚫' : '🚫';

            msg += `${rank}. ${icon} ${b.name}\n`;
            msg += `   🆔 ${b.playerId || 'N/A'}\n`;
            msg += `   📱 ${b.userId}\n`;
            msg += `   📅 ${date}\n`;
            msg += `   📝 ${b.reason}\n\n`;
        });

        msg += `💡 للتنقل: قائمة_المحظورين [رقم]`;
        msg += `\n💡 لحذف محظور: حذف_محظور [ID]`;

        return msg;
    }

    // ===================================
    // حذف محظور (رفع الحظر نهائياً)
    // ===================================

    async handleRemoveBanned(args, senderId) {
        if (args.length === 0) return '❌ الاستخدام: حذف_محظور [userId/name/playerId]';

        const identifier = args.join(' ');

        const result = await BannedPlayer.removeBan(identifier);

        if (result.error) return result.error;

        return `✅ تم حذف المحظور من القائمة

👤 الاسم: ${result.info.name}
🆔 ID: ${result.info.playerId || 'N/A'}
📱 userId: ${result.info.userId}

💡 يمكن للاعب التسجيل من جديد الآن.`;
    }

    // ===================================
    // نزع الأدمن (إزالة صلاحيات + ID جديد)
    // ===================================

    async handleRevokeAdmin(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const senderHasFull = sender && sender.hasPermission('full_admin');

        if (!isRoot && !senderHasFull) {
            return '❌ ليس لديك صلاحية.';
        }

        if (args.length < 1) {
            return `❌ الاستخدام: نزع_ادمن [ID]

💡 يزيل صلاحيات الأدمن ويعطيه ID لاعب عادي.
⚠️ ملاحظة: الأدمن الرئيسي (من ENV) لا يمكن نزعه.`;
        }

        const targetId = args[0];
        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        // ✅ منع نزع الأدمن الرئيسي
        if (this.isRootAdmin(target.userId)) {
            return '❌ لا يمكن نزع صلاحيات الأدمن الرئيسي!';
        }

        // ✅ منع نزع نفسك
        if (target.userId === senderId) {
            return '❌ لا يمكنك نزع صلاحياتك!';
        }

        const result = await this.permissionSystem.revokeAllPermissions(target.userId);
        return result.error || result.message;
    }

    // ===================================
    // باقي الدوال
    // ===================================

    async handleResetPlayer(args, findTargetPlayer) {
        const targetId = args[0];
        if (!targetId) return '❌ الاستخدام: اعادة_بيانات [ID]';

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        if (this.isRootAdmin(target.userId)) {
            return '❌ لا يمكن إعادة تعيين الأدمن الرئيسي!';
        }

        const oldName = target.name;
        const oldId = target.playerId;
        await target.deleteOne();

        return `🗑️ تم مسح بيانات ${oldName}\n\n🆔 ID السابق: ${oldId}\n💡 اللاعب يجب أن يسجل من جديد.`;
    }

    async handleSetPlayerName(args, findTargetPlayer) {
        const targetId = args[0];
        const newName = args.slice(1).join(' ');

        if (!targetId || !newName) return '❌ الاستخدام: تغيير_اسم [ID] [الاسم]';

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const existing = await Player.findOne({ name: newName, userId: { $ne: target.userId } });
        if (existing) return `❌ الاسم ${newName} مستخدم من لاعب آخر.`;

        const oldName = target.name;
        target.name = newName;
        await target.save();

        return `✅ تم تغيير الاسم\n\n👤 من: ${oldName}\n👤 إلى: ${newName}`;
    }

    async handleSetPlayerGender(args, findTargetPlayer) {
        const targetId = args[0];
        const newGender = args[1] ? args[1].toLowerCase() : null;

        if (!targetId || !['ذكر', 'أنثى', 'male', 'female'].includes(newGender)) {
            return '❌ الاستخدام: تغيير_جنس [ID] [ذكر/أنثى]';
        }

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const genderCode = (newGender === 'ذكر' || newGender === 'male') ? 'male' : 'female';
        target.gender = genderCode;
        await target.save();

        return `✅ تم تغيير جنس ${target.name} إلى ${genderCode === 'male' ? 'ذكر' : 'أنثى'}.`;
    }

    // ===================================
    // المنح
    // ===================================

    async handleGiveGold(args, findTargetPlayer) {
        const targetId = args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount) || amount <= 0) {
            return '❌ الاستخدام: اعطاء_ذهب [ID] [الكمية]';
        }

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        target.addGold(amount);
        await target.save();

        return `✅ تم إعطاء ${target.name}\n\n💰 المبلغ: ${amount} ريو\n💎 الرصيد الجديد: ${target.gold} ريو`;
    }

    async handleGiveItem(args, findTargetPlayer, itemMap) {
        if (args.length < 3) return '❌ الاستخدام: اعطاء_مورد [ID] [العنصر] [الكمية]';

        const targetId = args[0];
        const quantity = parseInt(args[args.length - 1], 10);
        const rawItemName = args.slice(1, args.length - 1).join(' ').toLowerCase();

        const itemId = itemMap[rawItemName] || rawItemName;
        const itemInfo = items[itemId];

        if (!itemInfo || isNaN(quantity) || quantity <= 0) {
            return '❌ العنصر غير موجود أو الكمية غير صالحة.';
        }

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        target.addItem(itemInfo.id, itemInfo.name, itemInfo.type, quantity);
        await target.save();

        return `✅ تم إضافة ${quantity} × ${itemInfo.name} لـ ${target.name}.`;
    }

    async handleIncreaseStat(args, statToChange, findTargetPlayer) {
        const targetId = args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount) || amount <= 0) {
            return `❌ الاستخدام: زيادة_${statToChange === 'maxHealth' ? 'صحة' : 'مانا'} [ID] [الكمية]`;
        }

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        if (statToChange === 'maxHealth') {
            target.maxHealth += amount;
            target.health += amount;
        } else {
            target.maxMana += amount;
            target.mana += amount;
        }

        await target.save();
        return `✅ تم زيادة ${statToChange === 'maxHealth' ? 'الصحة' : 'المانا'} لـ ${target.name} بمقدار ${amount}.`;
    }

    // ===================================
    // الردود التلقائية
    // ===================================

    async handleAddAutoResponse(args, senderId) {
        const input = args.join(' ');
        const parts = input.split('||');

        if (parts.length < 2) {
            return '❌ الاستخدام: اضف_رد [الكلمة] || [الرد]';
        }

        const keyword = parts[0].trim().toLowerCase();
        const response = parts.slice(1).join('||').trim();

        if (!keyword || !response) {
            return '❌ يجب تحديد الكلمة والرد.';
        }

        this.autoResponseSystem.addResponse(keyword, response);
        return `✅ تم إضافة رد للكلمة "${keyword}".`;
    }

    async handleRemoveAutoResponse(args, senderId) {
        const keyword = args.join(' ').toLowerCase().trim();
        if (!keyword) return '❌ الاستخدام: ازل_رد [الكلمة]';

        const removed = this.autoResponseSystem.removeResponse(keyword);
        return removed 
            ? `✅ تم حذف الرد "${keyword}".` 
            : `❌ لا يوجد رد للكلمة "${keyword}".`;
    }

    async handleShowAutoResponses(args, senderId) {
        const all = this.autoResponseSystem.getAllResponses();
        const keys = Object.keys(all);

        if (keys.length === 0) return '📝 لا توجد ردود تلقائية.';

        let msg = `🤖 الردود التلقائية (${keys.length}):\n\n`;
        for (const key of keys) {
            msg += `• ${key}\n  ${all[key]}\n\n`;
        }
        return msg;
    }

    // ===================================
    // أوامر العرض (مع ID + userId)
    // ===================================

    async handleShowItemsByType(args, type) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;
        const itemsList = Object.entries(items).filter(([id, item]) => item.type === type);
        const totalPages = Math.ceil(itemsList.length / perPage);

        if (totalPages === 0) return `❌ لا توجد عناصر من نوع ${type}`;
        if (page < 1 || page > totalPages) {
            return `❌ الصفحة ${page} غير موجودة. الإجمالي: ${totalPages}`;
        }

        const start = (page - 1) * perPage;
        const pageItems = itemsList.slice(start, start + perPage);

        let message = `📋 ${type} - صفحة ${page}/${totalPages}\n\n`;

        pageItems.forEach(([id, item]) => {
            message += `• ${item.name}\n`;
            message += `  🆔 ${id}\n`;
            message += `  📊 المستوى: ${item.level || 1}\n`;
            if (item.attack) message += `  ⚔️ الهجوم: ${item.attack}\n`;
            if (item.defense) message += `  🛡️ الدفاع: ${item.defense}\n`;
            if (item.rarity) message += `  💎 الندرة: ${this._translateRarity(item.rarity)}\n`;
            message += `\n`;
        });

        message += `📄 للتنقل: عرض_اسلحة [رقم]`;
        return message;
    }

    async handleShowMonsters(args) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;
        const { monsters } = await import('../../data/monsters.js');
        const monstersList = Object.entries(monsters);
        const totalPages = Math.ceil(monstersList.length / perPage);

        if (totalPages === 0) return '❌ لا توجد وحوش';
        if (page < 1 || page > totalPages) {
            return `❌ الصفحة ${page} غير موجودة. الإجمالي: ${totalPages}`;
        }

        const start = (page - 1) * perPage;
        const pageMonsters = monstersList.slice(start, start + perPage);

        let message = `👹 الوحوش - صفحة ${page}/${totalPages}\n\n`;

        pageMonsters.forEach(([id, monster]) => {
            message += `• ${monster.name}\n`;
            message += `  🆔 ${id}\n`;
            message += `  📊 المستوى: ${monster.level || 1}\n`;
            message += `  ❤️ الصحة: ${monster.health || monster.maxHealth || 0}\n`;
            message += `  ⚔️ الضرر: ${monster.damage || 0}\n`;
            if (monster.isBoss) message += `  👑 زعيم\n`;
            message += `\n`;
        });

        message += `📄 للتنقل: عرض_وحوش [رقم]`;
        return message;
    }

    async handleShowLocations(args) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;
        const { locations } = await import('../../data/locations.js');
        const locationsList = Object.entries(locations);
        const totalPages = Math.ceil(locationsList.length / perPage);

        if (totalPages === 0) return '❌ لا توجد مواقع';
        if (page < 1 || page > totalPages) {
            return `❌ الصفحة ${page} غير موجودة. الإجمالي: ${totalPages}`;
        }

        const start = (page - 1) * perPage;
        const pageLocations = locationsList.slice(start, start + perPage);

        let message = `📍 المواقع - صفحة ${page}/${totalPages}\n\n`;

        pageLocations.forEach(([id, location]) => {
            message += `• ${location.name || id}\n`;
            message += `  🆔 ${id}\n`;
            if (location.monsters) message += `  👹 الوحوش: ${location.monsters.length}\n`;
            if (location.resources) message += `  🌿 الموارد: ${location.resources.length}\n`;
            message += `\n`;
        });

        message += `📄 للتنقل: عرض_مواقع [رقم]`;
        return message;
    }

    async handleShowResources(args) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;
        const { resources } = await import('../../data/resources.js');
        const resourcesList = Object.entries(resources);
        const totalPages = Math.ceil(resourcesList.length / perPage);

        if (totalPages === 0) return '❌ لا توجد موارد';
        if (page < 1 || page > totalPages) {
            return `❌ الصفحة ${page} غير موجودة. الإجمالي: ${totalPages}`;
        }

        const start = (page - 1) * perPage;
        const pageResources = resourcesList.slice(start, start + perPage);

        let message = `🌿 الموارد - صفحة ${page}/${totalPages}\n\n`;

        pageResources.forEach(([id, resource]) => {
            message += `• ${resource.name}\n`;
            message += `  🆔 ${id}\n`;
            message += `  💎 الندرة: ${this._translateRarity(resource.rarity || 'common')}\n`;
            if (resource.locations) message += `  📍 المواقع: ${resource.locations.length}\n`;
            message += `\n`;
        });

        message += `📄 للتنقل: عرض_موارد [رقم]`;
        return message;
    }

    // ✅ عرض اللاعبين (مع ID + userId)
    async handleShowPlayers(args) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;

        const total = await Player.countDocuments({
            registrationStatus: 'completed'
        });

        if (total === 0) return '📋 لا يوجد لاعبون مسجلون.';

        const totalPages = Math.ceil(total / perPage);
        if (page < 1 || page > totalPages) {
            return `❌ الصفحة ${page} غير موجودة. الإجمالي: ${totalPages}`;
        }

        const start = (page - 1) * perPage;

        const players = await Player.find({
            registrationStatus: 'completed'
        })
        .sort({ level: -1, createdAt: 1 })
        .skip(start)
        .limit(perPage)
        .select('name playerId userId level gold currentLocation');

        let msg = `📋 اللاعبون - صفحة ${page}/${totalPages}\n`;
        msg += `📊 الإجمالي: ${total}\n\n`;

        players.forEach((p, index) => {
            const rank = start + index + 1;
            msg += `${rank}. 👤 ${p.name}\n`;
            msg += `   🆔 ${p.playerId || 'N/A'}\n`;
            msg += `   📱 ${p.userId}\n`;
            msg += `   📊 المستوى: ${p.level}\n`;
            msg += `   💰 الرصيد: ${p.gold} ريو\n\n`;
        });

        msg += `💡 للتنقل: عرض_لاعبين [رقم]`;
        return msg;
    }

    // ===================================
    // أوامر الإضافة والحذف
    // ===================================

    async handleAddWeapon(args) {
        if (args.length < 3) return '❌ الاستخدام: اضف_سلاح [اسم] [قوة] [مستوى]';
        const name = args.slice(0, -2).join(' ');
        const attack = parseInt(args[args.length - 2]);
        const level = parseInt(args[args.length - 1]);

        if (isNaN(attack) || isNaN(level)) return '❌ القوة والمستوى أرقام';

        const id = name.toLowerCase().replace(/\s+/g, '_');

        try {
            const { Weapon } = await import('../../core/models/Weapon.js');
            await Weapon.updateOne(
                { id },
                { $set: { id, name, type: 'weapon', attack, level, rarity: 'common' } },
                { upsert: true }
            );
            return `✅ تمت إضافة السلاح ${name}\n🆔 ${id}`;
        } catch (e) {
            return '❌ فشل: ' + e.message;
        }
    }

    async handleDeleteWeapon(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Weapon } = await import('../../core/models/Weapon.js');
            await Weapon.deleteOne({ id });
            return `✅ تم حذف السلاح ${name}`;
        } catch (e) {
            return '❌ فشل: ' + e.message;
        }
    }

    async handleAddMonster(args) {
        if (args.length < 4) return '❌ الاستخدام: اضف_وحش [اسم] [صحة] [ضرر] [مستوى]';
        const name = args.slice(0, -3).join(' ');
        const health = parseInt(args[args.length - 3]);
        const damage = parseInt(args[args.length - 2]);
        const level = parseInt(args[args.length - 1]);

        if ([health, damage, level].some(isNaN)) return '❌ أرقام غير صالحة';

        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Monster } = await import('../../core/models/Monster.js');
            await Monster.updateOne(
                { id },
                { $set: { id, name, level, health, maxHealth: health, damage } },
                { upsert: true }
            );
            return `✅ تمت إضافة الوحش ${name}\n🆔 ${id}`;
        } catch (e) {
            return '❌ فشل: ' + e.message;
        }
    }

    async handleDeleteMonster(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Monster } = await import('../../core/models/Monster.js');
            await Monster.deleteOne({ id });
            return `✅ تم حذف الوحش ${name}`;
        } catch (e) {
            return '❌ فشل: ' + e.message;
        }
    }

    async handleAddResource(args) {
        if (args.length < 3) return '❌ الاستخدام: اضف_مورد [اسم] [ندرة] [موقع]';
        const name = args.slice(0, -2).join(' ');
        const rarity = args[args.length - 2];
        const location = args[args.length - 1];
        const id = name.toLowerCase().replace(/\s+/g, '_');

        try {
            const { Resource } = await import('../../core/models/Resource.js');
            await Resource.updateOne(
                { id },
                { $set: { id, name, rarity, locations: [location] } },
                { upsert: true }
            );
            return `✅ تمت إضافة المورد ${name}\n🆔 ${id}`;
        } catch (e) {
            return '❌ فشل: ' + e.message;
        }
    }

    async handleDeleteResource(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Resource } = await import('../../core/models/Resource.js');
            await Resource.deleteOne({ id });
            return `✅ تم حذف المورد ${name}`;
        } catch (e) {
            return '❌ فشل: ' + e.message;
        }
    }

    // ===================================
    // المهام
    // ===================================

    async handleAddTaskCommand(args, senderId) {
        if (args.length < 4) {
            return '❌ الاستخدام: اضف_مهمة [الاسم] [النوع] [الهدف] [المكافأة]';
        }

        const reward = parseInt(args[args.length - 1]);
        const target = parseInt(args[args.length - 2]);
        const rawType = args[args.length - 3];
        const name = args.slice(0, -3).join(' ').replace(/["']/g, '');

        if (isNaN(target) || isNaN(reward) || target <= 0 || reward <= 0) {
            return '❌ أرقام غير صالحة.';
        }

        const achievementSystem = this.commandHandler 
            ? await this.commandHandler.getSystem('achievement') 
            : null;
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';

        const type = achievementSystem._translateTaskType(rawType);
        const validTypes = ['gather', 'kill', 'craft', 'travel', 'earn_gold', 'use_stamina', 'referral', 'streak'];

        if (!validTypes.includes(type)) {
            return `❌ النوع "${rawType}" غير صالح.`;
        }

        await achievementSystem.addCustomTask(name, type, target, reward);
        return `✅ تم إضافة المهمة ${name}`;
    }

    async handleRemoveTaskCommand(args, senderId) {
        const taskId = args.join(' ');
        if (!taskId) return '❌ الاستخدام: حذف_مهمة [المعرف]';

        const achievementSystem = this.commandHandler 
            ? await this.commandHandler.getSystem('achievement') 
            : null;
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';

        const removed = await achievementSystem.removeCustomTask(taskId);
        return removed ? `✅ تم حذف المهمة: ${taskId}` : `❌ لم يتم العثور على المهمة`;
    }

    async handleListTasksCommand(args, senderId) {
        const achievementSystem = this.commandHandler 
            ? await this.commandHandler.getSystem('achievement') 
            : null;
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';

        const tasks = await achievementSystem.listCustomTasks();
        if (tasks.length === 0) return '📋 لا توجد مهام مخصصة.';

        let msg = `📋 المهام المخصصة (${tasks.length})\n`;
        tasks.forEach(task => {
            msg += `\n📌 ${task.name}\n`;
            msg += `   🆔 ${task.id}\n`;
            msg += `   🎯 ${achievementSystem._getTypeNameArabic(task.type)}\n`;
            msg += `   📊 ${task.target}\n`;
            msg += `   💰 ${task.reward} ريو\n`;
        });
        return msg;
    }

    // ===================================
    // الصلاحيات
    // ===================================

    async handleGrantAdmin(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const senderHasFull = sender && sender.hasPermission('full_admin');

        if (!isRoot && !senderHasFull) return '❌ ليس لديك صلاحية.';

        if (args.length < 1) {
            return `❌ الاستخدام: اعطاء_ادمن [ID] [مدة]

أمثلة:
• اعطاء_ادمن 1001 (دائم)
• اعطاء_ادمن 1001 24 (24 ساعة)

⚠️ ID يجب أن يكون من نطاق المدراء (1000-1099)`;
        }

        const targetId = args[0];
        const durationHours = args[1] ? parseInt(args[1]) : null;

        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const result = await this.permissionSystem.grantPermission(
            target.userId, 'full_admin', senderId, durationHours
        );

        return result.error || result.message;
    }

    async handleGrantPermission(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const senderHasFull = sender && sender.hasPermission('full_admin');

        if (!isRoot && !senderHasFull) return '❌ ليس لديك صلاحية.';

        if (args.length < 2) {
            const types = this.permissionSystem.getAllPermissionTypes().join(', ');
            return `❌ الاستخدام: اعطاء_صلاحية [ID] [النوع] [مدة]\n\nالأنواع: ${types}`;
        }

        const targetId = args[0];
        const permType = args[1];
        const durationHours = args[2] ? parseInt(args[2]) : null;

        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const result = await this.permissionSystem.grantPermission(
            target.userId, permType, senderId, durationHours
        );

        return result.error || result.message;
    }

    async handleRevokePermission(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const senderHasFull = sender && sender.hasPermission('full_admin');

        if (!isRoot && !senderHasFull) return '❌ ليس لديك صلاحية.';
        if (args.length < 2) return '❌ الاستخدام: ازالة_صلاحية [ID] [النوع]';

        const targetId = args[0];
        const permType = args[1];

        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const result = await this.permissionSystem.revokePermission(target.userId, permType);
        return result.error || result.message;
    }

    async handleListAdmins(senderId) {
        const result = await this.permissionSystem.showAllAdmins();
        return result.error || result.message;
    }

    async handleShowPermissions(args, senderId) {
        if (args.length < 1) return '❌ الاستخدام: صلاحيات [ID]';

        const targetId = args[0];
        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const result = await this.permissionSystem.showPlayerPermissions(target.userId);
        return result.error || result.message;
    }

    // ===================================
    // السجن
    // ===================================

    async handleJail(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const hasJailPerm = sender && sender.hasPermission('jail');

        if (!isRoot && !hasJailPerm) return '❌ ليس لديك صلاحية.';

        if (args.length < 1) {
            return `❌ الاستخدام: سجن [ID] [مدة]

أمثلة:
• سجن 1001 (دائم)
• سجن 1001 60 (60 دقيقة)
• سجن 1001 2س (ساعتان)`;
        }

        const targetId = args[0];
        const durationInput = args[1];

        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;
        if (target.userId === senderId) return '❌ لا يمكنك سجن نفسك!';

        // منع سجن الأدمن الرئيسي
        if (this.isRootAdmin(target.userId)) {
            return '❌ لا يمكن سجن الأدمن الرئيسي!';
        }

        if (durationInput) {
            const durationMs = this._parseDuration(durationInput);
            if (!durationMs) return `❌ مدة غير صالحة: ${durationInput}`;

            target.jailedUntil = new Date(Date.now() + durationMs);
            target.jailedReason = 'سجن إداري';
            target.jailedBy = senderId;
            target.jailNotified = false;
            await target.save();

            return `🚔 تم سجن اللاعب\n\n👤 ${target.name}\n🆔 ${target.playerId}\n⏳ المدة: ${this._formatDuration(durationMs)}\n⏰ ينتهي: ${target.jailedUntil.toLocaleString('ar-EG')}`;
        } else {
            target.jailedUntil = new Date(0);
            target.jailedReason = 'سجن دائم';
            target.jailedBy = senderId;
            target.jailNotified = false;
            await target.save();

            return `🚔 سجن دائم\n\n👤 ${target.name}\n🆔 ${target.playerId}\n⏳ المدة: دائم`;
        }
    }

    async handleRelease(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const hasJailPerm = sender && sender.hasPermission('jail');

        if (!isRoot && !hasJailPerm) return '❌ ليس لديك صلاحية.';
        if (args.length < 1) return '❌ الاستخدام: اطلاق [ID]';

        const targetId = args[0];
        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;
        if (!target.isJailed()) return '❌ اللاعب ليس مسجوناً.';

        target.jailedUntil = null;
        target.jailedReason = null;
        target.jailedBy = null;
        target.jailNotified = false;
        await target.save();

        return `✅ تم إطلاق سراح ${target.name}.`;
    }

    async handleJailList(senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const hasJailPerm = sender && sender.hasPermission('jail');

        if (!isRoot && !hasJailPerm) return '❌ ليس لديك صلاحية.';

        const now = new Date();
        const jailed = await Player.find({
            $or: [
                { jailedUntil: { $gt: now } },
                { jailedUntil: { $eq: new Date(0) } }
            ]
        }).select('name userId playerId jailedUntil jailedReason');

        if (jailed.length === 0) return '🚔 لا يوجد مسجونون حالياً.';

        let msg = `🚔 قائمة المسجونين (${jailed.length})\n\n`;

        jailed.forEach((p, index) => {
            const isPermanent = p.jailedUntil.getTime() === 0;
            const timeStr = isPermanent 
                ? 'دائم' 
                : `ينتهي: ${p.jailedUntil.toLocaleString('ar-EG')}`;

            msg += `${index + 1}. ${p.name}\n`;
            msg += `   🆔 ${p.playerId || 'N/A'}\n`;
            msg += `   📱 ${p.userId}\n`;
            msg += `   ⏰ ${timeStr}\n\n`;
        });

        return msg;
    }

    findAutoResponse(message) {
        return this.autoResponseSystem.findAutoResponse(message);
    }
    }
    
