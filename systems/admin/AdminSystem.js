// systems/admin/AdminSystem.js
import Player from '../../core/Player.js';
import { items } from '../../data/items.js';
import { AutoResponseSystem } from '../autoResponse/AutoResponseSystem.js';
import { PermissionSystem } from '../permissions/PermissionSystem.js';

export class AdminSystem {
    constructor() {
        this.adminCommands = new Map();
        this.autoResponseSystem = new AutoResponseSystem();
        this.permissionSystem = new PermissionSystem();
        this.commandHandler = null;
        console.log('👑 نظام المدير تم تهيئته');
    }

    setCommandHandler(handler) {
        this.commandHandler = handler;
    }

    // ✅ فحص إذا كان المستخدم مديراً بأي شكل
    isAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
        const rootAdmins = [
            ADMIN_PSID,
            ADMIN_TELEGRAM_ID ? `tg_${ADMIN_TELEGRAM_ID}` : null
        ].filter(Boolean);
        
        if (rootAdmins.includes(userId)) return true;
        
        // ✅ فحص DB (يتم بشكل غير متزامن)
        return false;
    }

    // ✅ فحص غير متزامن شامل
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

    generateUniqueId() {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _translateRarity(rarity) {
        const map = {
            'common': 'عادي', 'uncommon': 'غير عادي', 'rare': 'نادر',
            'epic': 'ملحمي', 'legendary': 'أسطوري', 'mythic': 'خرافي',
            'divine': 'إلهي', 'special': 'خاص'
        };
        return map[rarity] || rarity || 'عادي';
    }

    // ✅ تحويل المدة إلى ميلي ثانية
    _parseDuration(input) {
        if (!input) return null;
        
        const str = input.toString().trim().toLowerCase();
        
        // بدون وحدة = ساعات
        const numMatch = str.match(/^(\d+)$/);
        if (numMatch) {
            return parseInt(numMatch[1]) * 60 * 60 * 1000;
        }

        // مع وحدة
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

    // ✅ تنسيق المدة للعرض
    _formatDuration(ms) {
        if (ms < 60 * 1000) return `${Math.floor(ms / 1000)} ثانية`;
        if (ms < 60 * 60 * 1000) return `${Math.floor(ms / (60 * 1000))} دقيقة`;
        if (ms < 24 * 60 * 60 * 1000) return `${Math.floor(ms / (60 * 60 * 1000))} ساعة`;
        return `${Math.floor(ms / (24 * 60 * 60 * 1000))} يوم`;
    }

    // ✅ تحويل الرقم إلى وقت مقروء
    _formatTimeRemaining(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} يوم و ${hours % 24} ساعة`;
        if (hours > 0) return `${hours} ساعة و ${minutes % 60} دقيقة`;
        if (minutes > 0) return `${minutes} دقيقة و ${seconds % 60} ثانية`;
        return `${seconds} ثانية`;
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
            // الإدارة
            'موافقة_لاعب': 'موافقة لاعب',
            'تغيير_اسم': 'تغيير اسم',
            'تغيير_جنس': 'تغيير جنس',
            'حظر_لاعب': 'حظر لاعب',
            'اعادة_بيانات': 'اعادة بيانات',
            // الاقتصاد
            'طلبات_سحب': 'طلبات سحب',
            'معالجة_سحب': 'معالجة سحب',
            'حذف_طلب_سحب': 'حذف طلب سحب',
            'اضافة_غولد': 'إضافة غولد',
            'اقتصاد': 'اقتصاد',
            'اغنياء': 'اغنياء',
            'فقراء': 'فقراء',
            'اقتصاد_لاعب': 'اقتصاد لاعب',
            // المنح
            'اعطاء_ذهب': 'اعطاء ذهب',
            'اعطاء_مورد': 'اعطاء مورد',
            'زيادة_صحة': 'زيادة صحة',
            'زيادة_مانا': 'زيادة مانا',
            // التعديل
            'تعديل_رصيد': 'تعديل رصيد',
            'اضف_رصيد': 'إضافة رصيد',
            'اسحب_رصيد': 'سحب رصيد',
            'تعديل_مستوى': 'تعديل مستوى',
            'تعديل_ايدي': 'تعديل ايدي',
            'تعديل_هجوم': 'تعديل هجوم',
            'تعديل_دفاع': 'تعديل دفاع',
            'تعديل_صحة': 'تعديل صحة',
            'تعديل_مانا': 'تعديل مانا',
            'تعديل_نشاط': 'تعديل نشاط',
            // الردود
            'اضف_رد': 'إضافة رد',
            'ازل_رد': 'إزالة رد',
            'عرض_الردود': 'عرض الردود',
            // العرض
            'عرض_اسلحة': 'عرض الأسلحة',
            'عرض_وحوش': 'عرض الوحوش',
            'عرض_مواقع': 'عرض المواقع',
            'عرض_موارد': 'عرض الموارد',
            // الإضافة والحذف
            'اضف_سلاح': 'إضافة سلاح',
            'حذف_سلاح': 'حذف سلاح',
            'اضف_وحش': 'إضافة وحش',
            'حذف_وحش': 'حذف وحش',
            'اضف_مورد': 'إضافة مورد',
            'حذف_مورد': 'حذف مورد',
            // المهام
            'اضف_مهمة': 'إضافة مهمة',
            'حذف_مهمة': 'حذف مهمة',
            'قائمة_المهام': 'قائمة المهام',
            // الصلاحيات
            'اعطاء_ادمن': 'إعطاء ادمن',
            'ازالة_ادمن': 'إزالة ادمن',
            'اعطاء_صلاحية': 'إعطاء صلاحية',
            'ازالة_صلاحية': 'إزالة صلاحية',
            'قائمة_الادمن': 'قائمة الادمن',
            'صلاحيات': 'صلاحيات',
            // السجن
            'سجن': 'سجن',
            'اطلاق': 'إطلاق',
            'قائمة_المسجونين': 'قائمة المسجونين'
        };
    }

    getAdminHelp() {
        return `👑 أوامر المدير

🛠️ الإدارة
• موافقة_لاعب [ID]
• تغيير_اسم [ID] [الاسم]
• تغيير_جنس [ID] [ذكر/أنثى]
• حظر_لاعب [ID] [صحيح/خطأ]
• اعادة_بيانات [ID]

💰 الاقتصاد
• اقتصاد | اغنياء [ص] | فقراء [ص]
• طلبات_سحب [ص]
• معالجة_سحب [ID] [قبول/رفض]
• حذف_طلب_سحب [ID]
• اضافة_غولد [ID] [المبلغ]
• اقتصاد_لاعب [الاسم]

🎁 المنح
• اعطاء_ذهب [ID] [الكمية]
• اعطاء_مورد [ID] [العنصر] [الكمية]
• زيادة_صحة [ID] [الكمية]
• زيادة_مانا [ID] [الكمية]

🔧 التعديل
• تعديل_رصيد [ID] [المبلغ]
• اضف_رصيد [ID] [المبلغ]
• اسحب_رصيد [ID] [المبلغ]
• تعديل_مستوى [ID] [المستوى]
• تعديل_ايدي [ID] [الجديد]
• تعديل_هجوم [ID] [القيمة] [مدة]
• تعديل_دفاع [ID] [القيمة] [مدة]
• تعديل_صحة [ID] [القيمة] [مدة]
• تعديل_مانا [ID] [القيمة] [مدة]
• تعديل_نشاط [ID] [القيمة] [مدة]

💡 المدة تقبل: 24 | 30د | 2س | 3ي
• بدون مدة = دائم

🚔 السجن
• سجن [ID] [المدة]
• اطلاق [ID]
• قائمة_المسجونين

🔐 الصلاحيات
• اعطاء_ادمن [ID] [مدة]
• اعطاء_صلاحية [ID] [النوع] [مدة]
• ازالة_صلاحية [ID] [النوع]
• ازالة_ادمن [ID]
• قائمة_الادمن
• صلاحيات [ID]

الأنواع:
full_admin, approve, ban, economy,
tasks, give, content, jail, modify

🤖 الردود
• اضف_رد [الكلمة] || [الرد]
• ازل_رد [الكلمة]
• عرض_الردود

📋 العرض
• عرض_اسلحة [ص] | عرض_وحوش [ص]
• عرض_مواقع [ص] | عرض_موارد [ص]

🏆 المهام
• اضف_مهمة [الاسم] [النوع] [الهدف] [المكافأة]
• حذف_مهمة [ID] | قائمة_المهام

➕ الإضافة والحذف
• اضف_سلاح [اسم] [قوة] [مستوى]
• حذف_سلاح [اسم]
• اضف_وحش [اسم] [صحة] [ضرر] [مستوى]
• حذف_وحش [اسم]
• اضف_مورد [اسم] [ندرة] [موقع]
• حذف_مورد [اسم]

💡 الأوامر تقبل:
• موافقة_لاعب | موافقة لاعب | موافقةلاعب`;
    }

    // ✅ خريطة تحويل الأوامر
    _getCommandMap() {
        return {
            'مدير': 'مدير',
            'موافقةلاعب': 'موافقة_لاعب',
            'اعادةبيانات': 'اعادة_بيانات',
            'تغييراسم': 'تغيير_اسم',
            'تغييرجنس': 'تغيير_جنس',
            'حظرلاعب': 'حظر_لاعب',
            'اعطاءذهب': 'اعطاء_ذهب',
            'اعطاءمورد': 'اعطاء_مورد',
            'زيادةصحة': 'زيادة_صحة',
            'زيادةمانا': 'زيادة_مانا',
            'طلباتسحب': 'طلبات_سحب',
            'معالجةسحب': 'معالجة_سحب',
            'حذفطلبالسحب': 'حذف_طلب_سحب',
            'حذفطلبسحب': 'حذف_طلب_سحب',
            'اضافةغولد': 'اضافة_غولد',
            'اضفرد': 'اضف_رد',
            'ازلرد': 'ازل_رد',
            'عرضالردود': 'عرض_الردود',
            'عرضاسلحة': 'عرض_اسلحة',
            'عرضوحوش': 'عرض_وحوش',
            'عرضمواقع': 'عرض_مواقع',
            'عرضموارد': 'عرض_موارد',
            'اضفمهمة': 'اضف_مهمة',
            'حذفمهمة': 'حذف_مهمة',
            'قائمةالمهام': 'قائمة_المهام',
            'اضفسلاح': 'اضف_سلاح',
            'حذفسلاح': 'حذف_سلاح',
            'اضفوحش': 'اضف_وحش',
            'حذفوحش': 'حذف_وحش',
            'اضفمورد': 'اضف_مورد',
            'حذفمورد': 'حذف_مورد',
            'اقتصاد': 'اقتصاد',
            'اغنياء': 'اغنياء',
            'فقراء': 'فقراء',
            'اقتصادلاعب': 'اقتصاد_لاعب',
            // التعديل
            'تعديلرصيد': 'تعديل_رصيد',
            'اضفرصيد': 'اضف_رصيد',
            'اسحبرصيد': 'اسحب_رصيد',
            'تعديلمستوى': 'تعديل_مستوى',
            'تعديلايدي': 'تعديل_ايدي',
            'تعديلهجوم': 'تعديل_هجوم',
            'تعديلدفاع': 'تعديل_دفاع',
            'تعديلصحة': 'تعديل_صحة',
            'تعديلمانا': 'تعديل_مانا',
            'تعديلنشاط': 'تعديل_نشاط',
            // الصلاحيات
            'اعطاءادمن': 'اعطاء_ادمن',
            'ازالةادمن': 'ازالة_ادمن',
            'اعطاءصلاحية': 'اعطاء_صلاحية',
            'ازالةصلاحية': 'ازالة_صلاحية',
            'قائمةالادمن': 'قائمة_الادمن',
            'صلاحيات': 'صلاحيات',
            // السجن
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
            // الإدارة
            case 'موافقة_لاعب': return await this.handleApprovePlayer(args, senderId);
            case 'اعادة_بيانات': return await this.handleResetPlayer(args, findTargetPlayer);
            case 'تغيير_اسم': return await this.handleSetPlayerName(args, findTargetPlayer);
            case 'تغيير_جنس': return await this.handleSetPlayerGender(args, findTargetPlayer);
            case 'حظر_لاعب': return await this.handleBanPlayer(args, findTargetPlayer);
            // الاقتصاد
            case 'طلبات_سحب': return await this.handlePendingWithdrawals(args, senderId);
            case 'معالجة_سحب': return await this.handleProcessWithdrawal(args, senderId);
            case 'حذف_طلب_سحب': return await this.handleDeleteWithdrawal(args, senderId);
            case 'اضافة_غولد': return await this.handleAddGold(args, senderId);
            case 'اقتصاد': return await this.handleEconomyStats();
            case 'اغنياء': return await this.handleRichestPlayers(args);
            case 'فقراء': return await this.handlePoorestPlayers(args);
            case 'اقتصاد_لاعب': return await this.handlePlayerEconomy(args);
            // المنح
            case 'اعطاء_ذهب': return await this.handleGiveGold(args, findTargetPlayer);
            case 'اعطاء_مورد': return await this.handleGiveItem(args, findTargetPlayer, itemMap);
            case 'زيادة_صحة': return await this.handleIncreaseStat(args, 'maxHealth', findTargetPlayer);
            case 'زيادة_مانا': return await this.handleIncreaseStat(args, 'maxMana', findTargetPlayer);
            // التعديل
            case 'تعديل_رصيد': return await this.handleModifyGold(args, findTargetPlayer, 'set');
            case 'اضف_رصيد': return await this.handleModifyGold(args, findTargetPlayer, 'add');
            case 'اسحب_رصيد': return await this.handleModifyGold(args, findTargetPlayer, 'remove');
            case 'تعديل_مستوى': return await this.handleModifyLevel(args, findTargetPlayer);
            case 'تعديل_ايدي': return await this.handleModifyId(args, findTargetPlayer);
            case 'تعديل_هجوم': return await this.handleModifyStat(args, findTargetPlayer, 'attack', senderId);
            case 'تعديل_دفاع': return await this.handleModifyStat(args, findTargetPlayer, 'defense', senderId);
            case 'تعديل_صحة': return await this.handleModifyStat(args, findTargetPlayer, 'maxHealth', senderId);
            case 'تعديل_مانا': return await this.handleModifyStat(args, findTargetPlayer, 'maxMana', senderId);
            case 'تعديل_نشاط': return await this.handleModifyStat(args, findTargetPlayer, 'maxStamina', senderId);
            // الردود
            case 'اضف_رد': return await this.handleAddAutoResponse(args, senderId);
            case 'ازل_رد': return await this.handleRemoveAutoResponse(args, senderId);
            case 'عرض_الردود': return await this.handleShowAutoResponses(args, senderId);
            // العرض
            case 'عرض_اسلحة': return await this.handleShowItemsByType(args, 'weapon');
            case 'عرض_وحوش': return await this.handleShowMonsters(args);
            case 'عرض_مواقع': return await this.handleShowLocations(args);
            case 'عرض_موارد': return await this.handleShowResources(args);
            // الإضافة والحذف
            case 'اضف_سلاح': return await this.handleAddWeapon(args);
            case 'حذف_سلاح': return await this.handleDeleteWeapon(args);
            case 'اضف_وحش': return await this.handleAddMonster(args);
            case 'حذف_وحش': return await this.handleDeleteMonster(args);
            case 'اضف_مورد': return await this.handleAddResource(args);
            case 'حذف_مورد': return await this.handleDeleteResource(args);
            // المهام
            case 'اضف_مهمة': return await this.handleAddTaskCommand(args, senderId);
            case 'حذف_مهمة': return await this.handleRemoveTaskCommand(args, senderId);
            case 'قائمة_المهام': return await this.handleListTasksCommand(args, senderId);
            // الصلاحيات
            case 'اعطاء_ادمن': return await this.handleGrantAdmin(args, senderId);
            case 'ازالة_ادمن': return await this.handleRevokeAdmin(args, senderId);
            case 'اعطاء_صلاحية': return await this.handleGrantPermission(args, senderId);
            case 'ازالة_صلاحية': return await this.handleRevokePermission(args, senderId);
            case 'قائمة_الادمن': return await this.handleListAdmins(senderId);
            case 'صلاحيات': return await this.handleShowPermissions(args, senderId);
            // السجن
            case 'سجن': return await this.handleJail(args, senderId);
            case 'اطلاق': return await this.handleRelease(args, senderId);
            case 'قائمة_المسجونين': return await this.handleJailList(senderId);
            default: return null;
        }
    }

    // ===================================
    // أوامر التعديل الجديدة
    // ===================================

    async handleModifyGold(args, findTargetPlayer, mode) {
        if (args.length < 2) {
            const modes = { set: 'تعديل_رصيد', add: 'اضف_رصيد', remove: 'اسحب_رصيد' };
            return `❌ الاستخدام: ${modes[mode]} [ID] [المبلغ]`;
        }

        const targetId = args[0];
        const amount = parseInt(args[1]);

        if (isNaN(amount) || amount < 0) return '❌ مبلغ غير صالح.';

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const oldGold = target.gold;

        if (mode === 'set') {
            target.gold = amount;
        } else if (mode === 'add') {
            target.gold += amount;
        } else if (mode === 'remove') {
            target.gold = Math.max(0, target.gold - amount);
        }

        await target.save();

        const modes = { set: 'تعديل', add: 'إضافة', remove: 'خصم' };
        return `✅ تم ${modes[mode]} الرصيد

👤 اللاعب: ${target.name}
💰 الرصيد السابق: ${oldGold}
💰 الرصيد الجديد: ${target.gold}`;
    }

    async handleModifyLevel(args, findTargetPlayer) {
        if (args.length < 2) return '❌ الاستخدام: تعديل_مستوى [ID] [المستوى]';

        const targetId = args[0];
        const level = parseInt(args[1]);

        if (isNaN(level) || level < 1 || level > 1000) {
            return '❌ المستوى يجب أن يكون بين 1 و 1000.';
        }

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const oldLevel = target.level;
        target.level = level;
        await target.save();

        return `✅ تم تعديل المستوى

👤 اللاعب: ${target.name}
📊 المستوى السابق: ${oldLevel}
📊 المستوى الجديد: ${target.level}`;
    }

    async handleModifyId(args, findTargetPlayer) {
        if (args.length < 2) return '❌ الاستخدام: تعديل_ايدي [ID] [الجديد]';

        const targetId = args[0];
        const newId = args[1];

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        // فحص عدم استخدام ID
        const existing = await Player.findOne({ playerId: newId, userId: { $ne: target.userId } });
        if (existing) return `❌ ID "${newId}" مستخدم بالفعل.`;

        const oldId = target.playerId;
        target.playerId = newId;
        await target.save();

        return `✅ تم تعديل ID

👤 اللاعب: ${target.name}
🆔 ID السابق: ${oldId}
🆔 ID الجديد: ${target.playerId}`;
    }

    async handleModifyStat(args, findTargetPlayer, statType, senderId) {
        if (args.length < 2) {
            const names = { attack: 'هجوم', defense: 'دفاع', maxHealth: 'صحة', maxMana: 'مانا', maxStamina: 'نشاط' };
            return `❌ الاستخدام: تعديل_${names[statType]} [ID] [القيمة] [مدة اختيارية]`;
        }

        const targetId = args[0];
        const value = parseInt(args[1]);
        const durationInput = args[2]; // اختياري

        if (isNaN(value) || value === 0) {
            return '❌ القيمة يجب أن تكون رقماً غير صفري.';
        }

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const names = { attack: 'الهجوم', defense: 'الدفاع', maxHealth: 'الصحة', maxMana: 'المانا', maxStamina: 'النشاط' };

        if (!durationInput) {
            // ✅ بونص دائم
            target.bonusStats = target.bonusStats || {};
            const oldValue = target.bonusStats[statType] || 0;
            target.bonusStats[statType] = oldValue + value;
            await target.save();

            return `✅ تم إضافة ${names[statType]} دائم

👤 اللاعب: ${target.name}
📊 القيمة المضافة: ${value > 0 ? '+' : ''}${value}
📈 الإجمالي: ${target.bonusStats[statType]}`;
        } else {
            // ✅ مؤقت
            const durationMs = this._parseDuration(durationInput);
            if (!durationMs) {
                return `❌ مدة غير صالحة: ${durationInput}

الصيغ المقبولة:
• 24 (ساعات)
• 30د (دقائق)
• 2س (ساعات)
• 3ي (أيام)`;
            }

            target.addActiveEffect(statType, value, durationMs, senderId);
            await target.save();

            const expiresAt = new Date(Date.now() + durationMs);
            return `✅ تم إضافة ${names[statType]} مؤقت

👤 اللاعب: ${target.name}
📊 القيمة: ${value > 0 ? '+' : ''}${value}
⏰ ينتهي: ${expiresAt.toLocaleString('ar-EG')}
⏳ المدة: ${this._formatDuration(durationMs)}`;
        }
    }

    // ===================================
    // أوامر الصلاحيات
    // ===================================

    async handleGrantAdmin(args, senderId) {
        // فحص صلاحية المُعطي
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const senderHasFull = sender && sender.hasPermission('full_admin');

        if (!isRoot && !senderHasFull) {
            return '❌ ليس لديك صلاحية إعطاء صلاحيات.';
        }

        if (args.length < 1) {
            return `❌ الاستخدام: اعطاء_ادمن [ID] [مدة اختيارية]

أمثلة:
• اعطاء_ادمن 1001 (دائم)
• اعطاء_ادمن 1001 24 (24 ساعة)`;
        }

        const targetId = args[0];
        const durationInput = args[1];

        // البحث عن اللاعب
        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ playerId: targetId.toUpperCase() }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const durationHours = durationInput ? parseInt(durationInput) : null;
        const result = await this.permissionSystem.grantPermission(
            target.userId,
            'full_admin',
            senderId,
            durationHours
        );

        return result.error || result.message;
    }

    async handleRevokeAdmin(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const senderHasFull = sender && sender.hasPermission('full_admin');

        if (!isRoot && !senderHasFull) {
            return '❌ ليس لديك صلاحية إزالة الصلاحيات.';
        }

        if (args.length < 1) return '❌ الاستخدام: ازالة_ادمن [ID]';

        const targetId = args[0];
        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const result = await this.permissionSystem.revokeAllPermissions(target.userId);
        return result.error || result.message;
    }

    async handleGrantPermission(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const senderHasFull = sender && sender.hasPermission('full_admin');

        if (!isRoot && !senderHasFull) {
            return '❌ ليس لديك صلاحية إعطاء صلاحيات.';
        }

        if (args.length < 2) {
            const types = this.permissionSystem.getAllPermissionTypes().join(', ');
            return `❌ الاستخدام: اعطاء_صلاحية [ID] [النوع] [مدة]

الأنواع المتاحة:
${types}`;
        }

        const targetId = args[0];
        const permType = args[1];
        const durationHours = args[2] ? parseInt(args[2]) : null;

        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;

        const result = await this.permissionSystem.grantPermission(
            target.userId,
            permType,
            senderId,
            durationHours
        );

        return result.error || result.message;
    }

    async handleRevokePermission(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const senderHasFull = sender && sender.hasPermission('full_admin');

        if (!isRoot && !senderHasFull) {
            return '❌ ليس لديك صلاحية إزالة الصلاحيات.';
        }

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
    // أوامر السجن
    // ===================================

    async handleJail(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const hasJailPerm = sender && sender.hasPermission('jail');

        if (!isRoot && !hasJailPerm) {
            return '❌ ليس لديك صلاحية السجن.';
        }

        if (args.length < 1) {
            return `❌ الاستخدام: سجن [ID] [المدة اختيارية]

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

        // لا تسجن نفسك
        if (target.userId === senderId) return '❌ لا يمكنك سجن نفسك!';

        if (durationInput) {
            const durationMs = this._parseDuration(durationInput);
            if (!durationMs) return `❌ مدة غير صالحة: ${durationInput}`;

            target.jailedUntil = new Date(Date.now() + durationMs);
            target.jailedReason = 'سجن إداري';
            target.jailedBy = senderId;
            target.jailNotified = false;
            await target.save();

            return `🚔 تم سجن اللاعب

👤 ${target.name}
⏳ المدة: ${this._formatDuration(durationMs)}
⏰ ينتهي: ${target.jailedUntil.toLocaleString('ar-EG')}`;
        } else {
            // سجن دائم (تاريخ = 0 يعني دائم)
            target.jailedUntil = new Date(0);
            target.jailedReason = 'سجن دائم';
            target.jailedBy = senderId;
            target.jailNotified = false;
            await target.save();

            return `🚔 تم سجن اللاعب بشكل دائم

👤 ${target.name}
⏳ المدة: دائم`;
        }
    }

    async handleRelease(args, senderId) {
        const sender = await Player.findOne({ userId: senderId });
        const isRoot = this.permissionSystem.isRootAdmin(senderId);
        const hasJailPerm = sender && sender.hasPermission('jail');

        if (!isRoot && !hasJailPerm) {
            return '❌ ليس لديك صلاحية الإطلاق.';
        }

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

        if (!isRoot && !hasJailPerm) {
            return '❌ ليس لديك صلاحية عرض المسجونين.';
        }

        const now = new Date();
        const jailed = await Player.find({
            jailedUntil: { $ne: null, $gt: now }
        }).select('name userId playerId jailedUntil jailedReason');

        // المسجونون بشكل دائم
        const permanentJailed = await Player.find({
            jailedUntil: { $eq: new Date(0) }
        }).select('name userId playerId jailedUntil jailedReason');

        const allJailed = [...jailed, ...permanentJailed];

        if (allJailed.length === 0) {
            return '🚔 لا يوجد مسجونون حالياً.';
        }

        let msg = `🚔 قائمة المسجونين (${allJailed.length})\n\n`;

        allJailed.forEach((p, index) => {
            const isPermanent = p.jailedUntil.getTime() === 0;
            const timeStr = isPermanent 
                ? 'دائم' 
                : `ينتهي: ${p.jailedUntil.toLocaleString('ar-EG')}`;
            
            msg += `${index + 1}. ${p.name}\n`;
            msg += `   🆔 ${p.playerId || p.userId}\n`;
            msg += `   ⏰ ${timeStr}\n\n`;
        });

        return msg;
    }

    // ===================================
    // باقي الأوامر (نفس ما كان سابقاً)
    // ===================================

    async getEconomySystem() {
        if (this.commandHandler) {
            return await this.commandHandler.getSystem('economy');
        }
        return null;
    }

    async handleEconomyStats() {
        const economySystem = await this.getEconomySystem();
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';
        return await economySystem.showEconomyStats();
    }

    async handleRichestPlayers(args) {
        const page = parseInt(args[0]) || 1;
        const economySystem = await this.getEconomySystem();
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';
        return await economySystem.showRichestPlayers(page);
    }

    async handlePoorestPlayers(args) {
        const page = parseInt(args[0]) || 1;
        const economySystem = await this.getEconomySystem();
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';
        return await economySystem.showPoorestPlayers(page);
    }

    async handlePlayerEconomy(args) {
        if (args.length === 0) return '❌ الاستخدام: اقتصاد_لاعب [الاسم]';
        const playerName = args.join(' ');
        const economySystem = await this.getEconomySystem();
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';
        return await economySystem.showPlayerEconomy(playerName);
    }

    async handlePendingWithdrawals(args, senderId) {
        const page = parseInt(args[0]) || 1;
        const PER_PAGE = 20;

        const totalPending = await Player.countDocuments({
            'pendingWithdrawal.status': 'pending',
            'pendingWithdrawal.amount': { $gt: 0 }
        });

        if (totalPending === 0) return `💸 طلبات السحب\n\n✅ لا توجد طلبات معلقة حالياً.`;

        const totalPages = Math.ceil(totalPending / PER_PAGE);

        if (page < 1 || page > totalPages) {
            return `❌ الصفحة ${page} غير موجودة.\n\n📄 إجمالي الصفحات: ${totalPages}`;
        }

        const skip = (page - 1) * PER_PAGE;

        const pendingPlayers = await Player.find({
            'pendingWithdrawal.status': 'pending',
            'pendingWithdrawal.amount': { $gt: 0 }
        })
        .sort({ 'pendingWithdrawal.requestedAt': 1 })
        .skip(skip)
        .limit(PER_PAGE)
        .select('name userId playerId pendingWithdrawal');

        let msg = `💸 طلبات السحب - صفحة ${page}/${totalPages}\n`;
        msg += `📊 إجمالي الطلبات: ${totalPending}\n`;

        pendingPlayers.forEach((p, index) => {
            const globalRank = skip + index + 1;
            const date = new Date(p.pendingWithdrawal.requestedAt).toLocaleDateString('ar-EG');
            msg += `\n${globalRank}. ${p.name}\n`;
            msg += `   🆔 ${p.playerId || p.userId}\n`;
            msg += `   💰 ${p.pendingWithdrawal.amount} غولد\n`;
            msg += `   📅 ${date}\n`;
        });

        msg += `\n💡 للمعالجة: معالجة_سحب [ID] [قبول/رفض]`;
        msg += `\n💡 للحذف: حذف_طلب_سحب [ID]`;
        msg += `\n💡 للتنقل: طلبات_سحب [رقم]`;

        return msg;
    }

    async handleDeleteWithdrawal(args, senderId) {
        if (args.length === 0) return '❌ الاستخدام: حذف_طلب_سحب [ID]';

        const targetId = args[0];
        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;
        if (target.pendingWithdrawal?.status !== 'pending') return '❌ لا يوجد طلب سحب معلق.';

        const amount = target.pendingWithdrawal.amount;
        target.gold += amount;
        target.pendingWithdrawal = { amount: 0, requestedAt: null, status: 'rejected' };
        await target.save();

        return `✅ تم حذف طلب السحب\n\n👤 اللاعب: ${target.name}\n💰 المبلغ: ${amount} غولد\n💎 تم إعادة المبلغ`;
    }

    async handleProcessWithdrawal(args, senderId) {
        if (args.length < 2) return '❌ الاستخدام: معالجة_سحب [ID] [قبول/رفض]';

        const targetId = args[0];
        const action = args[1].toLowerCase();

        const MIN_WITHDRAWAL = 50;
        const MAX_WITHDRAWAL = 5000;

        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return `❌ لم يتم العثور على اللاعب: ${targetId}`;
        if (target.pendingWithdrawal?.status !== 'pending') return '❌ لا يوجد طلب سحب معلق.';

        const amount = target.pendingWithdrawal.amount;

        if (amount < MIN_WITHDRAWAL) {
            return `❌ المبلغ أقل من الحد الأدنى (${MIN_WITHDRAWAL}).`;
        }
        if (amount > MAX_WITHDRAWAL) {
            return `❌ المبلغ أكبر من الحد الأقصى (${MAX_WITHDRAWAL}).`;
        }

        if (action === 'قبول' || action === 'موافقة') {
            target.pendingWithdrawal.status = 'completed';
            await target.save();
            return `✅ تم قبول السحب\n\n👤 ${target.name}\n💰 ${amount} غولد`;
        } else if (action === 'رفض') {
            target.gold += amount;
            target.pendingWithdrawal.status = 'rejected';
            await target.save();
            return `❌ تم رفض الطلب\n\n👤 ${target.name}\n💰 ${amount} غولد\n💎 تم الإرجاع`;
        } else {
            return '❌ استخدم: قبول أو رفض';
        }
    }

    async handleAddGold(args, senderId) {
        if (args.length < 2) return '❌ الاستخدام: اضافة_غولد [ID] [المبلغ]';

        const targetId = args[0];
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) return '❌ مبلغ غير صالح.';

        const target = await Player.findOne({ userId: targetId }) ||
                       await Player.findOne({ playerId: targetId }) ||
                       await Player.findOne({ name: new RegExp(targetId, 'i') });

        if (!target) return '❌ اللاعب غير موجود.';

        target.gold += amount;
        target.transactions.push({
            id: this.generateUniqueId(),
            type: 'deposit',
            amount,
            status: 'completed',
            description: 'إيداع من المدير'
        });
        await target.save();

        return `✅ تمت إضافة ${amount} غولد إلى ${target.name}.`;
    }

    // ... (باقي الدوال مثل handleResetPlayer, handleSetPlayerName, handleSetPlayerGender, handleBanPlayer, handleApprovePlayer, handleGiveItem, handleIncreaseStat, handleGiveGold, handleAddAutoResponse, handleRemoveAutoResponse, handleShowAutoResponses, handleShowItemsByType, handleShowMonsters, handleShowLocations, handleShowResources, handleAddWeapon, handleDeleteWeapon, handleAddMonster, handleDeleteMonster, handleAddResource, handleDeleteResource, handleAddTaskCommand, handleRemoveTaskCommand, handleListTasksCommand)

    // سأضعها مختصرة هنا (نفس ما كانت في السابق)
    
    async handleResetPlayer(args, findTargetPlayer) {
        const targetId = args[0];
        if (!targetId) return '❌ الاستخدام: اعادة_بيانات [ID]';

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const oldName = target.name;
        await target.deleteOne();
        await Player.createNew(target.userId, target.name);

        return `🗑️ تم مسح بيانات اللاعب ${oldName}.`;
    }

    async handleSetPlayerName(args, findTargetPlayer) {
        const targetId = args[0];
        const newName = args.slice(1).join(' ');

        if (!targetId || !newName) return '❌ الاستخدام: تغيير_اسم [ID] [الاسم]';

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const existing = await Player.findOne({ name: newName, userId: { $ne: target.userId } });
        if (existing) return `❌ الاسم ${newName} مستخدم.`;

        const oldName = target.name;
        target.name = newName;
        await target.save();

        return `✅ تم تغيير الاسم من ${oldName} إلى ${newName}.`;
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

    async handleBanPlayer(args, findTargetPlayer) {
        const targetId = args[0];
        const banStatus = args[1] ? args[1].toLowerCase() : 'true';

        if (!targetId) return '❌ الاستخدام: حظر_لاعب [ID] [صحيح/خطأ]';

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const isBanning = banStatus === 'true' || banStatus === 'صحيح' || banStatus === 'حظر';
        target.banned = isBanning;
        await target.save();

        return `✅ تم ${isBanning ? 'حظر' : 'رفع الحظر عن'} ${target.name}.`;
    }

    async handleApprovePlayer(args, senderId) {
        const RegistrationSystem = (await import('../registration/RegistrationSystem.js')).RegistrationSystem;
        const registrationSystem = new RegistrationSystem();

        if (args.length === 0) {
            const pendingPlayers = await registrationSystem.getPendingPlayers();
            if (pendingPlayers.length === 0) return '✅ لا يوجد لاعبين بانتظار الموافقة.';

            let message = '⏳ اللاعبين المنتظرين:\n\n';
            pendingPlayers.forEach((p, index) => {
                message += `${index + 1}. ${p.name} - ${p.userId}\n`;
            });
            message += '\nللموافقة: موافقة_لاعب [المعرف]';
            return message;
        }

        return await registrationSystem.approvePlayer(args[0], senderId);
    }

    async handleGiveItem(args, findTargetPlayer, itemMap) {
        if (args.length < 3) return '❌ الاستخدام: اعطاء_مورد [ID] [العنصر] [الكمية]';

        const targetId = args[0];
        const quantity = parseInt(args[args.length - 1], 10);
        const rawItemName = args.slice(1, args.length - 1).join(' ').toLowerCase();

        const itemId = itemMap[rawItemName] || rawItemName;
        const itemInfo = items[itemId];

        if (!itemInfo || isNaN(quantity) || quantity <= 0) return '❌ العنصر غير موجود أو الكمية غير صالحة.';

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

    async handleGiveGold(args, findTargetPlayer) {
        const targetId = args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount) || amount <= 0) return '❌ الاستخدام: اعطاء_ذهب [ID] [الكمية]';

        const target = await findTargetPlayer(targetId);
        if (!target) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        target.addGold(amount);
        await target.save();

        return `✅ تم إعطاء ${target.name} ${amount} غولد.`;
    }

    async handleAddAutoResponse(args, senderId) {
        const input = args.join(' ');
        const parts = input.split('||');
        if (parts.length < 2) return '❌ الاستخدام: اضف_رد [الكلمة] || [الرد]';
        const keyword = parts[0].trim().toLowerCase();
        const response = parts.slice(1).join('||').trim();
        if (!keyword || !response) return '❌ يجب تحديد الكلمة والرد.';
        this.autoResponseSystem.addResponse(keyword, response);
        return `✅ تم إضافة رد تلقائي للكلمة "${keyword}".`;
    }

    async handleRemoveAutoResponse(args, senderId) {
        const keyword = args.join(' ').toLowerCase().trim();
        if (!keyword) return '❌ الاستخدام: ازل_رد [الكلمة]';
        const removed = this.autoResponseSystem.removeResponse(keyword);
        return removed ? `✅ تم حذف الرد "${keyword}".` : `❌ لا يوجد رد للكلمة "${keyword}".`;
    }

    async handleShowAutoResponses(args, senderId) {
        const all = this.autoResponseSystem.getAllResponses();
        const keys = Object.keys(all);
        if (keys.length === 0) return '📝 لا توجد ردود تلقائية.';
        let msg = `🤖 الردود التلقائية (${keys.length}):\n\n`;
        for (const key of keys) msg += `• ${key}: ${all[key]}\n`;
        return msg;
    }

    // أوامر العرض (مختصرة)
    async handleShowItemsByType(args, type) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;
        const itemsList = Object.entries(items).filter(([id, item]) => item.type === type);
        const totalPages = Math.ceil(itemsList.length / perPage);
        if (totalPages === 0) return `❌ لا توجد عناصر من نوع ${type}`;
        if (page < 1 || page > totalPages) return `❌ الصفحة ${page} غير موجودة. إجمالي: ${totalPages}`;
        const start = (page - 1) * perPage;
        const pageItems = itemsList.slice(start, start + perPage);
        let message = `📋 ${type} - صفحة ${page}/${totalPages}\n\n`;
        pageItems.forEach(([id, item]) => {
            message += `• ${item.name} (${id})\n`;
            message += `  المستوى: ${item.level || 1}\n`;
            if (item.attack) message += `  الهجوم: ${item.attack}\n`;
            if (item.defense) message += `  الدفاع: ${item.defense}\n`;
            if (item.rarity) message += `  الندرة: ${this._translateRarity(item.rarity)}\n`;
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
        if (page < 1 || page > totalPages) return `❌ الصفحة ${page} غير موجودة. إجمالي: ${totalPages}`;
        const start = (page - 1) * perPage;
        const pageMonsters = monstersList.slice(start, start + perPage);
        let message = `👹 الوحوش - صفحة ${page}/${totalPages}\n\n`;
        pageMonsters.forEach(([id, monster]) => {
            message += `• ${monster.name} (${id})\n`;
            message += `  المستوى: ${monster.level || 1}\n`;
            message += `  الصحة: ${monster.health || monster.maxHealth || 0}\n`;
            message += `  الضرر: ${monster.damage || 0}\n`;
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
        if (page < 1 || page > totalPages) return `❌ الصفحة ${page} غير موجودة. إجمالي: ${totalPages}`;
        const start = (page - 1) * perPage;
        const pageLocations = locationsList.slice(start, start + perPage);
        let message = `📍 المواقع - صفحة ${page}/${totalPages}\n\n`;
        pageLocations.forEach(([id, location]) => {
            message += `• ${location.name || id} (${id})\n`;
            if (location.monsters) message += `  الوحوش: ${location.monsters.length}\n`;
            if (location.resources) message += `  الموارد: ${location.resources.length}\n`;
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
        if (page < 1 || page > totalPages) return `❌ الصفحة ${page} غير موجودة. إجمالي: ${totalPages}`;
        const start = (page - 1) * perPage;
        const pageResources = resourcesList.slice(start, start + perPage);
        let message = `🌿 الموارد - صفحة ${page}/${totalPages}\n\n`;
        pageResources.forEach(([id, resource]) => {
            message += `• ${resource.name} (${id})\n`;
            message += `  الندرة: ${this._translateRarity(resource.rarity || 'common')}\n`;
            if (resource.locations) message += `  المواقع: ${resource.locations.length}\n`;
            message += `\n`;
        });
        message += `📄 للتنقل: عرض_موارد [رقم]`;
        return message;
    }

    // أوامر الإضافة والحذف (مختصرة - نفس السابق)
    async handleAddWeapon(args) {
        if (args.length < 3) return '❌ الاستخدام: اضف_سلاح [اسم] [قوة] [مستوى]';
        const name = args.slice(0, -2).join(' ');
        const attack = parseInt(args[args.length - 2]);
        const level = parseInt(args[args.length - 1]);
        if (isNaN(attack) || isNaN(level)) return '❌ القوة والمستوى أرقام';
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Weapon } = await import('../../core/models/Weapon.js');
            await Weapon.updateOne({ id }, { $set: { id, name, type: 'weapon', attack, level, rarity: 'common' } }, { upsert: true });
            return `✅ تمت إضافة السلاح ${name}`;
        } catch (e) { return '❌ فشل: ' + e.message; }
    }

    async handleDeleteWeapon(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Weapon } = await import('../../core/models/Weapon.js');
            await Weapon.deleteOne({ id });
            return `✅ تم حذف السلاح ${name}`;
        } catch (e) { return '❌ فشل: ' + e.message; }
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
            await Monster.updateOne({ id }, { $set: { id, name, level, health, maxHealth: health, damage } }, { upsert: true });
            return `✅ تمت إضافة الوحش ${name}`;
        } catch (e) { return '❌ فشل: ' + e.message; }
    }

    async handleDeleteMonster(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Monster } = await import('../../core/models/Monster.js');
            await Monster.deleteOne({ id });
            return `✅ تم حذف الوحش ${name}`;
        } catch (e) { return '❌ فشل: ' + e.message; }
    }

    async handleAddResource(args) {
        if (args.length < 3) return '❌ الاستخدام: اضف_مورد [اسم] [ندرة] [موقع]';
        const name = args.slice(0, -2).join(' ');
        const rarity = args[args.length - 2];
        const location = args[args.length - 1];
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Resource } = await import('../../core/models/Resource.js');
            await Resource.updateOne({ id }, { $set: { id, name, rarity, locations: [location] } }, { upsert: true });
            return `✅ تمت إضافة المورد ${name}`;
        } catch (e) { return '❌ فشل: ' + e.message; }
    }

    async handleDeleteResource(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Resource } = await import('../../core/models/Resource.js');
            await Resource.deleteOne({ id });
            return `✅ تم حذف المورد ${name}`;
        } catch (e) { return '❌ فشل: ' + e.message; }
    }

    async handleAddTaskCommand(args, senderId) {
        if (args.length < 4) return '❌ الاستخدام: اضف_مهمة [الاسم] [النوع] [الهدف] [المكافأة]';
        const reward = parseInt(args[args.length - 1]);
        const target = parseInt(args[args.length - 2]);
        const rawType = args[args.length - 3];
        const name = args.slice(0, -3).join(' ').replace(/["']/g, '');
        if (isNaN(target) || isNaN(reward) || target <= 0 || reward <= 0) return '❌ أرقام غير صالحة.';
        const achievementSystem = this.commandHandler ? await this.commandHandler.getSystem('achievement') : null;
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';
        const type = achievementSystem._translateTaskType(rawType);
        const validTypes = ['gather', 'kill', 'craft', 'travel', 'earn_gold', 'use_stamina', 'referral', 'streak'];
        if (!validTypes.includes(type)) return `❌ النوع "${rawType}" غير صالح.`;
        await achievementSystem.addCustomTask(name, type, target, reward);
        return `✅ تم إضافة المهمة ${name}`;
    }

    async handleRemoveTaskCommand(args, senderId) {
        const taskId = args.join(' ');
        if (!taskId) return '❌ الاستخدام: حذف_مهمة [المعرف]';
        const achievementSystem = this.commandHandler ? await this.commandHandler.getSystem('achievement') : null;
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';
        const removed = await achievementSystem.removeCustomTask(taskId);
        return removed ? `✅ تم حذف المهمة: ${taskId}` : `❌ لم يتم العثور على المهمة`;
    }

    async handleListTasksCommand(args, senderId) {
        const achievementSystem = this.commandHandler ? await this.commandHandler.getSystem('achievement') : null;
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';
        const tasks = await achievementSystem.listCustomTasks();
        if (tasks.length === 0) return '📋 لا توجد مهام مخصصة.';
        let msg = `📋 المهام المخصصة (${tasks.length})\n`;
        tasks.forEach(task => {
            msg += `\n📌 ${task.name}\n   🆔 ${task.id}\n   🎯 ${achievementSystem._getTypeNameArabic(task.type)}\n   📊 ${task.target}\n   💰 ${task.reward} غولد\n`;
        });
        return msg;
    }

    findAutoResponse(message) {
        return this.autoResponseSystem.findAutoResponse(message);
    }
    }
