
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
            'Transaction':'..systems/economy/TransactionSystem.js'
        };  

        if (systems[systemName]) {  
            const module = await import(systems[systemName]);  
            const SystemClass = Object.values(module)[0];  
            return new SystemClass();  
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
                'الأساسية': this.handleMenu1.bind(this),
                'الاستكشاف': this.handleMenu2.bind(this),
                'القتال': this.handleMenu3.bind(this),
                'الصناعة': this.handleMenu4.bind(this),
                'المعلومات': this.handleMenu5.bind(this),

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
                'معداتي': this.handleEquipment.bind(this), // 🆕 تم إضافة الأمر  

                // الاستكشاف  
                'خريطة': this.handleMap.bind(this),  
                'الموقع': this.handleMap.bind(this),   
                'بوابات': this.handleGates.bind(this),   
                'ماب': this.handleMap.bind(this),
                'ادخل': this.handleEnterGate.bind(this), // 🆕 أمر جديد

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

                //  الإقـتـصـاد 
                'سحب': this.handleWithdrawal.bind(this),
                'ايداع': this.handleDeposit.bind(this),
                'تحويل': this.handleTransfer.bind(this),
                'معاملاتي': this.handleTransactions.bind(this),
                'رصيدي': this.handleBalance.bind(this),

            };  

            this.allowedBeforeApproval = ['بدء', 'معرفي', 'مساعدة', 'اوامر', 'رئيسية', '1', '2', '3', '4', '5', 'ذكر','رجل', 'ولد', 'أنثى', 'بنت', 'فتاة', 'اسمي'];  
              
            console.log('✅ CommandHandler تم تهيئته بنجاح');  
        } catch (error) {  
            console.error('❌ فشل في تهيئة CommandHandler:', error);  
            throw error;  
        }  
    }  

    // 🆕 دالة لإنشاء خريطة ترجمة العناصر من العربي إلى الإنجليزي (ID)  
    _createArabicItemMap() {  
        const itemMap = {};  
        // 1. ترجمة من ملف items  
        for (const itemId in items) {  
            const itemName = items[itemId].name;  
            itemMap[itemName.toLowerCase()] = itemId;   
        }  
          
        // 2. ترجمة من ملف locations  
        for (const locationId in locations) {  
            const locationName = locations[locationId].name;  
            itemMap[locationName.toLowerCase()] = locationId;  
            // إضافة الترجمة بدون 'ال' (للتنقل المرن)  
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
║ 6️⃣ /الاقتصاد - أوامر السحب والتحويل والايداع الغولدنية
║
║ 📝 اختر رقم القائمة ( 1 , 2 , 3 , 4 , 5 , 6 )
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
║ • ادخل [اسم البوابة] - 🆕 دخول البوابة
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
║ • لاعبيين - 🆕 عرض اللاعبين النشطين
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


    async getSystem(systemName) {  
        if (!this.systems[systemName]) {  
            this.systems[systemName] = await getSystem(systemName);  
        }  
        return this.systems[systemName];  
    }  

    async process(sender, message) {  
    const { id, name } = sender;  
    const originalMessage = message.trim(); // حفظ الرسالة الأصلية
    const processedMessage = originalMessage.toLowerCase();  
      
    console.log(`📨 معالجة رسالة: "${originalMessage}" من ${name} (${id})`);  

    const isAdmin = this.adminSystem.isAdmin(id);  
    if (isAdmin) {  
        console.log('🎯 🔥 تم التعرف على المدير!');  
    }  
      
    // 🆕 التحقق من الردود التلقائية أولاً - باستخدام الرسالة الأصلية
    const autoResponseSystem = await this.getSystem('autoResponse');  
    if (autoResponseSystem) {  
         const autoResponse = autoResponseSystem.findAutoResponse(originalMessage);  
         if (autoResponse) {  
             console.log(`🤖 رد تلقائي على: "${originalMessage}"`);  
             return autoResponse;  
         }  
    }  
      
    // 🛠️ الخطوة 1: معالجة الأوامر المركبة (موافقة لاعب، اعطاء مورد)  
    let commandParts = processedMessage.split(/\s+/);  
    let command = commandParts[0];  
    let args = commandParts.slice(1);  
      
    const fullCommand = command + (args[0] ? ` ${args[0]}` : ''); // للتحقق من أول كلمتين  

    // باقي الكود بدون تغيير...
        // 🆕 دمج معالجة الأوامر المركبة هنا  
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
        } 
        // يمكن إضافة المزيد من الأوامر المركبة هنا...  
          
        console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);  

        const isAdmin = this.adminSystem.isAdmin(id);  
        if (isAdmin) {  
            console.log('🎯 🔥 تم التعرف على المدير!');  
        }  
          
        // التحقق من الردود التلقائية أولاً  

        const autoResponseSystem = await this.getSystem('autoResponse');  
        if (autoResponseSystem) {  
             const autoResponse = autoResponseSystem.findAutoResponse(message);  
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

            if (isAdmin && player.registrationStatus !== 'completed') {  
                player = await this.adminSystem.setupAdminPlayer(id, name);  
                console.log(`🎯 تم تفعيل المدير: ${player.name}`);  
            }  

            console.log(`📊 حالة التسجيل: ${player.registrationStatus}`);  

            if (player.banned) {  
                return '❌ تم حظرك من اللعبة.';  
            }  

            // 🎯 معالجة أوامر المدير أولاً  
            if (isAdmin) {  
                const adminCommands = this.adminSystem.getAdminCommands();  
                  
                if (adminCommands[command]) {  
                    console.log(`👑 تنفيذ أمر مدير: ${command}`);  
                    const result = await this.adminSystem.handleAdminCommand(command, args, id, player, this.ARABIC_ITEM_MAP);  
                    return result;  
                }  
            }  

            // معالجة الأوامر العادية  
            if (this.commands[command]) {  
                if (!this.allowedBeforeApproval.includes(command) && !player.isApproved()) {  
                    return this.getRegistrationMessage(player);  
                }  

                const handler = this.commands[command];   
                // 💡 يجب استخدام call(this, ...) لضمان عمل دوال bind و دوال Arrow Function  
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
            // 💡 تحديث: توجيه اللاعبين الموافق عليهم ولكن لم يكملوا لخطوات الجنس والاسم  
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
            // 💡 يتم الإمساك هنا بالخطأ المُعاد من ProfileCardGenerator.js
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
              
            // إيجاد ترتيب اللاعب الحالي  
            const allPlayers = await Player.find({ registrationStatus: 'completed' }).sort({ level: -1, experience: -1, gold: -1 }).select('name level userId playerId');  
            const playerRank = allPlayers.findIndex(p => p.userId === player.userId) + 1;  
              
            topMessage += `📍 ترتيبك الحالي: **#${playerRank}** - **${player.name}** (المستوى ${player.level})\n`;  

            return topMessage;  

        } catch (error) {  
            console.error('❌ خطأ في عرض قائمة التوب:', error);  
            return '❌ حدث خطأ أثناء جلب قائمة الأفضل.';  
        }  
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

    

    async handleMap(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const worldSystem = await this.getSystem('world');  
        return worldSystem.showMap(player);   
    }  
      
    async handleGates(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const travelSystem = await this.getSystem('travel');  
        if (!travelSystem) {
            return '❌ نظام البوابات غير متوفر حالياً.';
        }

        const gates = travelSystem.getNearbyGates(player);  
          
        if (gates.length === 0) {  
            return `🚪 لا توجد بوابات نشطة حالياً في **${travelSystem.getLocationName(player.currentLocation)}**!`;  
        }  

        let message = `🚪 **البوابات النشطة القريبة (${gates.length})**:\n\n`;  
        gates.forEach(gate => {  
            message += `🔹 **${gate.name}**\n`;   
            message += `   • 📊 الخطر: ${'⭐'.repeat(gate.danger)}\n`;  
            message += `   • 🎯 المستوى المطلوب: ${gate.requiredLevel}+\n`;  
            message += `   • 📖 ${gate.description}\n\n`;  
        });  
        message += `💡 **لدخول بوابة:** استخدم أمر "ادخل [اسم البوابة]"`;  
          
        return message;  
    }  

    // 🆕 دالة معالجة دخول البوابات
    async handleEnterGate(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const gateName = args.join(' ');  
        if (!gateName) {  
            return '❌ يرجى تحديد اسم البوابة. استخدم "بوابات" لرؤية البوابات المتاحة.';  
        }  

        const travelSystem = await this.getSystem('travel');  
        if (!travelSystem) {
            return '❌ نظام البوابات غير متوفر حالياً.';
        }

        const result = await travelSystem.enterGate(player, gateName);  
          
        if (result.error) {  
            return result.error;  
        }  
          
        await player.save();
        return result.message;  
    }


    async handleTravel(player, args) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const rawLocationName = args.join(' ');  
        if (!rawLocationName) {  
             return '❌ يرجى تحديد اسم المكان. مثال: انتقل الصحراء';  
        }  
          
        const locationId = this.ARABIC_ITEM_MAP[rawLocationName.toLowerCase()] || rawLocationName.toLowerCase();  

        const travelSystem = await this.getSystem('travel');  
        if (!travelSystem) {
            return '❌ نظام السفر غير متوفر حالياً.';
        }

        const result = await travelSystem.travelTo(player, locationId);  
          
        if (result.error) {  
            return result.error;  
        }  
          
        return result.message;  
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

        const rawItemName = args.join(' ');   
        if (!rawItemName) {  
             return '❌ يرجى تحديد العنصر المراد صنعه. مثال: اصنع قوس خشبي';  
        }  
          
        const itemId = this.ARABIC_ITEM_MAP[rawItemName.toLowerCase()] || rawItemName.toLowerCase();  

        const craftingSystem = await this.getSystem('crafting');  
        if (!craftingSystem) {
            return '❌ نظام الصناعة غير متوفر حالياً.';
        }

        const result = await craftingSystem.craftItem(player, itemId);  
          
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
          
        // 1. ترجمة الاسم العربي إلى ID  
        const itemId = this.ARABIC_ITEM_MAP[itemName.toLowerCase()] || itemName.toLowerCase();  
          
        if (!itemId || !items[itemId]) {  
            return `❌ لم يتم العثور على العنصر "${itemName}" في مخزونك أو غير معروف.`;  
        }  
          
        const itemInfo = items[itemId];  
          
        // 2. التحقق من أن العنصر يمكن تجهيزه  
        const validEquipTypes = ['weapon', 'armor', 'accessory', 'tool'];  
        const equipType = itemInfo.type;  
          
        if (!validEquipTypes.includes(equipType)) {  
            return `❌ العنصر "${itemInfo.name}" من نوع ${equipType} لا يمكن تجهيزه.`;  
        }  
          
        // 3. التحقق من امتلاك العنصر  
        if (player.getItemQuantity(itemId) === 0) {  
            return `❌ لا تملك العنصر "${itemInfo.name}" في مخزونك.`;  
        }  
          
        // 4. تنفيذ التجهيز  
        const result = player.equipItem(itemId, equipType, items);   
          
        if (result.error) {  
            return result.error;  
        }  
          
        await player.save();  
          
        // 5. عرض الإحصائيات المضافة  
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
          
        const result = player.unequipItem(englishSlot, items); // 💡 تمرير items
          
        if (result.error) {  
            return result.error;  
        }  
          
        await player.save();  
          
        return result.message;  
    }  

    async handleEquipment(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
          
        const itemsData = items; // 💡 استخدام items
          
        const weapon = player.equipment.weapon ? itemsData[player.equipment.weapon]?.name : 'لا يوجد';  
        const armor = player.equipment.armor ? itemsData[player.equipment.armor]?.name : 'لا يوجد';  
        const accessory = player.equipment.accessory ? itemsData[player.equipment.accessory]?.name : 'لا يوجد';  
        const tool = player.equipment.tool ? itemsData[player.equipment.tool]?.name : 'لا يوجد';  
          
        const attack = player.getAttackDamage(itemsData); // 💡 تمرير itemsData
        const defense = player.getDefense(itemsData); // 💡 تمرير itemsData
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
    // 🏦 دوال النظام الاقتصادي في CommandHandler.js
// في CommandHandler.js - أضف هذه الدوال:

// في CommandHandler.js - استبدال دوال الاقتصاد بالاستدعاءات للنظام

async handleWithdrawal(player, args) {
    if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
    const amount = parseInt(args[0]);
    const transactionSystem = await this.getSystem('Transaction');
    if (!transactionSystem) {
        return '❌ نظام المعاملات غير متوفر حالياً.';
    }
    
    return await transactionSystem.requestWithdrawal(player, amount);
}

async handleDeposit(player) {
    if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
    const transactionSystem = await this.getSystem('Transaction');
    if (!transactionSystem) {
        return '❌ نظام المعاملات غير متوفر حالياً.';
    }
    
    const depositInfo = transactionSystem.getDepositInstructions(player);
    return depositInfo.instructions;
}

async handleTransfer(player, args) {
    if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
    if (args.length < 2) {
        return '❌ يرجى تحديد لاعب والمبلغ. مثال: تحويل @username 50';
    }

    const targetIdentifier = args[0].replace('@', '');
    const amount = parseInt(args[1]);

    const transactionSystem = await this.getSystem('Transaction');
    if (!transactionSystem) {
        return '❌ نظام المعاملات غير متوفر حالياً.';
    }

    // البحث عن اللاعب المستهدف باستخدام الدالة المحسنة
    const receiver = await this.findTargetPlayer(targetIdentifier);
    if (!receiver) {
        return '❌ اللاعب المستهدف غير موجود.';
    }

    return await transactionSystem.transferGold(player, receiver.userId, amount);
}

async handleTransactions(player, args) {
    if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
    const limit = parseInt(args[0]) || 10;
    const transactionSystem = await this.getSystem('Transaction');
    if (!transactionSystem) {
        return '❌ نظام المعاملات غير متوفر حالياً.';
    }
    
    return transactionSystem.getTransactionHistory(player, limit);
}

async handleBalance(player) {
    if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
    
    const transactionSystem = await this.getSystem('Transaction');
    if (!transactionSystem) {
        return '❌ نظام المعاملات غير متوفر حالياً.';
    }
    
    let balanceMessage = `💰 **رصيدك الحالي:** ${player.gold} غولد\n`;
    balanceMessage += `💳 **الحد الأدنى للسحب:** ${transactionSystem.minWithdrawal} غولد\n`;
    balanceMessage += `📊 **إجمالي المعاملات:** ${player.transactions.length} معاملة\n`;
    
    if (player.pendingWithdrawal && player.pendingWithdrawal.status === 'pending') {
        balanceMessage += `\n⏳ **طلب سحب معلق:** ${player.pendingWithdrawal.amount} غولد`;
    }

    return balanceMessage;
                                                   }


// 👑 دوال المدير
async handleProcessWithdrawal(player, args) {
    if (!this.adminSystem.isAdmin(player.userId)) {
        return '❌ هذا الأمر خاص بالمدراء فقط.';
    }

    if (args.length < 2) {
        return '❌ usage: معالجة_سحب [player_id] [قبول/رفض]';
    }

    const targetPlayerId = args[0];
    const action = args[1].toLowerCase();

    const targetPlayer = await Player.findOne({ userId: targetPlayerId });
    if (!targetPlayer) {
        return '❌ اللاعب غير موجود.';
    }

    if (!targetPlayer.pendingWithdrawal || targetPlayer.pendingWithdrawal.status !== 'pending') {
        return '❌ لا يوجد طلب سحب معلق لهذا اللاعب.';
    }

    const withdrawalAmount = targetPlayer.pendingWithdrawal.amount;

    if (action === 'قبول' || action === 'موافقة') {
        // إكمال السحب
        targetPlayer.pendingWithdrawal.status = 'completed';
        
        // تحديث المعاملة
        const transaction = targetPlayer.transactions.find(t => 
            t.type === 'withdrawal' && t.status === 'pending'
        );
        if (transaction) {
            transaction.status = 'completed';
            transaction.description = `سحب مكتمل - ${withdrawalAmount} غولد`;
        }

        await targetPlayer.save();

        // TODO: هنا تقوم بإرسال المال للاعب خارجياً

        return `✅ تمت معالجة طلب السحب بنجاح!\n` +
               `👤 اللاعب: ${targetPlayer.name}\n` +
               `💰 المبلغ: ${withdrawalAmount} غولد\n` +
               `⏰ وقت الطلب: ${targetPlayer.pendingWithdrawal.requestedAt.toLocaleString('ar-SA')}`;

    } else if (action === 'رفض' || action === 'رفض') {
        // رفض السحب وإعادة المال
        targetPlayer.gold += withdrawalAmount;
        targetPlayer.pendingWithdrawal.status = 'rejected';
        
        // تحديث المعاملة
        const transaction = targetPlayer.transactions.find(t => 
            t.type === 'withdrawal' && t.status === 'pending'
        );
        if (transaction) {
            transaction.status = 'rejected';
        }

        await targetPlayer.save();

        return `❌ تم رفض طلب السحب.\n` +
               `👤 اللاعب: ${targetPlayer.name}\n` +
               `💰 المبلغ: ${withdrawalAmount} غولد\n` +
               `💎 تم إعادة المبلغ للرصيد.`;

    } else {
        return '❌ إجراء غير معروف. استخدم: قبول أو رفض';
    }
}

async handlePendingWithdrawals(player) {
    if (!this.adminSystem.isAdmin(player.userId)) {
        return '❌ هذا الأمر خاص بالمدراء فقط.';
    }

    const pendingPlayers = await Player.find({
        'pendingWithdrawal.status': 'pending'
    });

    if (pendingPlayers.length === 0) {
        return '📭 لا توجد طلبات سحب معلقة.';
    }

    let message = `📋 **طلبات السحب المعلقة (${pendingPlayers.length}):**\n\n`;
    
    pendingPlayers.forEach((p, index) => {
        message += `${index + 1}. 👤 ${p.name} (${p.userId})\n`;
        message += `   💰 ${p.pendingWithdrawal.amount} غولد\n`;
        message += `   ⏰ ${p.pendingWithdrawal.requestedAt.toLocaleString('ar-SA')}\n`;
        message += `   🎯 معالجة: \`معالجة_سحب ${p.userId} قبول/رفض\`\n\n`;
    });

    return message;
}

async handleAddGold(player, args) {
    if (!this.adminSystem.isAdmin(player.userId)) {
        return '❌ هذا الأمر خاص بالمدراء فقط.';
    }

    if (args.length < 2) {
        return '❌ usage: اضافة_غولد [player_id] [amount]';
    }

    const targetPlayerId = args[0];
    const amount = parseInt(args[1]);

    if (!amount || amount <= 0) {
        return '❌ يرجى تحديد مبلغ صحيح.';
    }

    const targetPlayer = await Player.findOne({ userId: targetPlayerId });
    if (!targetPlayer) {
        return '❌ اللاعب غير موجود.';
    }

    targetPlayer.gold += amount;
    
    // تسجيل المعاملة
    targetPlayer.transactions.push({
        id: uuidv4(),
        type: 'deposit',
        amount: amount,
        status: 'completed',
        description: `إيداع من المدير`
    });

    await targetPlayer.save();

    return `✅ تمت إضافة ${amount} غولد للاعب ${targetPlayer.name} بنجاح!\n` +
           `💰 الرصيد الجديد: ${targetPlayer.gold} غولد`;
    }

    async handleUnknown(command, player) {  
        return `❓ أمر غير معروف: "${command}"\nاكتب "مساعدة" للقائمة.`;  
    }  
                    }
