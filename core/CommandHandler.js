import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js';
import { AdminSystem } from '../systems/admin/AdminSystem.js';

// 💡 يجب التأكد من وجود ملفات البيانات هذه في المسار الصحيح
// (يتم افتراض الاستيراد الحقيقي لملفات البيانات)
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
            'crafting': '../systems/crafting/CraftingSystem.js'
        };

        if (systems[systemName]) {
            const module = await import(systems[systemName]);
            const SystemClass = Object.values(module)[0];
            return new SystemClass();
        }
    } catch (error) {
        // Fallback for missing systems
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
                'مساعدة': this.handleHelp.bind(this),
                'اوامر': this.handleHelp.bind(this),
                'حالتي': this.handleStatus.bind(this),
                'حالة': this.handleStatus.bind(this), 
                'توب': this.handleTopPlayers, // 🛠️ Arrow Function
                'افضل': this.handleTopPlayers, // 🛠️ Arrow Function
                'لاعبين': this.handleShowPlayers, // 🛠️ Arrow Function

                'بروفايلي': this.handleProfile.bind(this),
                'بروفايل': this.handleProfile.bind(this), 
                'بطاقتي': this.handleProfile.bind(this),  
                'بطاقة': this.handleProfile.bind(this), 
                
                'حقيبتي': this.handleInventory.bind(this),
                'حقيبة': this.handleInventory.bind(this), 
                'جرد': this.handleInventory.bind(this), 
                'مخزن': this.handleInventory.bind(this), 

                // الاستكشاف
                'خريطة': this.handleMap.bind(this),
                'الموقع': this.handleMap.bind(this), 
                'بوابات': this.handleGates.bind(this), 
                'ماب': this.handleMap.bind(this),
 
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
                'اهرب': this.handleEscape.bind(this) 
            };

            this.allowedBeforeApproval = ['بدء', 'معرفي', 'مساعدة', 'ذكر','رجل', 'ولد', 'أنثى', 'بنت', 'فتاة', 'اسمي'];
            
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


    async getSystem(systemName) {
        if (!this.systems[systemName]) {
            this.systems[systemName] = await getSystem(systemName);
        }
        return this.systems[systemName];
    }
    
    async process(sender, message) {
        const { id, name } = sender;
        const processedMessage = message.trim().toLowerCase();
        
        // 🛠️ الخطوة 1: معالجة الأوامر المركبة (موافقة لاعب، اعطاء مورد)
        let commandParts = processedMessage.split(/\s+/);
        let command = commandParts[0];
        let args = commandParts.slice(1);
        
        const fullCommand = command + (args[0] ? ` ${args[0]}` : ''); // للتحقق من أول كلمتين

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
            return `⏳ **حسابك قيد الانتظار للموافقة**

📝 اكتب "معرفي" للحصول على معرفك ثم أرسله للمدير.`;
        } 
        else if (status === 'approved') {
            return `👋 **تمت الموافقة على حسابك!**

📝 الرجاء إكمال التسجيل:
• اكتب "ذكر" 👦 أو "أنثى" 👧
• ثم اكتب "اسمي [الاسم]" لاختيار اسم إنجليزي`;
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

📍 موقعك: ${player.currentLocation}
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

    async handleHelp(player, args, senderId) {
        const isAdmin = this.adminSystem.isAdmin(senderId);
        
        let helpMessage = `🆘 أوامر مغارة غولد

🎯 الأساسية :
بدء - بدء اللعبة أو متابعة التسجيل
معرفي - عرض معرفك للمدير
مساعدة - عرض هذه القائمة`;

        if (player.isApproved()) {
            helpMessage += `

🗺️ **الاستكشاف:**
خريطة/الموقع - عرض الخريطة
بوابات - عرض البوابات القريبة (دخول المغارات)
انتقل/سافر [مكان] - السفر إلى موقع محدد
تجميع/اجمع - جمع الموارد

🛠️ **الصناعة والتجارة:**
وصفات/صناعة - عرض وصفات الصنع المتاحة
اصنع/صنع [ID] - صنع عنصر محدد

🎒 **الإدارة:**
حالتي/حالة - عرض حالتك الكاملة
بروفايلي/بطاقة - عرض بطاقة البروفايل خاصتك
حقيبتي/مخزن - عرض المحتويات التي بحوزتك
توب/افضل - عرض قائمة أفضل 5 لاعبين وترتبيك

⚔️ **القتال:**
مغامرة/قتال - بدء معركة ضد وحش في المنطقة
هجوم/اضرب - الهجوم في المعركة الحالية
هروب/اهرب - محاولة الهروب من المعركة

🛡️ **التجهيز:**
معداتي - عرض المعدات المجهزة حالياً
جهز [اسم العنصر] - تجهيز عنصر من المخزون
انزع [اسم الخانة] - نزع عنصر مجهز`;
        }

        if (isAdmin) {
            helpMessage += `

👑 أوامر المدير :
مدير - عرض أوامر المدير الكاملة
لاعبين - عرض قائمة اللاعبين النشطين
`;
        }

        return helpMessage;
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

    // 🆕 دوال خاصة بالخصائص (Arrow Functions) - مُصححة للbind
    handleTopPlayers = async (player) => {
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
    
    handleShowPlayers = async (player) => {
        try {
            if (!this.adminSystem.isAdmin(player.userId)) {
                 return '❌ هذا الأمر خاص بالمدراء.';
            }
            
            const activePlayers = await Player.find({ registrationStatus: 'completed' })
                                        .sort({ level: -1, gold: -1 })
                                        .select('name level gold currentLocation playerId');
            
            let playerList = `╔═════════ 🧑‍💻  لوحة تحكم المدير ═════════╗\n`;
            playerList += `║     📋 قائمة اللاعبين النشطين (${activePlayers.length})       ║\n`;
            playerList += `╚═══════════════════════════════════╝\n`;
            playerList += `\`\`\`markdown\n`;
            playerList += `| ID | المستوى | الاسم | الذهب | الموقع \n`;
            playerList += `|----|---------|--------|-------|--------\n`;
            
            activePlayers.forEach((p, index) => {
                const locationName = this.ARABIC_ITEM_MAP[p.currentLocation] || p.currentLocation;
                playerList += `| ${p.playerId || 'N/A'} | L${p.level} | ${p.name} | 💰${p.gold} | ${locationName}\n`;
            });
            playerList += `\`\`\`\n`;

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
        const gates = travelSystem.getNearbyGates(player);
        
        if (gates.length === 0) {
            return `🚪 لا توجد بوابات نشطة حالياً في **${travelSystem.getLocationName(player.currentLocation)}**!`;
        }

        let message = `🚪 **البوابات النشطة القريبة (${gates.length})**:\n`;
        gates.forEach(gate => {
            message += `\n- ${gate.name} (ID: ${gate.id})\n`; 
            message += `  • المستوى المطلوب: ${gate.requiredLevel}\n`;
            message += `  • الوصف: ${gate.description}\n`;
        });
        message += `\n💡 **لدخول بوابة:** استخدم أمر "ادخل [ID البوابة]"`;
        
        return message;
    }


    async handleTravel(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const rawLocationName = args.join(' ');
        if (!rawLocationName) {
             return '❌ يرجى تحديد اسم المكان. مثال: انتقل الصحراء';
        }
        
        const locationId = this.ARABIC_ITEM_MAP[rawLocationName.toLowerCase()] || rawLocationName.toLowerCase();

        const travelSystem = await this.getSystem('travel');
        const result = await travelSystem.travelTo(player, locationId);
        
        if (result.error) {
            return result.error;
        }
        
        return result.message;
    }

    async handleGather(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const gatheringSystem = await this.getSystem('gathering');
        
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
            return `❌ يرجى تحديد العنصر المراد تجهيزه.`;
        }
        
        // 1. ترجمة الاسم العربي إلى ID
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
        
        // 3. تنفيذ التجهيز عبر دالة اللاعب (يجب تمرير itemsData لحساب الإحصائيات)
        const result = player.equipItem(itemId, equipType, items); 
        
        if (result.error) {
            return result.error;
        }
        
        await player.save();
        
        let statsMessage = '';
        if (itemInfo.stats) {
            statsMessage = `\n📊 إحصائيات مضافة:`;
            if (itemInfo.stats.damage) statsMessage += `\n• 🔥 ضرر: +${itemInfo.stats.damage}`;
            if (itemInfo.stats.defense) statsMessage += `\n• 🛡️ دفاع: +${itemInfo.stats.defense}`;
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
        
        const result = player.unequipItem(englishSlot, items); // تمرير items
        
        if (result.error) {
            return result.error;
        }
        
        await player.save();
        
        return result.message;
    }

    async handleEquipment(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const weapon = player.equipment.weapon ? items[player.equipment.weapon]?.name : 'لا يوجد';
        const armor = player.equipment.armor ? items[player.equipment.armor]?.name : 'لا يوجد';
        const accessory = player.equipment.accessory ? items[player.equipment.accessory]?.name : 'لا يوجد';
        const tool = player.equipment.tool ? items[player.equipment.tool]?.name : 'لا يوجد';
        
        const attack = player.getAttackDamage(items);
        const defense = player.getDefense(items);
        
        let equipmentMessage = `⚔️ **المعدات المجهزة حالياً:**\n\n`;
        equipmentMessage += `• ⚔️ السلاح: ${weapon}\n`;
        equipmentMessage += `• 🛡️ الدرع: ${armor}\n`;
        equipmentMessage += `• 💍 الإكسسوار: ${accessory}\n`;
        equipmentMessage += `• ⛏️ الأداة: ${tool}\n\n`;
        
        equipmentMessage += `📊 **الإحصائيات الحالية:**\n`;
        equipmentMessage += `• 🔥 قوة الهجوم: ${attack}\n`;
        equipmentMessage += `• 🛡️ قوة الدفاع: ${defense}\n\n`;
        
        equipmentMessage += `💡 **الأوامر المتاحة:**\n`;
        equipmentMessage += `• \`جهز [اسم العنصر]\` - لتجهيز عنصر من المخزون\n`;
        equipmentMessage += `• \`انزع [اسم الخانة]\` - لنزع عنصر مجهز\n`;
        equipmentMessage += `• الخانات: سلاح, درع, اكسسوار, اداة`;
        
        return equipmentMessage;
    }


    async handleAdventure(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const battleSystem = await this.getSystem('battle');
        const result = await battleSystem.startBattle(player);
        
        if (result.error) {
            return result.error;
        }
        
        return result.message;
    }

    async handleAttack(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const battleSystem = await this.getSystem('battle');
        const result = await battleSystem.attack(player);
        
        if (result.error) {
            return result.error;
        }
        
        return result.message; 
    }

    async handleEscape(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const battleSystem = await this.getSystem('battle');
        const result = await battleSystem.escape(player);
        
        if (result.error) {
            return result.error;
        }
        
        return result.message;
    }

    async handleUnknown(command, player) {
        return `❓ أمر غير معروف: "${command}"\nاكتب "مساعدة" للقائمة.`;
    }
            }
