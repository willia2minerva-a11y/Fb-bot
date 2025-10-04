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

            // 🛠️ إصلاح: تعريف جميع الدوال قبل الربط
            this.handleStart = this.handleStart.bind(this);
            this.handleGetId = this.handleGetId.bind(this);
            this.handleGenderMale = this.handleGenderMale.bind(this);
            this.handleGenderFemale = this.handleGenderFemale.bind(this);
            this.handleSetName = this.handleSetName.bind(this);
            this.handleAdminCommands = this.handleAdminCommands.bind(this);
            this.handleApprovePlayer = this.handleApprovePlayer.bind(this);
            this.handleAddResponse = this.handleAddResponse.bind(this);
            this.handleRemoveResponse = this.handleRemoveResponse.bind(this);
            this.handleShowResponses = this.handleShowResponses.bind(this);
            this.handleStatus = this.handleStatus.bind(this);
            this.handleProfile = this.handleProfile.bind(this);
            this.handleHelp = this.handleHelp.bind(this);
            this.handleInventory = this.handleInventory.bind(this);
            this.handleMap = this.handleMap.bind(this);
            this.handleGather = this.handleGather.bind(this);
            this.handleAdventure = this.handleAdventure.bind(this);
            this.handleAttack = this.handleAttack.bind(this);
            this.handleEscape = this.handleEscape.bind(this);
            this.handleChangeName = this.handleChangeName.bind(this);
            this.handleUnknown = this.handleUnknown.bind(this);
            this.handleFixRegistration = this.handleFixRegistration.bind(this);

            // تعريف الأوامر بعد ربط الدوال
            this.commands = {
                'بدء': this.handleStart,
                'معرفي': this.handleGetId,
                'ذكر': this.handleGenderMale,
                'أنثى': this.handleGenderFemale,
                'اسمي': this.handleSetName,
                'مدير': this.handleAdminCommands,
                'موافقة_لاعب': this.handleApprovePlayer,
                'اضف_رد': this.handleAddResponse,
                'ازل_رد': this.handleRemoveResponse,
                'عرض_الردود': this.handleShowResponses,
                'حالتي': this.handleStatus,
                'بروفايلي': this.handleProfile,
                'مساعدة': this.handleHelp,
                'حقيبتي': this.handleInventory,
                'خريطة': this.handleMap,
                'تجميع': this.handleGather,
                'مغامرة': this.handleAdventure,
                'هجوم': this.handleAttack,
                'هروب': this.handleEscape,
                'تغيير_اسم': this.handleChangeName,
                'اصلاح_تسجيل': this.handleFixRegistration
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
        console.log(`🔍 حالة التسجيل للمستخدم: ${id}`);

        // التحقق من الردود التلقائية أولاً
        const autoResponse = this.autoResponseSystem.findAutoResponse(message);
        if (autoResponse) {
            console.log(`🤖 رد تلقائي على: "${message}"`);
            return autoResponse;
        }

        try {
            let player = await Player.findOne({ userId: id });

            if (!player) {
                player = await Player.createNew(id, name);
                console.log(`🎮 تم إنشاء لاعب جديد: ${player.name} (${id})`);
            }

            console.log(`📊 حالة التسجيل الحالية: ${player.registrationStatus}`);

            if (player.banned) {
                return '❌ تم حظرك من اللعبة. لا يمكنك استخدام الأوامر.';
            }

            // 🛠️ إصلاح: التحقق من حالة التسجيل بشكل صحيح
            const registrationStatus = player.registrationStatus;
            
            // إذا كان الأمر مسموحاً قبل الموافقة
            if (this.allowedBeforeApproval.includes(command)) {
                console.log(`✅ الأمر مسموح قبل التسجيل: ${command}`);
                const result = await this.commands[command](player, args, id);
                
                if (typeof result === 'string') {
                    await player.save();
                }

                return result;
            }

            // إذا لم يكمل التسجيل
            if (registrationStatus !== 'completed') {
                console.log(`⏳ اللاعب لم يكمل التسجيل بعد: ${registrationStatus}`);
                
                if (registrationStatus === 'pending') {
                    return `⏳ **حسابك قيد الانتظار للموافقة**

📝 **لإكمال التسجيل:**
1. اكتب "معرفي" للحصول على معرفك
2. أرسل المعرف للمدير
3. انتظر الموافقة

بعد الموافقة ستتم مطالبتك باختيار الجنس والاسم.`;
                } 
                else if (registrationStatus === 'approved') {
                    const step = this.registrationSystem.getRegistrationStep(id);
                    console.log(`🔍 خطوة التسجيل الحالية: ${step?.step}`);
                    
                    if (step && step.step === 'gender_selection') {
                        return `👋 **مرحباً ${player.name}!**

📝 **الخطوة التالية: اختيار الجنس**

• اكتب "ذكر" 👦 للجنس الذكري
• اكتب "أنثى" 👧 للجنس الأنثوي

سيحدد هذا مظهر بطاقة بروفايلك في اللعبة.`;
                    } 
                    else if (step && step.step === 'name_selection') {
                        return `📝 **الآن يرجى اختيار اسم إنجليزي**

⚡ **الشروط:**
• بين 3 إلى 9 أحرف
• أحرف إنجليزية فقط
• غير مستخدم من قبل

💡 **مثال:** اسمي John

اكتب "اسمي [الاسم]" لاختيار اسمك.`;
                    }
                    else {
                        // إذا لم تكن هناك خطوة محددة، نطلب اختيار الجنس
                        this.registrationSystem.registrationSteps.set(id, {
                            step: 'gender_selection',
                            player: player
                        });
                        
                        return `👋 **تمت الموافقة على حسابك!**

📝 **الرجاء اختيار جنسك:**
• اكتب "ذكر" 👦
• اكتب "أنثى" 👧`;
                    }
                }
            }

            // إذا كان مكتملاً، ننفذ الأمر بشكل طبيعي
            console.log(`✅ اللاعب مكتمل التسجيل، معالجة الأمر: ${command}`);
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

    async handleStart(player) {
        try {
            console.log('🎮 تنفيذ أمر البدء...');
            
            if (player.isPending()) {
                return this.registrationSystem.startRegistration(player.userId, player.name);
            } else if (player.isApprovedButNotCompleted()) {
                const step = this.registrationSystem.getRegistrationStep(player.userId);
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

            return `🎮 **مرحباً ${player.name} في مغارة غولد!**

📍 موقعك الحالي: ${player.currentLocation}
✨ مستواك: ${player.level}
💰 ذهبك: ${player.gold} غولد
❤️ صحتك: ${player.health}/${player.maxHealth}

اكتب "مساعدة" لرؤية الأوامر المتاحة.`;
        } catch (error) {
            console.error('❌ خطأ في handleStart:', error);
            throw error;
        }
    }

    async handleGetId(player) {
        try {
            console.log('🆔 تنفيذ أمر المعرف...');
            return `🆔 **معرفك هو:** \`${player.userId}\`

📨 **يرجى إرسال هذا المعرف إلى المدير للحصول على الموافقة.**

بعد الموافقة، ستتم مطالبتك باختيار الجنس والاسم.`;
        } catch (error) {
            console.error('❌ خطأ في handleGetId:', error);
            return '❌ حدث خطأ في جلب المعرف.';
        }
    }

    async handleGenderMale(player) {
        try {
            console.log('👦 تنفيذ أمر اختيار الجنس ذكر...');
            return await this.registrationSystem.setGender(player.userId, 'male');
        } catch (error) {
            console.error('❌ خطأ في handleGenderMale:', error);
            return '❌ حدث خطأ في اختيار الجنس.';
        }
    }

    async handleGenderFemale(player) {
        try {
            console.log('👧 تنفيذ أمر اختيار الجنس أنثى...');
            return await this.registrationSystem.setGender(player.userId, 'female');
        } catch (error) {
            console.error('❌ خطأ في handleGenderFemale:', error);
            return '❌ حدث خطأ في اختيار الجنس.';
        }
    }

    async handleSetName(player, args) {
        try {
            console.log('📝 تنفيذ أمر تعيين الاسم...');
            const name = args.join(' ');
            if (!name) {
                return '❌ يرجى تحديد اسم. مثال: اسمي John';
            }
            return await this.registrationSystem.setName(player.userId, name);
        } catch (error) {
            console.error('❌ خطأ في handleSetName:', error);
            return '❌ حدث خطأ في تعيين الاسم.';
        }
    }

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
• اصلاح_تسجيل [المعرف] - إصلاح مشاكل التسجيل

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

    async handleApprovePlayer(player, args, senderId) {
        try {
            console.log('✅ تنفيذ أمر الموافقة على اللاعب...');
            
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

    async handleStatus(player) {
        try {
            if (!player.isApproved()) {
                return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
            }
            
            console.log('📊 تنفيذ أمر الحالة...');
            return this.profileSystem.getPlayerStatus(player); 
        } catch (error) {
            console.error('❌ خطأ في handleStatus:', error);
            return `📊 **حالة ${player.name}**

✨ المستوى: ${player.level}
💰 الذهب: ${player.gold} غولد
❤️ الصحة: ${player.health}/${player.maxHealth}
📍 الموقع: ${player.currentLocation}`;
        }
    }

    async handleProfile(player) {
        try {
            if (!player.isApproved()) {
                return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
            }
            
            console.log('📋 تنفيذ أمر البروفايل...');
            
            const imagePath = await this.cardGenerator.generateCard(player);

            return {
                type: 'image',
                path: imagePath,
                caption: `📋 هذه بطاقة بروفايلك يا ${player.name}!`
            };
            
        } catch (error) {
            console.error('❌ خطأ في handleProfile:', error);
            return '❌ حدث خطأ أثناء إنشاء بطاقة البروفايل.';
        }
    }

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

    async handleInventory(player) {
        try {
            if (!player.isApproved()) {
                return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
            }
            
            console.log('🎒 تنفيذ أمر الحقيبة...');
            const result = this.profileSystem.getPlayerInventory(player); 
            console.log('✅ نتيجة الحقيبة:', result);
            return result;
        } catch (error) {
            console.error('❌ خطأ في handleInventory:', error);

            if (player.inventory.length === 0) {
                return `🎒 **حقيبة ${player.name}**\n\nالحقيبة فارغة`;
            }

            let text = `🎒 **حقيبة ${player.name}**\n\n`;
            player.inventory.forEach(item => {
                text += `• ${item.name} ×${item.quantity}\n`;
            });
            return text;
        }
    }

    async handleMap(player) {
        try {
            if (!player.isApproved()) {
                return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
            }
            
            console.log('🗺️ تنفيذ أمر الخريطة...');
            const result = this.worldMap.showMap(player);
            console.log('✅ نتيجة الخريطة:', result);
            return result;
        } catch (error) {
            console.error('❌ خطأ في handleMap:', error);
            return `🗺️ **خريطة مغارة غولد**

• القرية
• الغابة الخضراء

أنت في: ${player.currentLocation}`;
        }
    }

    async handleGather(player) {
        try {
            if (!player.isApproved()) {
                return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
            }
            
            console.log('🌿 تنفيذ أمر التجميع...');
            const result = this.gatheringSystem.gatherResources(player, player.currentLocation);
            console.log('✅ نتيجة التجميع:', result);

            if (result.error) return result.error;
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في handleGather:', error);
            return '❌ حدث خطأ أثناء جمع الموارد. حاول مرة أخرى.';
        }
    }

    async handleAdventure(player) {
        try {
            if (!player.isApproved()) {
                return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
            }
            
            console.log('⚔️ تنفيذ أمر المغامرة...');
            const result = this.battleSystem.startBattle(player, player.currentLocation);
            console.log('✅ نتيجة المغامرة:', result);

            if (result.error) return result.error;
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في handleAdventure:', error);
            return '❌ حدث خطأ أثناء بدء المغامرة. حاول مرة أخرى.';
        }
    }

    async handleAttack(player) {
        try {
            if (!player.isApproved()) {
                return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
            }
            
            console.log('🎯 تنفيذ أمر الهجوم...');
            const result = this.battleSystem.attack(player);
            console.log('✅ نتيجة الهجوم:', result);

            if (result.error) return result.error;
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في handleAttack:', error);
            return '❌ حدث خطأ أثناء الهجوم. حاول مرة أخرى.';
        }
    }

    async handleEscape(player) {
        try {
            if (!player.isApproved()) {
                return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
            }
            
            console.log('🏃‍♂️ تنفيذ أمر الهروب...');
            const result = this.battleSystem.escape(player);
            console.log('✅ نتيجة الهروب:', result);

            if (result.error) return result.error;
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في handleEscape:', error);
            return '❌ حدث خطأ أثناء الهروب. حاول مرة أخرى.';
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
                console.log('✅ تم تغيير الاسم بنجاح، سيتم الآن إرسال البطاقة المحدثة...');
                return this.handleProfile(player);
            }
            
            return result;
        } catch (error) {
            console.error('❌ خطأ في handleChangeName:', error);
            return '❌ حدث خطأ أثناء محاولة تغيير الاسم.';
        }
    }

    async handleFixRegistration(player, args, senderId) {
        try {
            const ADMIN_PSID = process.env.ADMIN_PSID;
            
            if (senderId !== ADMIN_PSID) {
                return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
            }

            let targetUserId = senderId;
            if (args.length > 0) {
                targetUserId = args[0];
            }

            const success = await this.registrationSystem.resetRegistration(targetUserId);
            
            if (success) {
                return `✅ **تم إصلاح التسجيل للمستخدم ${targetUserId}**
                
🔄 تم إعادة تعيين حالة التسجيل. يمكن للمستخدم الآن البدء من جديد بأمر "بدء".`;
            } else {
                return `❌ لم يتم العثور على لاعب بالمعرف: ${targetUserId}`;
            }
        } catch (error) {
            console.error('❌ خطأ في handleFixRegistration:', error);
            return '❌ حدث خطأ في إصلاح التسجيل.';
        }
    }

    async handleUnknown(command, player) {
        return `❓ **أمر غير معروف**: "${command}"\n\nاكتب "مساعدة" لرؤية الأوامر المتاحة.`;
    }
                }
