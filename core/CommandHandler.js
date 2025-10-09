// core/commandhandelr.js
import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js';
import { AdminSystem } from '../systems/admin/AdminSystem.js';

// 🔥 استيراد البيانات الحقيقية بدلاً من المتغيرات المؤقتة
import { items } from '../data/items.js';
import { locations } from '../data/locations.js';

// أنظمة بديلة محسنة (Fallbacks)
async function getSystem(systemName) {
    try {
        console.log(`🔍 [getSystem] محاولة تحميل النظام: ${systemName}`);
        
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
            const systemInstance = new SystemClass();
            console.log(`✅ [getSystem] تم تحميل نظام ${systemName} بنجاح`);
            return systemInstance;
        }
    } catch (error) {
        console.error(`❌ [getSystem] فشل تحميل نظام ${systemName}:`, error);
        
        // 🔥 نظام صناعة افتراضي للطوارئ
        if (systemName === 'crafting') {
            console.log('🔄 [getSystem] استخدام نظام صناعة افتراضي');
            return {
                showAvailableRecipes: (player) => {
                    return {
                        message: `🛠️ **نظام الصناعة قيد التطوير**\n\n📍 موقعك: ${player.currentLocation}\n📝 سيتم إضافة وصفات الصنع قريباً!\n\n🔧 عدد الوصفات: 0`,
                        recipes: []
                    };
                },
                craftItem: (player, itemId) => {
                    return {
                        error: '❌ نظام الصناعة غير متاح حالياً. يرجى المحاولة لاحقاً.'
                    };
                }
            };
        }
    }
    return null;
}

export default class CommandHandler {
    constructor() {
        console.log('🔄 تهيئة CommandHandler...');

        try {
            this.adminSystem = new AdminSystem();
            this.cardGenerator = new ProfileCardGenerator();
            this.systems = {};
            
            // 🆕 خريطة الترجمة الشاملة (باستخدام البيانات الحقيقية)
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
                'توب': this.handleTopPlayers,
                'افضل': this.handleTopPlayers, 
                'لاعبين': this.handleShowPlayers, 

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
            console.log(`📋 الأوامر المسجلة: ${Object.keys(this.commands).join(', ')}`);
        } catch (error) {
            console.error('❌ فشل في تهيئة CommandHandler:', error);
            throw error;
        }
    }
    
    // 🆕 دالة لإنشاء خريطة ترجمة العناصر من العربي إلى الإنجليزي (ID)
    _createArabicItemMap() {
        const itemMap = {};
        
        // 1. ترجمة من ملف items الحقيقي
        for (const itemId in items) {
            const itemName = items[itemId].name;
            itemMap[itemName.toLowerCase()] = itemId; 
        }
        
        // 2. ترجمة من ملف locations الحقيقي
        for (const locationId in locations) {
            const locationName = locations[locationId].name;
            itemMap[locationName.toLowerCase()] = locationId;
            // إضافة الترجمة بدون 'ال' (للتنقل المرن)
            if (locationName.startsWith('ال')) {
                 itemMap[locationName.substring(2).toLowerCase()] = locationId;
            }
        }
        
        console.log(`🗺️ تم إنشاء خريطة ترجمة تحتوي على ${Object.keys(itemMap).length} عنصر`);
        return itemMap;
    }

    async getSystem(systemName) {
        try {
            if (!this.systems[systemName]) {
                console.log(`🔍 [CommandHandler] تحميل النظام: ${systemName}`);
                this.systems[systemName] = await getSystem(systemName);
                
                if (systemName === 'crafting') {
                    console.log(`🔍 [CommandHandler] نظام الصناعة محمل: ${this.systems[systemName] ? 'نعم' : 'لا'}`);
                    if (this.systems[systemName]) {
                        const recipeCount = Object.keys(this.systems[systemName].RECIPES || {}).length;
                        console.log(`📋 [CommandHandler] عدد الوصفات المحملة: ${recipeCount}`);
                    }
                }
            }
            return this.systems[systemName];
        } catch (error) {
            console.error(`❌ [CommandHandler] خطأ في getSystem: ${error}`);
            return null;
        }
    }
    
    async process(sender, message) {
        const { id, name } = sender;
        const parts = message.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);
        console.log(`🔍 الأجزاء: ${parts}, الوسائط: ${args}`);

        const isAdmin = this.adminSystem.isAdmin(id);
        if (isAdmin) {
            console.log('🎯 🔥 تم التعرف على المدير!');
        }
        
        // التحقق من الردود التلقائية أولاً
        try {
            const autoResponseSystem = await this.getSystem('autoResponse');
            if (autoResponseSystem) {
                 const autoResponse = autoResponseSystem.findAutoResponse(message);
                 if (autoResponse) {
                     console.log(`🤖 رد تلقائي على: "${message}"`);
                     return autoResponse;
                 }
            }
        } catch (error) {
            console.log('⚠️ نظام الرد التلقائي غير متاح');
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
                console.log(`✅ الأمر "${command}" معروف وسيتم معالجته`);
                
                if (!this.allowedBeforeApproval.includes(command) && !player.isApproved()) {
                    console.log(`⏳ اللاعب لم يكمل التسجيل بعد`);
                    return this.getRegistrationMessage(player);
                }

                const handler = this.commands[command]; 
                console.log(`🔧 استدعاء المعالج للامر: ${command}`);
                const result = await handler.call(this, player, args, id);
                
                if (typeof result === 'string') {
                    await player.save();
                }

                console.log(`✅ تم معالجة الأمر "${command}" بنجاح`);
                return result;
            } else {
                console.log(`❌ الأمر "${command}" غير معروف`);
            }

            return await this.handleUnknown(command, player);

        } catch (error) {
            console.error('❌ خطأ في معالجة الأمر:', error);
            
            if (error.code === 11000) {
                console.log('🔄 معالجة خطأ duplicate key...');
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

🗺️ الاستكشاف :
خريطة/الموقع - عرض الخريطة
بوابات - عرض البوابات القريبة (دخول المغارات)
انتقل/سافر [مكان] - السفر إلى موقع محدد
تجميع/اجمع - جمع الموارد

🛠️ الصناعة والتجارة :
وصفات/صناعة - عرض وصفات الصنع المتاحة
اصنع/صنع [اسم العنصر] - صنع عنصر محدد

🎒 **الإدارة:**
حالتي/حالة - عرض حالتك الكاملة
بروفايلي/بطاقة - عرض بطاقة البروفايل خاصتك
حقيبتي/مخزن - عرض المحتويات التي بحوزتك
توب/افضل - عرض قائمة أفضل 5 لاعبين وترتبيك

⚔️ **القتال:**
مغامرة/قتال - بدء معركة ضد وحش في المنطقة
هجوم/اضرب - الهجوم في المعركة الحالية
هروب/اهرب - محاولة الهروب من المعركة`;
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

    // 🆕 دوال خاصة بالخصائص (Arrow Functions) - مُصلحة للbind
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
            // 🆕 إضافة ID
            playerList += `| ID | المستوى | الاسم | الذهب | الموقع \n`;
            playerList += `|----|---------|--------|-------|--------\n`;
            
            activePlayers.forEach((p, index) => {
                const locationName = this.ARABIC_ITEM_MAP[p.currentLocation] || p.currentLocation;
                // 🆕 استخدام playerId
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
    
    // 🔥 إصلاح دوال الصناعة مع debugging مكثف
    async handleShowRecipes(player) {
        console.log(`🔍 [handleShowRecipes] بدء معالجة أمر الصناعة للاعب ${player.name}`);
        
        if (!player.isApproved()) {
            console.log('❌ [handleShowRecipes] اللاعب لم يكمل التسجيل');
            return '❌ يجب إكمال التسجيل أولاً.';
        }
        
        try {
            console.log(`🔍 [handleShowRecipes] جلب نظام الصناعة...`);
            const craftingSystem = await this.getSystem('crafting');
            
            if (!craftingSystem) {
                console.log('❌ [handleShowRecipes] نظام الصناعة غير محمل');
                return '❌ نظام الصناعة غير متاح حالياً.';
            }
            
            console.log(`🔍 [handleShowRecipes] استدعاء showAvailableRecipes...`);
            const result = craftingSystem.showAvailableRecipes(player);
            
            if (!result) {
                console.log('❌ [handleShowRecipes] دالة showAvailableRecipes لم تُرجع أي نتيجة');
                return '❌ لم يتم العثور على وصفات صناعة متاحة.';
            }
            
            console.log(`✅ [handleShowRecipes] تم العثور على ${result.recipes ? result.recipes.length : 0} وصفة`);
            return result.message || '❌ لا توجد وصفات صناعة متاحة حالياً.';
            
        } catch (error) {
            console.error('❌ [handleShowRecipes] خطأ في عرض الوصفات:', error);
            return `❌ حدث خطأ في عرض وصفات الصناعة: ${error.message}`;
        }
    }

    async handleCraft(player, args) {
        console.log(`🔍 [handleCraft] بدء معالجة أمر الاصنع للاعب ${player.name}`);
        
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        if (args.length === 0) {
            console.log('🔍 [handleCraft] لا توجد وسائط، عرض الوصفات...');
            return this.handleShowRecipes(player);
        }

        const rawItemName = args.join(' ');
        if (!rawItemName) {
            return '❌ يرجى تحديد العنصر المراد صنعه. مثال: اصنع قوس خشبي';
        }
        
        const itemId = this.ARABIC_ITEM_MAP[rawItemName.toLowerCase()] || rawItemName.toLowerCase();
        console.log(`🔍 [handleCraft] محاولة صنع: "${rawItemName}" (ID: ${itemId})`);

        try {
            const craftingSystem = await this.getSystem('crafting');
            
            if (!craftingSystem) {
                return '❌ نظام الصناعة غير متاح حالياً.';
            }
            
            const result = await craftingSystem.craftItem(player, itemId);
            
            if (result.error) {
                return result.error;
            }
            
            return result.message;
            
        } catch (error) {
            console.error('❌ [handleCraft] خطأ في الصناعة:', error);
            return `❌ حدث خطأ في عملية الصناعة: ${error.message}`;
        }
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
