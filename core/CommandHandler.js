import { BattleSystem } from '../systems/battle/BattleSystem.js';
import { TravelSystem } from '../systems/world/TravelSystem.js';
import { WorldMap } from '../systems/world/WorldMap.js';
import { GatheringSystem } from '../systems/gathering/GatheringSystem.js';
import { CraftingSystem } from '../systems/crafting/CraftingSystem.js';
import { ProfileSystem } from '../systems/profile/ProfileSystem.js';
import { RegistrationSystem } from '../systems/registration/RegistrationSystem.js';
import { AutoResponseSystem } from '../systems/autoResponse/AutoResponseSystem.js';
import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js'; 

export default class CommandHandler {
    constructor() {
        console.log('🔄 تهيئة CommandHandler...');

        try {
            this.battleSystem = new BattleSystem();
            this.travelSystem = new TravelSystem();
            this.worldMap = new WorldMap(this.travelSystem);
            this.gatheringSystem = new GatheringSystem();
            this.craftingSystem = new CraftingSystem();
            this.profileSystem = new ProfileSystem();
            this.registrationSystem = new RegistrationSystem();
            this.autoResponseSystem = new AutoResponseSystem();
            this.cardGenerator = new ProfileCardGenerator(); 

            // 🆕 الأوامر الجديدة
            this.commands = {
                'بدء': this.handleStart.bind(this),
                'معرفي': this.handleGetId.bind(this),
                'ذكر': this.handleGenderMale.bind(this),
                'أنثى': this.handleGenderFemale.bind(this),
                'اسمي': this.handleSetName.bind(this),
                'مدير': this.handleAdminCommands.bind(this),
                'موافقة_لاعب': this.handleApprovePlayer.bind(this),
                'اضف_رد': this.handleAddResponse.bind(this),
                'ازل_رد': this.handleRemoveResponse.bind(this),
                'عرض_الردود': this.handleShowResponses.bind(this),
                'حالتي': this.handleStatus.bind(this),
                'بروفايلي': this.handleProfile.bind(this),
                'مساعدة': this.handleHelp.bind(this),
                'حقيبتي': this.handleInventory.bind(this),
                'خريطة': this.handleMap.bind(this),
                'تجميع': this.handleGather.bind(this),
                'مغامرة': this.handleAdventure.bind(this),
                'هجوم': this.handleAttack.bind(this),
                'هروب': this.handleEscape.bind(this),
                'تغيير_اسم': this.handleChangeName.bind(this)
            };

            this.allowedBeforeApproval = ['بدء', 'معرفي', 'مساعدة', 'ذكر', 'أنثى', 'اسمي'];
            
            console.log('✅ CommandHandler تم تهيئته بنجاح');
        } catch (error) {
            console.error('❌ فشل في تهيئة CommandHandler:', error);
            throw error;
        }
    }

    async process(sender, message) {
        const { id, name } = sender;
        const parts = message.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);

        // 🆕 التحقق من الردود التلقائية أولاً
        const autoResponse = this.autoResponseSystem.findAutoResponse(message);
        if (autoResponse) {
            console.log(`🤖 رد تلقائي على: "${message}"`);
            return autoResponse;
        }

        try {
            let player = await Player.findOne({ userId: id });

            if (!player) {
                player = await Player.createNew(id, name);
            }

            if (player.banned) {
                return '❌ تم حظرك من اللعبة. لا يمكنك استخدام الأوامر.';
            }

            // التحقق من حالة التسجيل
            if (!this.allowedBeforeApproval.includes(command) && !player.isApproved()) {
                if (player.isPending()) {
                    return `⏳ **حسابك قيد الانتظار للموافقة**

يرجى استخدام أمر "معرفي" للحصول على معرفك وإرساله إلى المدير للحصول على الموافقة.`;
                } else if (player.isApprovedButNotCompleted()) {
                    const step = this.registrationSystem.getRegistrationStep(id);
                    if (step && step.step === 'gender_selection') {
                        return `👋 **مرحباً ${player.name}!**

الرجاء اختيار جنسك:
• اكتب "ذكر" 👦
• اكتب "أنثى" 👧`;
                    } else if (step && step.step === 'name_selection') {
                        return `📝 **الآن يرجى اختيار اسم إنجليزي**

اكتب "اسمي [الاسم]" بين 3 إلى 9 أحرف إنجليزية
مثال: اسمي John`;
                    }
                }
            }

            if (this.commands[command]) {
                const result = await this.commands[command](player, args, id);
                
                if (typeof result === 'string') {
                    await player.save();
                }

                return result;
            } else {
                return await this.handleUnknown(command, player);
            }
        } catch (error) {
            console.error('❌ خطأ في معالجة الأمر:', error);
            return `❌ حدث خطأ أثناء معالجة طلبك: ${error.message}`;
        }
    }

    // 🆕 أمر عرض أوامر المدير
    async handleAdminCommands(player, args, senderId) {
        try {
            const ADMIN_PSID = process.env.ADMIN_PSID;
            
            if (senderId !== ADMIN_PSID) {
                return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
            }

            return `👑 **أوامر المدير - مغارة غولد**

🔄 **إدارة اللاعبين:**
• موافقة_لاعب - عرض/موافقة اللاعبين المنتظرين
• موافقة_لاعب [المعرف] - الموافقة على لاعب محدد
• تغيير_اسم [الاسم] - تغيير اسمك
• تغيير_اسم [المعرف] [الاسم] - تغيير اسم لاعب آخر

🤖 **إدارة الردود التلقائية:**
• اضف_رد [المفتاح] [الرد] - إضافة رد تلقائي
• ازل_رد [المفتاح] - إزالة رد تلقائي  
• عرض_الردود - عرض جميع الردود

📊 **معلومات النظام:**
• مدير - عرض هذه القائمة

💡 **مثال:**
اضف_رد شكراً شكراً لك! أسعدني مساعدتك 😊`;
        } catch (error) {
            console.error('❌ خطأ في handleAdminCommands:', error);
            return '❌ حدث خطأ في عرض أوامر المدير.';
        }
    }

    // 🆕 أمر إضافة رد تلقائي
    async handleAddResponse(player, args, senderId) {
        try {
            const ADMIN_PSID = process.env.ADMIN_PSID;
            
            if (senderId !== ADMIN_PSID) {
                return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
            }

            if (args.length < 2) {
                return '❌ صيغة الأمر: اضف_رد [المفتاح] [الرد]\nمثال: اضف_رد شكراً شكراً لك! 😊';
            }

            const trigger = args[0];
            const response = args.slice(1).join(' ');

            this.autoResponseSystem.addResponse(trigger, response);

            return `✅ **تم إضافة رد تلقائي بنجاح!**

🔑 المفتاح: ${trigger}
💬 الرد: ${response}

سيتم الآن الرد تلقائياً عندما يكتب أي لاعب: "${trigger}"`;
        } catch (error) {
            console.error('❌ خطأ في handleAddResponse:', error);
            return '❌ حدث خطأ في إضافة الرد التلقائي.';
        }
    }

    // 🆕 أمر إزالة رد تلقائي
    async handleRemoveResponse(player, args, senderId) {
        try {
            const ADMIN_PSID = process.env.ADMIN_PSID;
            
            if (senderId !== ADMIN_PSID) {
                return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
            }

            if (args.length === 0) {
                return '❌ يرجى تحديد المفتاح المراد إزالته.\nمثال: ازل_رد شكراً';
            }

            const trigger = args[0];
            const success = this.autoResponseSystem.removeResponse(trigger);

            if (success) {
                return `✅ **تم إزالة الرد التلقائي بنجاح!**

🔑 المفتاح: ${trigger}
❌ لم يعد النظام يرد على هذا النص تلقائياً.`;
            } else {
                return `❌ لم يتم العثور على رد تلقائي للمفتاح: ${trigger}`;
            }
        } catch (error) {
            console.error('❌ خطأ في handleRemoveResponse:', error);
            return '❌ حدث خطأ في إزالة الرد التلقائي.';
        }
    }

    // 🆕 أمر عرض جميع الردود التلقائية
    async handleShowResponses(player, args, senderId) {
        try {
            const ADMIN_PSID = process.env.ADMIN_PSID;
            
            if (senderId !== ADMIN_PSID) {
                return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
            }

            const responses = this.autoResponseSystem.getAllResponses();
            const responseKeys = Object.keys(responses);

            if (responseKeys.length === 0) {
                return '🤖 **لا توجد ردود تلقائية مضافة حالياً.**';
            }

            let message = '🤖 **الردود التلقائية الحالية:**\n\n';
            
            responseKeys.forEach((key, index) => {
                const response = responses[key];
                const preview = response.length > 50 ? response.substring(0, 50) + '...' : response;
                message += `${index + 1}. 🔑 **${key}**\n   💬 ${preview}\n\n`;
            });

            message += `📊 **الإجمالي:** ${responseKeys.length} رد تلقائي`;

            return message;
        } catch (error) {
            console.error('❌ خطأ في handleShowResponses:', error);
            return '❌ حدث خطأ في عرض الردود التلقائية.';
        }
    }

    // تحديث أمر المساعدة
    async handleHelp(player, args, senderId) {
        try {
            const ADMIN_PSID = process.env.ADMIN_PSID;
            const isAdmin = senderId === ADMIN_PSID;
            
            let helpMessage = `🆘 **أوامر مغارة غولد**

🎯 **الأساسية:**
بدء - بدء اللعبة أو متابعة التسجيل
معرفي - عرض معرفك للمدير
مساعدة - عرض هذه القائمة`;

            if (player.isApproved()) {
                helpMessage += `

🗺️ **الاستكشاف:**
خريطة - عرض الخريطة
تجميع - جمع الموارد
مغامرة - بدء مغامرة

🎒 **الإدارة:**
حالتي - عرض حالتك
بروفايلي - بطاقة البروفايل
حقيبتي - عرض المحتويات

⚔️ **القتال:**
هجوم - الهجوم في المعركة
هروب - الهروب من المعركة`;
            }

            if (isAdmin) {
                helpMessage += `

👑 **أوامر المدير:**
مدير - عرض أوامر المدير الكاملة`;
            }

            return helpMessage;
        } catch (error) {
            console.error('❌ خطأ في handleHelp:', error);
            throw error;
        }
    }

    // باقي الدوال بدون تغيير (handleStart, handleGetId, etc.)
    // ... [نفس الدوال السابقة بدون تغيير]
    
    async handleApprovePlayer(player, args, senderId) {
        try {
            const ADMIN_PSID = process.env.ADMIN_PSID;
            
            if (senderId !== ADMIN_PSID) {
                return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
            }

            if (args.length === 0) {
                const pendingPlayers = await this.registrationSystem.getPendingPlayers();
                if (pendingPlayers.length === 0) {
                    return '✅ لا يوجد لاعبين بانتظار الموافقة.';
                }

                let message = '⏳ **اللاعبين المنتظرين للموافقة:**\n\n';
                pendingPlayers.forEach((p, index) => {
                    message += `${index + 1}. ${p.name} - \`${p.userId}\` - ${new Date(p.createdAt).toLocaleDateString('ar-SA')}\n`;
                });
                
                message += '\nللموافقة، اكتب: موافقة_لاعب [المعرف]';
                return message;
            }

            const targetUserId = args[0];
            return await this.registrationSystem.approvePlayer(targetUserId, senderId);
        } catch (error) {
            console.error('❌ خطأ في handleApprovePlayer:', error);
            return '❌ حدث خطأ في الموافقة على اللاعب.';
        }
    }

    async handleChangeName(player, args, senderId) {
        try {
            const ADMIN_PSID = process.env.ADMIN_PSID;
            
            if (senderId !== ADMIN_PSID) {
                return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
            }

            const result = await this.profileSystem.changeName(player, args, senderId);
            await player.save();
            
            if (typeof result === 'string' && result.includes('تم تحديث اسم اللاعب')) {
                return this.handleProfile(player);
            }
            
            return result;
        } catch (error) {
            console.error('❌ خطأ في handleChangeName:', error);
            return '❌ حدث خطأ أثناء محاولة تغيير الاسم.';
        }
    }

    async handleUnknown(command, player) {
        return `❓ **أمر غير معروف**: "${command}"\n\nاكتب "مساعدة" لرؤية الأوامر المتاحة.`;
    }
              }
