import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js';
import { AdminSystem } from '../systems/admin/AdminSystem.js';

// أنظمة بديلة محسنة
async function getSystem(systemName) {
    try {
        const systems = {
            'battle': '../systems/battle/BattleSystem.js',
            'world': '../systems/world/WorldMap.js',
            'gathering': '../systems/gathering/GatheringSystem.js',
            'profile': '../systems/profile/ProfileSystem.js',
            'registration': '../systems/registration/RegistrationSystem.js',
            'autoResponse': '../systems/autoResponse/AutoResponseSystem.js',
            'travel': '../systems/world/TravelSystem.js'
        };

        if (systems[systemName]) {
            const module = await import(systems[systemName]);
            const SystemClass = Object.values(module)[0];
            return new SystemClass();
        }
    } catch (error) {
        console.log(`⚠️ نظام ${systemName} غير متاح، استخدام بديل`);
    }

    // أنظمة بديلة محسنة
    const fallbackSystems = {
        'battle': class {
            startBattle() { return { error: null, message: '⚔️ **بدأت المعركة!**\n\nاستخدم "هجوم" للهجوم أو "هروب" للهروب.' }; }
            attack() { return { error: null, message: '🎯 **هجوم ناجح!**\n\nلقد هزمت الوحش!' }; }
            escape() { return { error: null, message: '🏃‍♂️ **هروب ناجح!**\n\nلقد هربت من المعركة.' }; }
        },
        'world': class {
            showMap(player) { 
                const location = player.currentLocation || 'القرية';
                return `🗺️ **خريطة مغارة غولد**\n\nأنت في: **${location}**`; 
            }
        },
        'gathering': class {
            gatherResources() { return { error: null, message: '🌿 **جمعت الموارد!**\n\n• خشب ×3\n• حجر ×2' }; }
        },
        'profile': class {
            getPlayerStatus(player) { 
                return `📊 **حالة ${player.name}**\nالمستوى: ${player.level}\nالذهب: ${player.gold}\nالصحة: ${player.health}/${player.maxHealth}`; 
            }
            getPlayerInventory(player) { 
                if (!player.inventory || player.inventory.length === 0) {
                    return `🎒 **حقيبة ${player.name}**\n\nالحقيبة فارغة`;
                }
                let text = `🎒 **حقيبة ${player.name}**\n\n`;
                player.inventory.forEach(item => {
                    text += `• ${item.name} ×${item.quantity}\n`;
                });
                return text;
            }
            async changeName() { return '❌ نظام تغيير الأسماء غير متاح حالياً'; }
        },
        'registration': class {
            constructor() { this.registrationSteps = new Map(); }
            async startRegistration() { 
                return { success: true, message: '🎮 **مرحباً في مغارة غولد!**', step: 'waiting_approval' };
            }
            async approvePlayer() { 
                return { success: true, message: '✅ تمت الموافقة على اللاعب' };
            }
            async setGender() { 
                return { success: true, message: '✅ تم اختيار الجنس' };
            }
            async setName() { 
                return { success: true, message: '✅ تم تعيين الاسم' };
            }
            getRegistrationStep() { return null; }
            async getPendingPlayers() { return []; }
            async resetRegistration() { return true; }
        },
        'autoResponse': class {
            constructor() { 
                this.responses = {
                    'مرحبا': '🎮 أهلاً بك في مغارة غولد!',
                    'شكرا': '😊 العفو!',
                    'اهلا': '👋 أهلاً وسهلاً!'
                };
            }
            findAutoResponse(message) { return this.responses[message.toLowerCase()] || null; }
            addResponse(trigger, response) { 
                this.responses[trigger.toLowerCase()] = response;
                console.log(`✅ تم إضافة رد تلقائي: ${trigger}`);
            }
            removeResponse(trigger) { 
                const lowerTrigger = trigger.toLowerCase();
                if (this.responses[lowerTrigger]) {
                    delete this.responses[lowerTrigger];
                    return true;
                }
                return false;
            }
            getAllResponses() { return this.responses; }
        },
        'travel': class {
            // نظام سفر بديل
        }
    };

    return new (fallbackSystems[systemName])();
}

export default class CommandHandler {
    constructor() {
        console.log('🔄 تهيئة CommandHandler...');

        try {
            this.adminSystem = new AdminSystem();
            this.cardGenerator = new ProfileCardGenerator();
            this.systems = {};

            // أوامر اللعبة الأساسية
            this.commands = {
                // التسجيل
                'بدء': this.handleStart.bind(this),
                'معرفي': this.handleGetId.bind(this),
                'ذكر': this.handleGenderMale.bind(this),
                'أنثى': this.handleGenderFemale.bind(this),
                'اسمي': this.handleSetName.bind(this),

                // المعلومات
                'مساعدة': this.handleHelp.bind(this),
                'حالتي': this.handleStatus.bind(this),
                'بروفايلي': this.handleProfile.bind(this),
                'حقيبتي': this.handleInventory.bind(this),

                // الاستكشاف
                'خريطة': this.handleMap.bind(this),
                'تجميع': this.handleGather.bind(this),
                'مغامرة': this.handleAdventure.bind(this),
                'هجوم': this.handleAttack.bind(this),
                'هروب': this.handleEscape.bind(this)
            };

            this.allowedBeforeApproval = ['بدء', 'معرفي', 'مساعدة', 'ذكر', 'أنثى', 'اسمي'];
            
            console.log('✅ CommandHandler تم تهيئته بنجاح');
        } catch (error) {
            console.error('❌ فشل في تهيئة CommandHandler:', error);
            throw error;
        }
    }

    async getSystem(systemName) {
        if (!this.systems[systemName]) {
            this.systems[systemName] = await getSystem(systemName);
        }
        return this.systems[systemName];
    }

    async process(sender, message) {
        const { id, name } = sender;
        const parts = message.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);

        // 🎯 تحقق من هوية المدير
        const isAdmin = this.adminSystem.isAdmin(id);
        if (isAdmin) {
            console.log('🎯 🔥 تم التعرف على المدير!');
        }

        // التحقق من الردود التلقائية أولاً
        const autoResponseSystem = await this.getSystem('autoResponse');
        const autoResponse = autoResponseSystem.findAutoResponse(message);
        if (autoResponse) {
            console.log(`🤖 رد تلقائي على: "${message}"`);
            return autoResponse;
        }

        try {
            let player = await Player.findOne({ userId: id });

            if (!player) {
                player = await Player.createNew(id, name);
                console.log(`🎮 تم إنشاء لاعب جديد: ${player.name}`);
            }

            // 🎯 إذا كان مديراً، نتأكد من تفعيله
            if (isAdmin && player.registrationStatus !== 'completed') {
                player = await this.adminSystem.setupAdminPlayer(id, name);
                console.log(`🎯 تم تفعيل المدير: ${player.name}`);
            }

            console.log(`📊 حالة التسجيل: ${player.registrationStatus}`);

            if (player.banned) {
                return '❌ تم حظرك من اللعبة.';
            }

            // 🎯 معالجة أوامر المدير أولاً
            if (isAdmin && this.adminSystem.getAdminCommands()[command]) {
                console.log(`👑 تنفيذ أمر مدير: ${command}`);
                const result = await this.adminSystem.handleAdminCommand(command, args, id, player);
                await player.save();
                return result;
            }

            // معالجة الأوامر العادية
            if (this.commands[command]) {
                // التحقق من التسجيل للأوامر التي تتطلب ذلك
                if (!this.allowedBeforeApproval.includes(command) && !player.isApproved()) {
                    return this.getRegistrationMessage(player);
                }

                const result = await this.commands[command](player, args, id);
                
                if (typeof result === 'string') {
                    await player.save();
                }

                return result;
            }

            return await this.handleUnknown(command, player);

        } catch (error) {
            console.error('❌ خطأ في معالجة الأمر:', error);
            
            // معالجة أخطاء قاعدة البيانات بشكل خاص
            if (error.code === 11000) {
                console.log('🔄 معالجة خطأ duplicate key...');
                // حاول العثور على اللاعب الموجود
                const existingPlayer = await Player.findOne({ userId: id });
                if (existingPlayer) {
                    console.log('✅ وجد لاعب موجود، إعادة المحاولة...');
                    // أعد المعالجة مع اللاعب الموجود
                    return this.process(sender, message);
                }
                return '❌ حدث خطأ في النظام. يرجى المحاولة مرة أخرى.';
            }
            
            return `❌ حدث خطأ: ${error.message}`;
        }
    }

    getRegistrationMessage(player) {
        const status = player.registrationStatus;
        
        if (status === 'pending') {
            return `⏳ **حسابك قيد الانتظار للموافقة**

📝 اكتب "معرفي" للحصول على معرفك ثم أرسله للمدير.`;
        } 
        else if (status === 'approved') {
            return `👋 **تمت الموافقة على حسابك!**

📝 الرجاء إكمال التسجيل:
• اكتب "ذكر" أو "أنثى" لاختيار الجنس
• ثم اكتب "اسمي [الاسم]" لاختيار اسم إنجليزي`;
        }
        
        return '❌ يرجى إكمال عملية التسجيل أولاً.';
    }

    // ========== دوال معالجة الأوامر ==========

    async handleStart(player) {
        try {
            if (player.isPending()) {
                const registrationSystem = await this.getSystem('registration');
                return registrationSystem.startRegistration(player.userId, player.name);
            } 
            else if (player.isApprovedButNotCompleted()) {
                const registrationSystem = await this.getSystem('registration');
                const step = registrationSystem.getRegistrationStep(player.userId);
                
                if (step && step.step === 'gender_selection') {
                    return `👋 **مرحباً ${player.name}!**

الرجاء اختيار جنسك:
• اكتب "ذكر" 👦
• اكتب "أنثى" 👧`;
                } 
                else if (step && step.step === 'name_selection') {
                    return `📝 **الآن يرجى اختيار اسم إنجليزي**

اكتب "اسمي [الاسم]" بين 3 إلى 9 أحرف إنجليزية
مثال: اسمي John`;
                }
            }

            return `🎮 **مرحباً ${player.name} في مغارة غولد!**

📍 موقعك: ${player.currentLocation}
✨ مستواك: ${player.level}
💰 ذهبك: ${player.gold}

اكتب "مساعدة" لرؤية الأوامر.`;
        } catch (error) {
            return '❌ حدث خطأ في بدء اللعبة.';
        }
    }

    async handleGetId(player) {
        return `🆔 **معرفك هو:** \`${player.userId}\`

📨 أرسل هذا المعرف للمدير للحصول على الموافقة.`;
    }

    async handleGenderMale(player) {
        const registrationSystem = await this.getSystem('registration');
        return await registrationSystem.setGender(player.userId, 'male');
    }

    async handleGenderFemale(player) {
        const registrationSystem = await this.getSystem('registration');
        return await registrationSystem.setGender(player.userId, 'female');
    }

    async handleSetName(player, args) {
        const name = args.join(' ');
        if (!name) return '❌ يرجى تحديد اسم. مثال: اسمي John';
        
        const registrationSystem = await this.getSystem('registration');
        return await registrationSystem.setName(player.userId, name);
    }

    async handleHelp(player, args, senderId) {
        const isAdmin = this.adminSystem.isAdmin(senderId);
        
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
    }

    async handleStatus(player) {
        if (!player.isApproved()) {
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            const profileSystem = await this.getSystem('profile');
            // 🛠️ إصلاح: التحقق من وجود الدالة قبل استدعائها
            if (profileSystem && typeof profileSystem.getPlayerStatus === 'function') {
                return profileSystem.getPlayerStatus(player);
            } else {
                // استخدام بديل إذا لم تكن الدالة موجودة
                return `📊 **حالة ${player.name}**
المستوى: ${player.level}
الذهب: ${player.gold}
الصحة: ${player.health}/${player.maxHealth}
الموقع: ${player.currentLocation}`;
            }
        } catch (error) {
            console.error('❌ خطأ في handleStatus:', error);
            return `📊 **حالة ${player.name}**
المستوى: ${player.level}
الذهب: ${player.gold}
الصحة: ${player.health}/${player.maxHealth}`;
        }
    }

    async handleProfile(player) {
        if (!player.isApproved()) {
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            const imagePath = await this.cardGenerator.generateCard(player);
            return {
                type: 'image',
                path: imagePath,
                caption: `📋 بطاقة بروفايلك يا ${player.name}!`
            };
        } catch (error) {
            return '❌ حدث خطأ في إنشاء البطاقة.';
        }
    }

    async handleInventory(player) {
        if (!player.isApproved()) {
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            const profileSystem = await this.getSystem('profile');
            // 🛠️ إصلاح: التحقق من وجود الدالة قبل استدعائها
            if (profileSystem && typeof profileSystem.getPlayerInventory === 'function') {
                return profileSystem.getPlayerInventory(player);
            } else {
                // استخدام بديل إذا لم تكن الدالة موجودة
                if (!player.inventory || player.inventory.length === 0) {
                    return `🎒 **حقيبة ${player.name}**\n\nالحقيبة فارغة`;
                }
                let text = `🎒 **حقيبة ${player.name}**\n\n`;
                player.inventory.forEach(item => {
                    text += `• ${item.name} ×${item.quantity}\n`;
                });
                return text;
            }
        } catch (error) {
            console.error('❌ خطأ في handleInventory:', error);
            return `🎒 **حقيبة ${player.name}**\n\nحدث خطأ في عرض المحتويات.`;
        }
    }

    async handleMap(player) {
        if (!player.isApproved()) {
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            const worldSystem = await this.getSystem('world');
            // 🛠️ إصلاح: استخدام showMap بشكل آمن
            if (worldSystem && typeof worldSystem.showMap === 'function') {
                return worldSystem.showMap(player);
            } else {
                return `🗺️ **خريطة مغارة غولد**\n\nأنت في: ${player.currentLocation || 'القرية'}`;
            }
        } catch (error) {
            console.error('❌ خطأ في handleMap:', error);
            return `🗺️ **خريطة مغارة غولد**\n\nأنت في: ${player.currentLocation || 'القرية'}`;
        }
    }

    async handleGather(player) {
        if (!player.isApproved()) {
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            const gatheringSystem = await this.getSystem('gathering');
            const result = gatheringSystem.gatherResources(player, player.currentLocation);
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في handleGather:', error);
            return '❌ حدث خطأ أثناء جمع الموارد.';
        }
    }

    async handleAdventure(player) {
        if (!player.isApproved()) {
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            const battleSystem = await this.getSystem('battle');
            const result = battleSystem.startBattle(player, player.currentLocation);
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في handleAdventure:', error);
            return '❌ حدث خطأ أثناء بدء المغامرة.';
        }
    }

    async handleAttack(player) {
        if (!player.isApproved()) {
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            const battleSystem = await this.getSystem('battle');
            const result = battleSystem.attack(player);
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في handleAttack:', error);
            return '❌ حدث خطأ أثناء الهجوم.';
        }
    }

    async handleEscape(player) {
        if (!player.isApproved()) {
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            const battleSystem = await this.getSystem('battle');
            const result = battleSystem.escape(player);
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في handleEscape:', error);
            return '❌ حدث خطأ أثناء الهروب.';
        }
    }

    async handleUnknown(command, player) {
        return `❓ أمر غير معروف: "${command}"\nاكتب "مساعدة" للقائمة.`;
    }
                }
