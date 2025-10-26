// CommandHandler.js

import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js';
import { AdminSystem } from '../systems/admin/AdminSystem.js';
import { items } from '../data/items.js';
import { locations } from '../data/locations.js';

// أنظمة بديلة محسنة (Fallbacks)
async function getSystem(systemName) {
    try {  
        const systems = {  
            'battle': '../systems/battle/BattleSystem.js',  
            'world': '../systems/world/WorldMap.js',  
            'gathering': '../systems/gathering/GatheringSystem.js',  
            'profile': '../systems/profile/ProfileSystem.js',  
            'registration': '../systems/registration/RegistrationSystem.js',  
            'autoResponse': '../systems/autoResponse/AutoResponseSystem.js',   
            'travel': '../systems/world/TravelSystem.js',  
            'crafting': '../systems/crafting/CraftingSystem.js',
            'furnace': '../systems/furnace/FurnaceSystem.js',
            'transaction': '../systems/economy/TransactionSystem.js',
            'gate': '../systems/world/GateSystem.js' // 🆕 نظام البوابات الجديد
        };  

        if (systems[systemName]) {  
            const module = await import(systems[systemName]);  
            const SystemClass = module.default || Object.values(module)[0];  
            if (SystemClass) {
                console.log(`✅ تم تحميل النظام: ${systemName}`);
                return new SystemClass();  
            }
        }  
    } catch (error) {  
        console.log(`⚠️ System ${systemName} not available:`, error.message);  
        return null;
    }
}

export default class CommandHandler {

    constructor() {  
        console.log('🔄 تهيئة CommandHandler...');  

        try {  
            this.adminSystem = new AdminSystem();  
            this.cardGenerator = new ProfileCardGenerator();  
            this.systems = {};  
              
            // 🆕 خريطة الترجمة الشاملة (للعناصر والموارد والمواقع)  
            this.ARABIC_ITEM_MAP = this._createArabicItemMap();  

            // أوامر اللعبة الأساسية  
            this.commands = {  
                // 🆕 أوامر القوائم المنظمة
                'مساعدة': this.handleHelp.bind(this),  
                'اوامر': this.handleHelp.bind(this),
                'رئيسية': this.handleMainMenu.bind(this),
                'الرئيسية': this.handleMainMenu.bind(this),
                '1': this.handleMenu1.bind(this),
                '2': this.handleMenu2.bind(this), 
                '3': this.handleMenu3.bind(this),
                '4': this.handleMenu4.bind(this),
                '5': this.handleMenu5.bind(this),
                '6': this.handleMenu6.bind(this),
                '7': this.handleMenu7.bind(this), // 🆕 قائمة البوابات
                'الأساسية': this.handleMenu1.bind(this),
                'الاستكشاف': this.handleMenu2.bind(this),
                'القتال': this.handleMenu3.bind(this),
                'الصناعة': this.handleMenu4.bind(this),
                'المعلومات': this.handleMenu5.bind(this),
                'الاقتصاد': this.handleMenu6.bind(this),
                'البوابات': this.handleMenu7.bind(this), // 🆕 البوابات

                // التسجيل  
                'بدء': this.handleStart.bind(this),  
                'معرفي': this.handleGetId.bind(this),  
                'ذكر': this.handleGenderMale.bind(this),  
                'رجل': this.handleGenderMale.bind(this),  
                'ولد': this.handleGenderMale.bind(this),  
                'أنثى': this.handleGenderFemale.bind(this),  
                'بنت': this.handleGenderFemale.bind(this),  
                'فتاة': this.handleGenderFemale.bind(this),  
                'اسمي': this.handleSetName.bind(this),  

                // المعلومات  
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
                'رمي': this.handleDiscard.bind(this),

                // الاستكشاف  
                'خريطة': this.handleMap.bind(this),  
                'الموقع': this.handleMap.bind(this),   
                'بوابات': this.handleGates.bind(this),   
                'ماب': this.handleMap.bind(this),
                'ادخل': this.handleEnterGate.bind(this),
                'استكشاف': this.handleExploreGate.bind(this),
                'مغادرة': this.handleLeaveGate.bind(this),
                

                'انتقل': this.handleTravel.bind(this),  
                'سافر': this.handleTravel.bind(this),   
                'نتقل': this.handleTravel.bind(this),  
                'ذهاب': this.handleTravel.bind(this),  
                  
                'تجميع': this.handleGather.bind(this),  
                'اجمع': this.handleGather.bind(this),   
                'جمع': this.handleGather.bind(this),  
                  
                // الصناعة  
                'وصفات': this.handleShowRecipes.bind(this),  
                'صناعة': this.handleShowRecipes.bind(this),  
                'اصنع': this.handleCraft.bind(this),   
                'صنع': this.handleCraft.bind(this),    

                // 🆕 التجهيز  
                'جهز': this.handleEquip.bind(this),   
                'تجهيز': this.handleEquip.bind(this),  
                'البس': this.handleEquip.bind(this),  
                'انزع': this.handleUnequip.bind(this),  
                'خلع': this.handleUnequip.bind(this),   

                // القتال  
                'مغامرة': this.handleAdventure.bind(this),  
                'قتال': this.handleAdventure.bind(this),   
                'معركة': this.handleAdventure.bind(this),  
                'مواجهة': this.handleAdventure.bind(this),  
                  
                'هجوم': this.handleAttack.bind(this),  
                'اضرب': this.handleAttack.bind(this),   
                  
                'هروب': this.handleEscape.bind(this),  
                'اهرب': this.handleEscape.bind(this),

                // الإقتـصـاد 
                'سحب': this.handleWithdrawal.bind(this),
                'ايداع': this.handleDeposit.bind(this),
                'تحويل': this.handleTransfer.bind(this),
                'معاملاتي': this.handleTransactions.bind(this),
                'رصيدي': this.handleBalance.bind(this),

                // 🆕 نظام الفرن
                'فرن': this.handleFurnace.bind(this),
                'طهو': this.handleCook.bind(this),
                'صهر': this.handleSmelt.bind(this),
                'حرق': this.handleCook.bind(this),

                // 🆕 أوامر البوابات المتقدمة
                'استكشف': this.handleExploreGate.bind(this),
                'غادر': this.handleLeaveGate.bind(this),

            };  

            this.allowedBeforeApproval = ['بدء', 'معرفي', 'مساعدة', 'اوامر', 'رئيسية', '1', '2', '3', '4', '5', '6', '7', 'ذكر','رجل', 'ولد', 'أنثى', 'بنت', 'فتاة', 'اسمي'];  
              
            console.log('✅ CommandHandler تم تهيئته بنجاح');  
        } catch (error) {  
            console.error('❌ فشل في تهيئة CommandHandler:', error);  
            throw error;  
        }  
    }  

    // 🆕 دالة لإنشاء خريطة ترجمة العناصر من العربي إلى الإنجليزي (ID)  
    _createArabicItemMap() {  
        const itemMap = {};  
        for (const itemId in items) {  
            const itemName = items[itemId].name;  
            itemMap[itemName.toLowerCase()] = itemId;   
        }  
          
        for (const locationId in locations) {  
            const locationName = locations[locationId].name;  
            itemMap[locationName.toLowerCase()] = locationId;  
            if (locationName.startsWith('ال')) {  
                 itemMap[locationName.substring(2).toLowerCase()] = locationId;  
            }  
        }  
          
        return itemMap;  
    }  

    // 🆕 نظام القوائم المنظمة
    getMenu(menuType) {
        const menus = {
            main: `╔════════════ 🎮 قائمة الأوامر الرئيسية ════════════╗
║
║ 1️⃣ /الأساسية - أوامر البدء والتسجيل
║ 2️⃣ /الاستكشاف - أوامر التنقل والجمع  
║ 3️⃣ /القتال - أوامر المعارك والمغامرات
║ 4️⃣ /الصناعة - أوامر الصنع والتجهيز
║ 5️⃣ /المعلومات - أوامر الحالة والبروفايل
║ 6️⃣ /الاقتصاد - أوامر السحب والتحويل والايداع
║ 7️⃣ /البوابات - أوامر بوابات سولو والمغامرات
║
║ 📝 اختر رقم القائمة ( 1 , 2 , 3 , 4 , 5 , 6 , 7 )
║
╚══════════════════════════════════════════════════╝`,

            basic: `╔════════════ 🎯 الأوامر الأساسية ════════════╗
║
║ • بدء - بدء اللعبة أو متابعة التسجيل
║ • معرفي - عرض معرفك للمدير
║ • ذكر/أنثى - اختيار الجنس
║ • اسمي [الاسم] - اختيار اسم إنجليزي
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`,

            exploration: `╔════════════ 🗺️ أوامر الاستكشاف ════════════╗
║
║ • خريطة/الموقع - عرض الخريطة الحالية
║ • بوابات - عرض البوابات القريبة
║ • ادخل [اسم البوابة] - دخول البوابة
║ • انتقل [مكان] - السفر إلى موقع
║ • تجميع/اجمع - جمع الموارد
║ • تجميع [اسم المورد] - جمع مورد محدد
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية  
║
╚══════════════════════════════════════════════╝`,

            combat: `╔════════════ ⚔️ أوامر القتال ════════════╗
║
║ • مغامرة/قتال - بدء معركة عشوائية
║ • هجوم/اضرب - الهجوم في المعركة
║ • هروب/اهرب - الهروب من المعركة
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`,

            crafting: `╔════════════ 🛠️ أوامر الصناعة ════════════╗
║
║ • وصفات/صناعة - عرض الوصفات المتاحة
║ • اصنع [اسم العنصر] - صنع عنصر
║ • جهز [اسم العنصر] - تجهيز سلاح/درع
║ • انزع [اسم الخانة] - نزع عنصر مجهز
║ • معداتي - عرض المعدات المجهزة
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`,

            info: `╔════════════ 📊 أوامر المعلومات ════════════╗
║
║ • حالتي/حالة - عرض الحالة الكاملة
║ • بروفايلي/بطاقة - عرض البروفايل
║ • حقيبتي/مخزن - عرض المحتويات
║ • توب/افضل - قائمة أفضل اللاعبين
║ • لاعبيين - عرض اللاعبين النشطين
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`,
            
            economy: `╔════════════ 💰 أوامر الاقتصاد ════════════╗
║
║ • رصيدي - عرض رصيد الغولد
║ • سحب [مبلغ] - سحب غولد (الحد 100)
║ • ايداع - إرشادات الإيداع
║ • تحويل [@player] [مبلغ] - تحويل غولد
║ • معاملاتي - سجل المعاملات
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية  
║
╚══════════════════════════════════════════════╝`,

            gates: `╔════════════ 🚪 أوامر البوابات ════════════╗
║
║ • بوابات - عرض البوابات المتاحة
║ • ادخل [اسم البوابة] - دخول بوابة
║ • استكشف/استكشاف - استكشاف داخل البوابة
║ • مغادرة/غادر - مغادرة البوابة
║
║ 🎯 بوابات سولو المتاحة:
║ • بوابة سولو - المستوى 1-3
║ • بوابة سولو - رئيس التصنيف
║ • بوابات E-D, B-A, A-S, S-Rank
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`
        };
        return menus[menuType] || menus.main;
    }

    // 🆕 دوال معالجة القوائم المنظمة
    async handleMainMenu(player, args, senderId) {
        return this.getMenu('main');
    }

    async handleMenu1(player, args, senderId) {
        return this.getMenu('basic');
    }

    async handleMenu2(player, args, senderId) {
        return this.getMenu('exploration');
    }

    async handleMenu3(player, args, senderId) {
        return this.getMenu('combat');
    }

    async handleMenu4(player, args, senderId) {
        return this.getMenu('crafting');
    }

    async handleMenu5(player, args, senderId) {
        return this.getMenu('info');
    }

    async handleHelp(player, args, senderId) {
        return this.handleMainMenu(player, args, senderId);
    }

    async handleMenu6(player, args, senderId) {
        return this.getMenu('economy');
    }

    async handleMenu7(player, args, senderId) {
        return this.getMenu('gates');
    }

    async getSystem(systemName) {  
        if (!this.systems[systemName]) {  
            console.log(`🔄 جاري تحميل النظام: ${systemName}`);
            try {
                this.systems[systemName] = await getSystem(systemName);  
                
                if (!this.systems[systemName]) {
                    console.log(`❌ فشل تحميل النظام: ${systemName}`);
                    return null;
                }
            } catch (error) {
                console.error(`❌ خطأ جسيم في تحميل النظام ${systemName}:`, error);
                return null;
            }
        }  
        return this.systems[systemName];  
    }  

    async process(sender, message) {  
        const { id, name } = sender;  
        const processedMessage = message.trim().toLowerCase();  
          
        let commandParts = processedMessage.split(/\s+/);  
        let command = commandParts[0];  
        let args = commandParts.slice(1);  
          
        const fullCommand = command + (args[0] ? ` ${args[0]}` : '');

        // معالجة الأوامر المركبة
        if (fullCommand === 'موافقة لاعب') {  
            command = 'موافقة_لاعب';  
            args = args.slice(1);  
        } else if (fullCommand === 'اعطاء مورد') {  
            command = 'اعطاء_مورد';  
            args = args.slice(1);  
        } else if (fullCommand === 'اعطاء ذهب') {  
            command = 'اعطاء_ذهب';  
            args = args.slice(1);  
        } else if (fullCommand === 'تغيير اسم') {  
            command = 'تغيير_اسم';  
            args = args.slice(1);  
        } else if (fullCommand === 'زيادة صحة') {  
            command = 'زيادة_صحة';  
            args = args.slice(1);  
        } else if (fullCommand === 'زيادة مانا') {  
            command = 'زيادة_مانا';  
            args = args.slice(1);  
        }  else if (fullCommand === 'اعادة بيانات') {  
            command = 'اعادة_بيانات';  
            args = args.slice(1);
        }  else if (fullCommand === 'حظر لاعب') {  
            command = 'حظر_لاعب';  
            args = args.slice(1);   
        }  else if (fullCommand === 'تغيير جنس') {  
            command = 'تغيير_جنس';  
            args = args.slice(1);   
        } else if (fullCommand === 'عرض الردود') {  
            command = 'عرض_الردود';  
            args = args.slice(1);  
        }
          
        console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);  

        const userIsAdmin = this.adminSystem.isAdmin(id);  
        if (userIsAdmin) {  
            console.log('🎯 🔥 تم التعرف على المدير!');  
            
            // معالجة أوامر المدير أولاً قبل أي شيء آخر
            const adminCommands = this.adminSystem.getAdminCommands();  
            if (adminCommands[command]) {  
                console.log(`👑 تنفيذ أمر مدير: ${command}`);  
                try {
                    let player = await Player.findOne({ userId: id });  
                    if (!player) {  
                        player = await Player.createNew(id, name);  
                    }
                    const result = await this.adminSystem.handleAdminCommand(command, args, id, player, this.ARABIC_ITEM_MAP);  
                    return result;  
                } catch (error) {
                    console.error('❌ خطأ في أمر المدير:', error);
                    return `❌ خطأ في تنفيذ أمر المدير: ${error.message}`;
                }
            }  
        }  

        // ثم الردود التلقائية
        const autoResponseSys = await this.getSystem('autoResponse');  
        if (autoResponseSys) {  
             const autoResponse = autoResponseSys.findAutoResponse(message);  
             if (autoResponse) {  
                 console.log(`🤖 رد تلقائي على: "${message}"`);  
                 return autoResponse;  
             }  
        }  
          
        try {  
            let player = await Player.findOne({ userId: id });  

            if (!player) {  
                player = await Player.createNew(id, name);  
                console.log(`🎮 تم إنشاء لاعب جديد: ${player.name}`);  
            }  

            if (userIsAdmin && player.registrationStatus !== 'completed') {  
                player = await this.adminSystem.setupAdminPlayer(id, name);  
                console.log(`🎯 تم تفعيل المدير: ${player.name}`);  
            }  

            console.log(`📊 حالة التسجيل: ${player.registrationStatus}`);  

            if (player.banned) {  
                return '❌ تم حظرك من اللعبة.';  
            }  

            if (this.commands[command]) {  
                if (!this.allowedBeforeApproval.includes(command) && !player.isApproved()) {  
                    return this.getRegistrationMessage(player);  
                }  

                const handler = this.commands[command];   
                const result = await handler.call(this, player, args, id);  
                  
                if (typeof result === 'string') {  
                    await player.save();  
                }  

                return result;  
            }  

            return await this.handleUnknown(command, player);  

        } catch (error) {  
            console.error('❌ خطأ في معالجة الأمر:', error);  
              
            if (error.code === 11000) {  
                const existingPlayer = await Player.findOne({ userId: id });  
                if (existingPlayer) {  
                    console.log('✅ وجد لاعب موجود، إعادة المحاولة...');  
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
        return `❌ **حسابك غير مفعل بعد!**
        
⏳ **حالة حسابك:** قيد الانتظار للموافقة
📝 **لتفعيل حسابك:**
1. اكتب "معرفي" للحصول على معرفك
2. أرسل المعرف للمدير لتفعيل حسابك
3. انتظر موافقة المدير

✅ **الأوامر المتاحة لك حالياً:**
• \`مساعدة\` - عرض الأوامر
• \`بدء\` - بدء التسجيل  
• \`معرفي\` - عرض معرفك للمدير

📞 **للتواصل مع المدير:** بعد الحصول على المعرف، راسل المدير مباشرة.`;
    }   
    else if (status === 'approved') {  
        return `✅ **تمت موافقة المدير على حسابك!**

🎮 **الآن يمكنك إكمال إنشاء شخصيتك:**
• اكتب "ذكر" 👦 أو "أنثى" 👧 لاختيار الجنس
• ثم اكتب "اسمي [الاسم]" لاختيار اسم إنجليزي

📝 **مثال:**
\`ذكر\`
\`اسمي John\`

✨ بعدها ستصبح جاهزاً للعب!`;
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
📍 موقعك: ${locations[player.currentLocation]?.name || player.currentLocation}
✨ مستواك: ${player.level}
💰 ذهبك: ${player.gold}
اكتب "مساعدة" لرؤية الأوامر.`;
        } catch (error) {  
            return '❌ حدث خطأ في بدء اللعبة.';  
        }  
    }  

    async handleGetId(player) {  
        return `🆔 معرفك هو : \`${player.userId}\`
📨 أرسل هذا المعرف للمدير للحصول على الموافقة.`;
    }  

    async handleGenderMale(player) {  
        const registrationSystem = await this.getSystem('registration');  
        const result = await registrationSystem.setGender(player.userId, 'male');  
        return result;  
    }  

    async handleGenderFemale(player) {  
        const registrationSystem = await this.getSystem('registration');  
        const result = await registrationSystem.setGender(player.userId, 'female');  
        return result;  
    }  

    async handleSetName(player, args) {  
        const name = args.join(' ');  
        if (!name) return '❌ يرجى تحديد اسم. مثال: اسمي John';  
          
        const registrationSystem = await this.getSystem('registration');  
        const result = await registrationSystem.setName(player.userId, name);  
        return result;  
    }  

    async handleStatus(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const profileSystem = await this.getSystem('profile');  
        return profileSystem.getPlayerStatus(player);  
    }  

    async handleProfile(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        try {  
            const cardGenerator = this.cardGenerator;   
            const imagePath = await cardGenerator.generateCard(player);   
            return {  
                type: 'image',  
                path: imagePath,  
                caption: `📋 بطاقة بروفايلك يا ${player.name}!`  
            };  
        } catch (error) {  
            return `❌ حدث خطأ في إنشاء البطاقة: ${error.message}`;
        }  
    }  
    
    async handleInventory(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const profileSystem = await this.getSystem('profile');  
        return profileSystem.getPlayerInventory(player);  
    }  

    async handleTopPlayers(player) {  
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
            console.error('❌ خطأ في عرض قائمة التوب:', error);  
            return '❌ حدث خطأ أثناء جلب قائمة الأفضل.';  
        }  
    }  

    // 🆕 دوال البوابات المحسنة
    async handleGates(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        try {
            console.log(`📍 الموقع الحالي للاعب: ${player.currentLocation}`);
            
            // المحاولة الأولى: استخدام نظام البوابات الجديد (GateSystem)
            const gateSystem = await this.getSystem('gate');
            let nearbyGates = [];
            
            if (gateSystem) {
                console.log('🔄 استخدام نظام البوابات الجديد...');
                
                // التحقق من وجود الدالة getNearbyGates
                if (typeof gateSystem.getNearbyGates === 'function') {
                    nearbyGates = gateSystem.getNearbyGates(player);
                    console.log(`✅ نظام البوابات الجديد عاد ${nearbyGates.length} بوابة`);
                } 
                // إذا لم توجد الدالة، حاول استخدام الطريقة البديلة
                else if (gateSystem.gates && Array.isArray(gateSystem.gates)) {
                    console.log('🔄 استخدام الطريقة البديلة للبوابات...');
                    const currentLocation = player.currentLocation;
                    nearbyGates = gateSystem.gates.filter(gate => {
                        if (!gate.availableLocations || !Array.isArray(gate.availableLocations)) {
                            return false;
                        }
                        return gate.availableLocations.includes(currentLocation);
                    });
                    console.log(`✅ الطريقة البديلة عادت ${nearbyGates.length} بوابة`);
                }
            }

            // المحاولة الثانية: إذا لم نجد بوابات، استخدام نظام السفر القديم (TravelSystem)
            if (nearbyGates.length === 0) {
                console.log('🔄 استخدام نظام السفر القديم للبوابات...');
                const travelSystem = await this.getSystem('travel');
                if (travelSystem && typeof travelSystem.getNearbyGates === 'function') {
                    nearbyGates = travelSystem.getNearbyGates(player);
                    console.log(`✅ نظام السفر القديم عاد ${nearbyGates.length} بوابة`);
                }
            }

            // المحاولة الثالثة: استخدام البوابات الافتراضية إذا لم توجد أي بوابات
            if (nearbyGates.length === 0) {
                console.log('🔄 استخدام البوابات الافتراضية...');
                nearbyGates = this.getDefaultGates(player.currentLocation);
                console.log(`✅ البوابات الافتراضية عادت ${nearbyGates.length} بوابة`);
            }

            if (nearbyGates.length === 0) {
                return `🚪 لا توجد بوابات نشطة حالياً في **${locations[player.currentLocation]?.name || player.currentLocation}**!\n\n💡 *جرب الانتقال إلى مواقع أخرى مثل الغابة أو القرية.*`;
            }

            let message = `🚪 **البوابات النشطة في ${locations[player.currentLocation]?.name || player.currentLocation} (${nearbyGates.length})**:\n\n`;
            
            nearbyGates.forEach((gate, index) => {
                const dangerStars = '⭐'.repeat(gate.danger || 1);
                const requiredLevel = gate.requiredLevel || 1;
                const description = gate.description || 'بوابة غامضة تنتظر الاستكشاف';
                
                message += `**${index + 1}. ${gate.name}**\n`;
                message += `   📊 ${dangerStars} | 🎯 المستوى ${requiredLevel}+ | 📖 ${description}\n\n`;
            });
            
            message += `💡 **استخدم:** "ادخل [اسم البوابة]" للدخول\n`;
            message += `🎯 **مثال:** "ادخل ${nearbyGates[0]?.name || 'بوابة سولو'}"`;
            
            return message;
        } catch (error) {
            console.error('❌ خطأ في عرض البوابات:', error);
            
            // عرض رسالة بديلة مع البوابات الافتراضية
            const defaultGates = this.getDefaultGates(player.currentLocation);
            if (defaultGates.length > 0) {
                let fallbackMessage = `🚪 **البوابات المتاحة (نسخة احتياطية):**\n\n`;
                defaultGates.forEach((gate, index) => {
                    fallbackMessage += `**${index + 1}. ${gate.name}** - ${gate.description}\n`;
                });
                fallbackMessage += `\n💡 جرب: "ادخل ${defaultGates[0]?.name}"`;
                return fallbackMessage;
            }
            
            return '❌ حدث خطأ في تحميل البوابات. جرب لاحقاً.';
        }
    }

    // 🆕 دالة للحصول على البوابات الافتراضية
    getDefaultGates(currentLocation) {
        const defaultGates = [
            {
                id: 'solo_tier_1',
                name: 'بوابة سولو - المستوى 1',
                availableLocations: ['forest', 'village', 'desert', 'snow', 'mine', 'city', 'ocean', 'mountain'],
                requiredLevel: 1,
                danger: 1,
                description: 'بوابة بداية الصياد. مخلوقات ضعيفة ومهام تدريبية.'
            },
            {
                id: 'gate_ed',
                name: 'بوابات E-D',
                availableLocations: ['forest', 'snow', 'desert', 'village', 'city', 'mountain'],
                requiredLevel: 1,
                danger: 1,
                description: 'تستخدم للتدريب، لكنها لا تخلو من المفاجآت.'
            },
            {
                id: 'solo_tier_2',
                name: 'بوابة سولو - المستوى 2',
                availableLocations: ['desert', 'forest', 'mine', 'snow', 'mountain', 'ocean'],
                requiredLevel: 10,
                danger: 2,
                description: 'تحدٍ أعلى، وحوش أقوى، موارد أفضل.'
            },
            {
                id: 'gate_ba',
                name: 'بوابات B-A',
                availableLocations: ['desert', 'ocean', 'mine', 'forest', 'mountain'],
                requiredLevel: 10,
                danger: 2,
                description: 'ساحة اختبار حقيقية للمغامرين الجدد.'
            }
        ];

        // تصفية البوابات المتاحة للموقع الحالي
        return defaultGates.filter(gate => 
            gate.availableLocations.includes(currentLocation)
        );
    }

    async handleEnterGate(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const gateName = args.join(' ');
        if (!gateName) {
            return '❌ يرجى تحديد اسم البوابة. استخدم "بوابات" لرؤية البوابات المتاحة.';
        }

        try {
            // 🆕 التحقق من المعركة النشطة أولاً
            const battleSystem = await this.getSystem('battle');
            if (battleSystem && this.isPlayerInBattle(player, battleSystem)) {
                return '⚔️ لا يمكنك دخول البوابات أثناء القتال! استخدم `هروب` أولاً.';
            }

            let gateSystem = await this.getSystem('gate');
            
            // إذا لم يكن نظام البوابات متوفراً، استخدام النظام المبسط
            if (!gateSystem) {
                return await this.handleSimpleGateEnter(player, gateName);
            }

            const result = await gateSystem.enterGate(player, gateName);
            if (result.error) {
                return result.error;
            }

            await player.save();
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في دخول البوابة:', error);
            
            // 🆕 محاولة استخدام النظام المبسط عند الخطأ
            try {
                return await this.handleSimpleGateEnter(player, gateName);
            } catch (fallbackError) {
                return '❌ حدث خطأ أثناء دخول البوابة. جرب لاحقاً.';
            }
        }
    }

    // 🆕 نظام بوابات مبسط للطوارئ
    async handleSimpleGateEnter(player, gateName) {
        const defaultGates = this.getDefaultGates(player.currentLocation);
        const targetGate = defaultGates.find(gate => 
            gate.name.toLowerCase().includes(gateName.toLowerCase()) ||
            gate.id.toLowerCase().includes(gateName.toLowerCase())
        );

        if (!targetGate) {
            const availableGates = defaultGates.map(g => g.name).join(', ');
            return `❌ لم يتم العثور على البوابة "${gateName}".\n💡 البوابات المتاحة: ${availableGates}`;
        }

        if (player.level < targetGate.requiredLevel) {
            return `❌ تحتاج إلى المستوى ${targetGate.requiredLevel} على الأقل لدخول ${targetGate.name}.`;
        }

        // محاكاة دخول البوابة
        return `🌀 **لقد دخلت ${targetGate.name}!**\n\n${targetGate.description}\n\n💡 استخدم \`استكشف\` للبدء في الاستكشاف!`;
    }

    async handleExploreGate(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
        try {
            const gateSystem = await this.getSystem('gate');
            
            if (!gateSystem) {
                return await this.handleSimpleGateExplore(player);
            }

            const result = await gateSystem.exploreGate(player);
            if (result.error) {
                return result.error;
            }

            await player.save();
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في استكشاف البوابة:', error);
            return await this.handleSimpleGateExplore(player);
        }
    }

    // 🆕 استكشاف مبسط للبوابات
    async handleSimpleGateExplore(player) {
        const events = [
            {
                type: 'treasure',
                description: 'عثرت على صندوق كنز مخفي! وجدت بعض الموارد القيمة.',
                rewards: { 'wood': 3, 'stone': 2 }
            },
            {
                type: 'resource',
                description: 'وجدت منطقة غنية بالموارد! جمعت بعض المواد.',
                rewards: { 'wood': 2, 'coal': 1 }
            },
            {
                type: 'trap',
                description: '⚠️ لقد وقعت في فخ! خسرت بعض الصحة.',
                damage: 5
            },
            {
                type: 'discovery',
                description: 'اكتشفت ممراً سرياً! يبدو أن هناك المزيد لاستكشافه.',
                rewards: { 'experience': 10 }
            }
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        let message = `📍 **استكشاف البوابة**\n\n${randomEvent.description}\n`;

        if (randomEvent.rewards) {
            // تطبيق المكافآت
            for (const [itemId, quantity] of Object.entries(randomEvent.rewards)) {
                if (items[itemId]) {
                    player.addItem(itemId, items[itemId].name, 'resource', quantity);
                    message += `🎁 **مكافأة:** ${quantity} ${items[itemId].name}\n`;
                }
            }
        }

        if (randomEvent.damage) {
            player.health = Math.max(0, player.health - randomEvent.damage);
            message += `💔 **ضرر:** خسرت ${randomEvent.damage} صحة\n`;
        }

        message += `\n📊 **حالتك:** ${player.health}/${player.maxHealth} صحة`;
        
        await player.save();
        return message;
    }

    async handleLeaveGate(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            const result = await gateSystem.leaveGate(player);
            if (result.error) {
                return result.error;
            }

            await player.save();
            return result.message;
        } catch (error) {
            console.error('❌ خطأ في مغادرة البوابة:', error);
            return '❌ حدث خطأ أثناء المغادرة.';
        }
    }

    // 🆕 دالة مساعدة للتحقق من المعركة
    isPlayerInBattle(player, battleSystem) {
        if (!battleSystem) return false;
        
        // التحقق بطرق مختلفة حسب نظام القتال
        if (typeof battleSystem.hasActiveBattle === 'function') {
            return battleSystem.hasActiveBattle(player.userId);
        }
        
        if (battleSystem.activeBattles && battleSystem.activeBattles.has) {
            return battleSystem.activeBattles.has(player.userId);
        }
        
        if (battleSystem.activeBattles && Array.isArray(battleSystem.activeBattles)) {
            return battleSystem.activeBattles.some(battle => battle.playerId === player.userId);
        }
        
        return false;
    }

    // 🆕 دالة مساعدة للتحقق من البوابة
    isPlayerInGate(player, gateSystem) {
        if (!gateSystem) return false;
        
        if (typeof gateSystem.isPlayerInsideGate === 'function') {
            return gateSystem.isPlayerInsideGate(player.userId);
        }
        
        if (gateSystem.activeGateSessions && gateSystem.activeGateSessions.has) {
            return gateSystem.activeGateSessions.has(player.userId);
        }
        
        return false;
    }

    async handleDiscard(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
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

        const currentQuantity = player.getItemQuantity(itemId);
        if (currentQuantity < quantity) {
            return `❌ لا تملك ${quantity} من ${items[itemId].name}. لديك ${currentQuantity} فقط.`;
        }

        player.removeItem(itemId, quantity);
        await player.save();

        return `🗑️ **تم رمي ${quantity} من ${items[itemId].name}**\n` +
               `📦 **المتبقي:** ${player.getItemQuantity(itemId)}`;
    }

    async handleShowPlayers(player) {
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
        console.error('❌ خطأ في عرض قائمة اللاعبين:', error);
        return '❌ حدث خطأ أثناء جلب قائمة اللاعبين.';
    }
    }

    async handleTransfer(player, args) {
    if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
    if (args.length < 2) {
        return '❌ يرجى تحديد لاعب والمبلغ.\nمثال: تحويل @username 50\nمثال: تحويل P476346 50';
    }

    const targetIdentifier = args[0].replace('@', '');
    const amount = parseInt(args[1]);

    if (!amount || amount <= 0) {
        return '❌ يرجى تحديد مبلغ صحيح للتحويل.';
    }

    if (player.gold < amount) {
        return `❌ رصيدك غير كافٍ للتحويل.\n💰 رصيدك: ${player.gold} غولد`;
    }

    try {
        let receiver = null;
        
        receiver = await Player.findOne({ userId: targetIdentifier });
        
        if (!receiver) {
            receiver = await Player.findOne({ playerId: targetIdentifier });
        }
        
        if (!receiver) {
            receiver = await Player.findOne({ 
                name: targetIdentifier 
            });
        }
        
        if (!receiver) {
            receiver = await Player.findOne({ 
                name: { $regex: new RegExp(targetIdentifier, 'i') } 
            });
        }

        if (!receiver) {
            return `❌ اللاعب المستهدف غير موجود.\n💡 جرب:\n• المعرف التسلسلي (مثل P476346)\n• معرف المستخدم\n• اسم اللاعب الكامل`;
        }

        if (receiver.userId === player.userId) {
            return '❌ لا يمكن التحويل لنفسك.';
        }

        player.gold -= amount;
        receiver.gold += amount;

        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        player.transactions.push({
            id: transactionId,
            type: 'transfer_sent',
            amount: amount,
            status: 'completed',
            targetPlayer: receiver.userId,
            description: `تحويل إلى ${receiver.name} (${receiver.playerId})`
        });

        receiver.transactions.push({
            id: transactionId,
            type: 'transfer_received',
            amount: amount,
            status: 'completed',
            targetPlayer: player.userId,
            description: `تحويل من ${player.name} (${player.playerId})`
        });

        await player.save();
        await receiver.save();

        return `✅ تم تحويل ${amount} غولد إلى ${receiver.name} (${receiver.playerId}) بنجاح!\n💎 رصيدك الحالي: ${player.gold} غولد`;

    } catch (error) {
        console.error('Error transferring gold:', error);
        return '❌ حدث خطأ أثناء التحويل.';
    }
    }

    async handleMap(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        try {
            const worldSystem = await this.getSystem('world');  
            if (!worldSystem) {
                return '❌ نظام الخريطة غير متوفر حالياً.';
            }
            return worldSystem.showMap(player);   
        } catch (error) {
            console.error('❌ خطأ في عرض الخريطة:', error);
            return '❌ حدث خطأ في تحميل الخريطة.';
        }
    }  

    async handleTravel(player, args) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const rawLocationName = args.join(' ');  
        if (!rawLocationName) {  
             return '❌ يرجى تحديد اسم المكان. مثال: انتقل الصحراء';  
        }  
          
        const locationId = this.ARABIC_ITEM_MAP[rawLocationName.toLowerCase()] || rawLocationName.toLowerCase();  

        try {
            // 🆕 التحقق من المعركة النشطة أولاً
            const battleSystem = await this.getSystem('battle');
            if (battleSystem && this.isPlayerInBattle(player, battleSystem)) {
                return '⚔️ لا يمكنك التنقل أثناء القتال! استخدم `هروب` أولاً.';
            }

            // 🆕 التحقق من وجود اللاعب في بوابة
            const gateSystem = await this.getSystem('gate');
            if (gateSystem && this.isPlayerInGate(player, gateSystem)) {
                return '🚪 لا يمكنك السفر أثناء وجودك داخل بوابة! غادر البوابة أولاً.';
            }

            const travelSystem = await this.getSystem('travel');  
            if (!travelSystem) {
                return '❌ نظام السفر غير متوفر حالياً.';
            }

            const result = await travelSystem.travelTo(player, locationId);  
              
            if (result.error) {  
                return result.error;  
            }  
              
            await player.save();
            return result.message;  
        } catch (error) {
            console.error('❌ خطأ في السفر:', error);
            return '❌ حدث خطأ أثناء السفر.';
        }
    }  

    async handleGather(player, args) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const gatheringSystem = await this.getSystem('gathering');  
        if (!gatheringSystem) {
            return '❌ نظام الجمع غير متوفر حالياً.';
        }
          
        if (args.length === 0) {  
             return gatheringSystem.showAvailableResources(player).message;  
        }  
          
        const rawResourceName = args.join(' ');  
        const resourceId = this.ARABIC_ITEM_MAP[rawResourceName.toLowerCase()] || rawResourceName.toLowerCase();  

        const result = await gatheringSystem.gatherResources(player, resourceId);  
          
        if (result.error) {  
            return result.error;  
        }  
          
        return result.message;  
    }  

    async handleShowRecipes(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const craftingSystem = await this.getSystem('crafting');  
        if (!craftingSystem) {
            return '❌ نظام الصناعة غير متوفر حالياً.';
        }
        const result = craftingSystem.showAvailableRecipes(player);  
        return result.message;  
    }  

    async handleCraft(player, args) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
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
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
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
          
        if (player.getItemQuantity(itemId) === 0) {  
            return `❌ لا تملك العنصر "${itemInfo.name}" في مخزونك.`;  
        }  
          
        const result = player.equipItem(itemId, equipType, items);   
          
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
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
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
          
        const result = player.unequipItem(englishSlot, items);
          
        if (result.error) {  
            return result.error;  
        }  
          
        await player.save();  
          
        return result.message;  
    }  

    async handleEquipment(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const itemsData = items;
          
        const weapon = player.equipment.weapon ? itemsData[player.equipment.weapon]?.name : 'لا يوجد';  
        const armor = player.equipment.armor ? itemsData[player.equipment.armor]?.name : 'لا يوجد';  
        const accessory = player.equipment.accessory ? itemsData[player.equipment.accessory]?.name : 'لا يوجد';  
        const tool = player.equipment.tool ? itemsData[player.equipment.tool]?.name : 'لا يوجد';  
          
        const attack = player.getAttackDamage(itemsData);
        const defense = player.getDefense(itemsData);
        const totalStats = player.getTotalStats(itemsData);
          
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

    async handleAdventure(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const battleSystem = await this.getSystem('battle');  
        if (!battleSystem) {
            return '❌ نظام القتال غير متوفر حالياً.';
        }

        // 🆕 التحقق من وجود اللاعب في بوابة
        const gateSystem = await this.getSystem('gate');
        if (gateSystem && this.isPlayerInGate(player, gateSystem)) {
            return '🚪 لا يمكنك بدء معركة عادية وأنت داخل بوابة! استخدم `استكشف` داخل البوابة.';
        }

        const result = await battleSystem.startBattle(player);  
          
        if (result.error) {  
            return result.error;  
        }  
          
        return result.message;  
    }  

    async handleAttack(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const battleSystem = await this.getSystem('battle');  
        if (!battleSystem) {
            return '❌ نظام القتال غير متوفر حالياً.';
        }

        const result = await battleSystem.attack(player);  
          
        if (result.error) {  
            return result.error;  
        }  
          
        return result.message;   
    }  

    async handleEscape(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const battleSystem = await this.getSystem('battle');  
        if (!battleSystem) {
            return '❌ نظام القتال غير متوفر حالياً.';
        }

        const result = await battleSystem.escape(player);  
          
        if (result.error) {  
            return result.error;  
        }  
          
        return result.message;  
    }  

    async handleBattleInfo(player) {
    const battleSystem = await this.getSystem('battle');
    if (!battleSystem) {
        return '❌ نظام القتال غير متوفر حالياً.';
    }

    const battleInfo = battleSystem.getBattleInfo(player.userId);
    if (!battleInfo) {
        return '❌ لست في معركة حالياً.';
    }

    let message = `⚔️ **معلومات المعركة الحالية:**\n\n`;
    message += `👹 **الخصم:** ${battleInfo.monster.name}\n`;
    message += `❤️ **صحة الخصم:** ${battleInfo.monster.currentHealth}/${battleInfo.monster.health}\n`;
    message += `❤️ **صحتك:** ${battleInfo.playerHealth}/${battleInfo.playerMaxHealth}\n`;
    message += `📊 **عدد الأدوار:** ${battleInfo.turns}\n`;
    
    if (battleInfo.isBossBattle) {
        message += `🏆 **معركة زعيم!**\n`;
    }

    message += `\n💡 استخدم \`هجوم\` للقتال أو \`هروب\` للفرار`;

    return message;
        }

    // 🏦 دوال النظام الاقتصادي
    async handleWithdrawal(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const amount = parseInt(args[0]);
        if (!amount || amount <= 0) {
            return '❌ يرجى تحديد مبلغ صحيح للسحب. مثال: سحب 100';
        }

        if (amount < 100) {
            return '❌ الحد الأدنى للسحب هو 100 غولد.';
        }

        if (player.gold < amount) {
            return `❌ رصيدك غير كافٍ للسحب.\n💰 رصيدك الحالي: ${player.gold} غولد`;
        }

        // إنشاء طلب سحب
        player.pendingWithdrawal = {
            amount: amount,
            status: 'pending',
            requestedAt: new Date()
        };

        player.gold -= amount;

        // تسجيل المعاملة
        player.transactions.push({
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'withdrawal',
            amount: amount,
            status: 'pending',
            description: `طلب سحب - ${amount} غولد`
        });

        await player.save();

        return `✅ تم تقديم طلب سحب ${amount} غولد بنجاح!\n📋 سيتم معالجته خلال 24 ساعة.\n💎 رصيدك الحالي: ${player.gold} غولد`;
    }

    async handleDeposit(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        return `💳 **طريقة الإيداع:**\n\n` +
               `1. قم بتحويل المبلغ للمدير\n` +
               `2. أرسل إشعار التحويل للمدير\n` +
               `3. سيتم إضافة الغولد خلال 24 ساعة\n\n` +
               `💡 الحد الأدنى للإيداع: 50 غولد\n` +
               `💰 استخدم: "اضافة_غولد [معرفك] [المبلغ]" (للمدير)`;
    }

    async handleTransactions(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const limit = parseInt(args[0]) || 10;
        const transactions = player.transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);

        if (transactions.length === 0) {
            return '📝 لا توجد معاملات سابقة.';
        }

        let history = `📋 **سجل المعاملات (آخر ${transactions.length}):**\n\n`;
        
        transactions.forEach(transaction => {
            const icons = {
                withdrawal: '💳',
                deposit: '💰', 
                transfer_sent: '↗️',
                transfer_received: '↙️'
            };

            const statusIcons = {
                pending: '⏳',
                completed: '✅',
                rejected: '❌'
            };

            const typeNames = {
                withdrawal: 'سحب',
                deposit: 'إيداع',
                transfer_sent: 'تحويل مرسل',
                transfer_received: 'تحويل مستلم'
            };

            history += `${icons[transaction.type] || '💸'} ${statusIcons[transaction.status] || '❓'} `;
            history += `${typeNames[transaction.type] || transaction.type}: ${transaction.amount} غولد\n`;
            
            if (transaction.targetPlayer) {
                history += `   👤 ${transaction.description}\n`;
            }
            
            history += `   📅 ${new Date(transaction.createdAt || Date.now()).toLocaleDateString('ar-SA')}\n\n`;
        });

        return history;
    }

    async handleBalance(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        let balanceMessage = `💰 **رصيدك الحالي:** ${player.gold} غولد\n`;
        balanceMessage += `💳 **الحد الأدنى للسحب:** 100 غولد\n`;
        balanceMessage += `📊 **إجمالي المعاملات:** ${player.transactions.length} معاملة\n`;
        
        if (player.pendingWithdrawal && player.pendingWithdrawal.status === 'pending') {
            balanceMessage += `\n⏳ **طلب سحب معلق:** ${player.pendingWithdrawal.amount} غولد`;
        }

        return balanceMessage;
    }

    // 🆕 دوال نظام الفرن
    async handleFurnace(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
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
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
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
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
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

    async handleUnknown(command, player) {  
        return `❓ أمر غير معروف: "${command}"\nاكتب "مساعدة" للقائمة.`;  
    }  
}
