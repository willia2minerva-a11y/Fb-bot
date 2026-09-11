// systems/permissions/PermissionSystem.js
import Player from '../../core/Player.js';

export class PermissionSystem {
    constructor() {
        // ✅ أنواع الصلاحيات المتاحة
        this.PERMISSION_TYPES = {
            'full_admin': 'مدير كامل',
            'approve': 'موافقة على اللاعبين',
            'ban': 'حظر ورفع حظر',
            'economy': 'إدارة الاقتصاد',
            'tasks': 'إدارة المهام',
            'give': 'إعطاء الموارد',
            'content': 'إدارة المحتوى',
            'jail': 'السجن والإطلاق',
            'modify': 'تعديل الإحصائيات'
        };

        // ✅ نطاق IDs
        this.ADMIN_ID_MIN = 1000;
        this.ADMIN_ID_MAX = 1099;
        this.PLAYER_ID_MIN = 1100;
        this.PLAYER_ID_MAX = 9999;

        console.log('🔐 نظام الصلاحيات تم تهيئته');
    }

    // ✅ فحص صلاحية
    async hasPermission(userId, permissionType) {
        try {
            const player = await Player.findOne({ userId });
            if (!player) return false;
            
            // إذا كان في ENV = مدير كامل
            const ADMIN_PSID = process.env.ADMIN_PSID;
            const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
            const rootAdmins = [
                ADMIN_PSID,
                ADMIN_TELEGRAM_ID ? `tg_${ADMIN_TELEGRAM_ID}` : null
            ].filter(Boolean);
            
            if (rootAdmins.includes(userId)) return true;

            // فحص من قاعدة البيانات
            return player.hasPermission(permissionType);
        } catch (error) {
            console.error('❌ خطأ في فحص الصلاحية:', error);
            return false;
        }
    }

    // ✅ الحصول على معرف مدير جديد (1000-1099)
    async getNextAdminId() {
        const lastId = await Player.getLastAdminNumericId();
        const nextId = lastId + 1;

        if (nextId > this.ADMIN_ID_MAX) {
            throw new Error(`تم الوصول للحد الأقصى من المدراء (${this.ADMIN_ID_MAX})`);
        }

        return nextId.toString();
    }

    // ✅ إعطاء صلاحية
    async grantPermission(targetUserId, permissionType, grantedBy, durationHours = null) {
        try {
            if (!this.PERMISSION_TYPES[permissionType]) {
                return { error: `❌ نوع الصلاحية "${permissionType}" غير صالح.` };
            }

            const target = await Player.findOne({ userId: targetUserId });
            if (!target) return { error: '❌ اللاعب غير موجود.' };

            // ✅ إذا كانت full_admin، حوّل ID إلى نطاق المديرين
            let idChanged = false;
            let oldId = target.playerId;

            if (permissionType === 'full_admin') {
                // فحص إن كان لديه ID مدير بالفعل
                const isAdminId = /^\d+$/.test(target.playerId);
                
                if (!isAdminId) {
                    // نحتاج تحويله لمدير
                    const newAdminId = await this.getNextAdminId();
                    target.originalPlayerId = target.playerId;
                    target.playerId = newAdminId;
                    idChanged = true;
                }
            }

            // فحص إن كانت الصلاحية موجودة
            const existingPerm = target.adminPermissions.find(p => p.type === permissionType);
            if (existingPerm) {
                // تحديث الصلاحية الموجودة
                existingPerm.grantedBy = grantedBy;
                existingPerm.grantedAt = new Date();
                existingPerm.expiresAt = durationHours ? new Date(Date.now() + durationHours * 60 * 60 * 1000) : null;
            } else {
                // إضافة صلاحية جديدة
                target.adminPermissions.push({
                    type: permissionType,
                    grantedBy,
                    grantedAt: new Date(),
                    expiresAt: durationHours ? new Date(Date.now() + durationHours * 60 * 60 * 1000) : null
                });
            }

            await target.save();

            const typeName = this.PERMISSION_TYPES[permissionType];
            let msg = `✅ تم منح الصلاحية\n\n`;
            msg += `👤 اللاعب: ${target.name}\n`;
            msg += `🔐 الصلاحية: ${typeName}\n`;
            msg += `⏰ المدة: ${durationHours ? `${durationHours} ساعة` : 'دائمة'}`;
            
            if (idChanged) {
                msg += `\n\n🎯 تم تحويل ID من ${oldId} إلى ${target.playerId}`;
            }

            return { success: true, message: msg };
        } catch (error) {
            console.error('❌ خطأ في منح الصلاحية:', error);
            return { error: `❌ حدث خطأ: ${error.message}` };
        }
    }

    // ✅ إزالة صلاحية محددة
    async revokePermission(targetUserId, permissionType) {
        try {
            const target = await Player.findOne({ userId: targetUserId });
            if (!target) return { error: '❌ اللاعب غير موجود.' };

            const beforeCount = target.adminPermissions.length;
            target.adminPermissions = target.adminPermissions.filter(p => p.type !== permissionType);

            if (target.adminPermissions.length === beforeCount) {
                return { error: `❌ اللاعب لا يملك الصلاحية "${this.PERMISSION_TYPES[permissionType] || permissionType}".` };
            }

            await target.save();

            const typeName = this.PERMISSION_TYPES[permissionType] || permissionType;
            return { success: true, message: `✅ تم إزالة صلاحية ${typeName} من ${target.name}.` };
        } catch (error) {
            return { error: `❌ حدث خطأ: ${error.message}` };
        }
    }

    // ✅ إزالة كل الصلاحيات
    async revokeAllPermissions(targetUserId) {
        try {
            const target = await Player.findOne({ userId: targetUserId });
            if (!target) return { error: '❌ اللاعب غير موجود.' };

            if (!target.adminPermissions || target.adminPermissions.length === 0) {
                return { error: '❌ اللاعب ليس لديه صلاحيات.' };
            }

            const oldPlayerId = target.playerId;
            const oldAdminId = target.originalPlayerId;

            target.adminPermissions = [];

            // ✅ إعادة ID الأصلي إن كان موجوداً
            if (target.originalPlayerId) {
                target.playerId = target.originalPlayerId;
                target.originalPlayerId = null;
            }

            await target.save();

            let msg = `✅ تم إزالة كل الصلاحيات من ${target.name}.`;
            if (oldAdminId) {
                msg += `\n🎯 تم إعادة ID من ${oldPlayerId} إلى ${target.playerId}`;
            }

            return { success: true, message: msg };
        } catch (error) {
            return { error: `❌ حدث خطأ: ${error.message}` };
        }
    }

    // ✅ عرض صلاحيات لاعب
    async showPlayerPermissions(targetUserId) {
        try {
            const target = await Player.findOne({ userId: targetUserId });
            if (!target) return { error: '❌ اللاعب غير موجود.' };

            const activePerms = target.getActivePermissions();

            if (activePerms.length === 0) {
                return { message: `👤 ${target.name}\n\n❌ ليس لديه أي صلاحيات.` };
            }

            let msg = `🔐 صلاحيات ${target.name}\n\n`;
            msg += `🆔 ID: ${target.playerId}\n`;
            if (target.originalPlayerId) {
                msg += `📌 ID الأصلي: ${target.originalPlayerId}\n`;
            }
            msg += `\n`;

            activePerms.forEach(p => {
                const typeName = this.PERMISSION_TYPES[p.type] || p.type;
                const expires = p.expiresAt 
                    ? `⏰ تنتهي: ${new Date(p.expiresAt).toLocaleString('ar-EG')}`
                    : '♾️ دائمة';
                msg += `• ${typeName}\n  ${expires}\n`;
            });

            return { message: msg };
        } catch (error) {
            return { error: `❌ حدث خطأ: ${error.message}` };
        }
    }

    // ✅ قائمة كل المدراء
    async showAllAdmins() {
        try {
            const admins = await Player.find({
                'adminPermissions.0': { $exists: true }
            }).select('name userId playerId originalPlayerId adminPermissions');

            if (admins.length === 0) {
                return { message: '👑 لا يوجد مدراء حالياً.' };
            }

            // فلترة المدراء الذين لديهم صلاحيات فعّالة
            const activeAdmins = admins.filter(a => a.getActivePermissions().length > 0);

            if (activeAdmins.length === 0) {
                return { message: '👑 لا يوجد مدراء نشطون حالياً.' };
            }

            let msg = `👑 قائمة المدراء (${activeAdmins.length})\n\n`;

            activeAdmins.forEach((admin, index) => {
                const perms = admin.getActivePermissions();
                const hasFullAdmin = perms.some(p => p.type === 'full_admin');
                const icon = hasFullAdmin ? '👑' : '🔐';

                msg += `${index + 1}. ${icon} ${admin.name}\n`;
                msg += `   🆔 ${admin.playerId}\n`;
                msg += `   📊 ${perms.length} صلاحية\n`;
            });

            return { message: msg };
        } catch (error) {
            return { error: `❌ حدث خطأ: ${error.message}` };
        }
    }

    // ✅ فحص إذا كان المستخدم جذري (من ENV)
    isRootAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
        const rootAdmins = [
            ADMIN_PSID,
            ADMIN_TELEGRAM_ID ? `tg_${ADMIN_TELEGRAM_ID}` : null
        ].filter(Boolean);
        return rootAdmins.includes(userId);
    }

    // ✅ الحصول على اسم الصلاحية بالعربية
    getPermissionName(type) {
        return this.PERMISSION_TYPES[type] || type;
    }

    // ✅ الحصول على قائمة كل الصلاحيات
    getAllPermissionTypes() {
        return Object.keys(this.PERMISSION_TYPES);
    }
}
