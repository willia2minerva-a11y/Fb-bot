import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js';
import { AdminSystem } from '../systems/admin/AdminSystem.js';

// 💡 إصلاح الاستيراد: تم استيراد ملفات البيانات مباشرة لتغذية خريطة الترجمة
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
        // console.log(`⚠️ نظام ${systemName} غير متاح، استخدام بديل`);
    }

    // أنظمة بديلة محسنة (Fallbacks)
    const fallbackSystems = {
        'battle': class {
            async startBattle() { return { success: true, message: '⚔️ **بدأت المعركة!**\n\nاستخدم "هجوم" للهجوم أو "هروب" للهروب.' }; }
            async attack(player) { 
                 const damage = player.getAttackDamage ? player.getAttackDamage() : 10;
                 return { success: true, message: `🎯 **هجوم ناجح!** ألحقت ${damage} ضرر. وحش مهزوم.` }; 
            }
            async escape() { return { success: true, message: '🏃‍♂️ **هروب ناجح!**\n\nلقد هربت من المعركة.' }; }
        },
        'world': class {
            showMap(player) { 
                const location = player.currentLocation || 'الغابات';
                return `🗺️ **خريطة مغارة غولد**\n\nأنت في: **${location}**`; 
            }
        },
        'gathering': class {
            showAvailableResources() { return { message: '🌿 **الموارد:** خشب (wood), حجر (stone).' }; }
            async gatherResources() { return { success: true, message: '🌿 **جمعت الموارد!**\n\n• خشب ×3' }; }
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
        },
        'registration': class {
            constructor() { this.registrationSteps = new Map(); }
            async startRegistration() { return { success: true, message: '🎮 **مرحباً في مغارة غولد!**', step: 'waiting_approval' }; }
            async approvePlayer() { return { success: true, message: '✅ تمت الموافقة على اللاعب' }; }
            async setGender() { return { success: true, message: '✅ تم اختيار الجنس' }; }
            async setName() { return { success: true, message: '✅ تم تعيين الاسم' }; }
            getRegistrationStep() { return null; }
            async getPendingPlayers() { return []; }
            async resetRegistration() { return true; }
        },
        'autoResponse': class {
            findAutoResponse(message) { return null; }
        },
        'travel': class {
            async travelTo(player, location) {
                if (player.currentLocation === location) return { error: `أنت بالفعل في ${location}`};
                player.currentLocation = location;
                return { success: true, message: `🧭 انتقلت إلى **${location}**!` };
            }
        },
        'crafting': class {
             showCraftingRecipes() { return { message: '🛠️ **ورشة الصناعة**\n\n🚧 لا توجد وصفات حالياً.' }; }
             async craftItem() { return { error: '🚧 نظام الصناعة غير متاح حالياً' }; }
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
            
            // 🆕 خريطة الترجمة الشاملة (للعناصر والموارد والمواقع)
            this.ARABIC_ITEM_MAP = this._createArabicItemMap();

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

                // الاستكشاف
                'خريطة': this.handleMap.bind(this),
                'الموقع': this.handleMap.bind(this), 
                'بوابات': this.handleGates.bind(this), // 🆕
                
                'انتقل': this.handleTravel.bind(this),
                'سافر': this.handleTravel.bind(this), 
                
                'تجميع': this.handleGather.bind(this),
                'اجمع': this.handleGather.bind(this), 
                
                // الصناعة
                'وصفات': this.handleShowRecipes.bind(this),
                'اصنع': this.handleCraft.bind(this), 
                'صنع': this.handleCraft.bind(this),  

                // القتال
                'مغامرة': this.handleAdventure.bind(this),
                'قتال': this.handleAdventure.bind(this), 
                
                'هجوم': this.handleAttack.bind(this),
                'اضرب': this.handleAttack.bind(this), 
                
                'هروب': this.handleEscape.bind(this),
                'اهرب': this.handleEscape.bind(this) 
            };

            this.allowedBeforeApproval = ['بدء', 'معرفي', 'مساعدة', 'ذكر', 'أنثى', 'اسمي'];
            
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
            itemMap[itemName] = itemId;
            itemMap[itemName.toLowerCase()] = itemId; 
        }
        
        // 2. ترجمة من ملف locations
        for (const locationId in locations) {
            const locationName = locations[locationId].name;
            itemMap[locationName] = locationId;
            itemMap[locationName.toLowerCase()] = locationId;
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
        const parts = message.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

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

                const result = await this.commands[command](player, args, id);
                
                if (typeof result === 'string') {
                    await player.save();
                }

                return result;
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
        
        let helpMessage = `🆘 **أوامر مغارة غولد**

🎯 **الأساسية:**
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
وصفات - عرض وصفات الصنع المتاحة
اصنع/صنع [ID] - صنع عنصر محدد

🎒 **الإدارة:**
حالتي/حالة - عرض حالتك
بروفايلي/بطاقة - بطاقة البروفايل
حقيبتي/جرد - عرض المحتويات
توب/افضل - عرض قائمة الأفضل

⚔️ **القتال:**
مغامرة/قتال - بدء معركة ضد وحش في المنطقة
هجوم/اضرب - الهجوم في المعركة الحالية
هروب/اهرب - محاولة الهروب من المعركة`;
        }

        if (isAdmin) {
            helpMessage += `

👑 **أوامر المدير:**
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
            const profileSystem = await this.getSystem('profile');
            // 💡 ملاحظة: يجب أن يكون هناك دالة generateCard في ProfileCardGenerator
            const imagePath = await profileSystem.cardGenerator.generateCard(player);
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

    async handleMap(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        const worldSystem = await this.getSystem('world');
        return worldSystem.showMap(player); 
    }
    
    // 🆕 معالج أمر البوابات
    async handleGates(player) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        
        const travelSystem = await this.getSystem('travel');
        const gates = travelSystem.getNearbyGates(player);
        
        if (gates.length === 0) {
            return `🚪 **لا توجد بوابات نشطة** حالياً في **${travelSystem.getLocationName(player.currentLocation)}**.`;
        }

        let message = `🚪 **البوابات النشطة القريبة (${gates.length})**:\n`;
        gates.forEach(gate => {
            message += `\n- **${gate.name}** (ID: ${gate.id})\n`;
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
        
        const locationId = this.ARABIC_ITEM_MAP[rawLocationName] || rawLocationName.toLowerCase();

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
        
        const rawResourceName = args[0];
        const resourceId = this.ARABIC_ITEM_MAP[rawResourceName] || rawResourceName.toLowerCase();

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
        
        const itemId = this.ARABIC_ITEM_MAP[rawItemName] || rawItemName.toLowerCase();

        const craftingSystem = await this.getSystem('crafting');
        const result = await craftingSystem.craftItem(player, itemId);
        
        if (result.error) {
            return result.error;
        }
        
        return result.message;
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
