// CommandHandler.js

import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js';
import { AdminSystem } from '../systems/admin/AdminSystem.js';
import { items } from '../data/items.js';
import { locations } from '../data/locations.js';
import { recipes } from '../data/recipes.js'; 

// 💡 متغيرات البيئة (Render) - يجب تعيين ADMIN_CONTACT_LINK في Render
const ADMIN_CONTACT_LINK = process.env.ADMIN_CONTACT_LINK || "يرجى تعيين متغير ADMIN_CONTACT_LINK في Render"; 
const MIN_WITHDRAWAL_AMOUNT = 100; // الحد الأدنى للسحب

// أنظمة بديلة محسنة (Fallbacks)
async function getSystem(systemName) {
    try {  
        const systems = {  
            'battle': '../systems/battle/BattleSystem.js',  
            'world': '../systems/world/WorldMap.js',  
            'gathering': '../systems/gathering/GatheringSystem.js',  
            'profile': '../systems/profile/ProfileSystem.js',  
            'registration': '../systems/registration/RegistrationSystem.js',  
            'travel': '../systems/world/TravelSystem.js',  
            'crafting': '../systems/crafting/CraftingSystem.js'  
        };  
        if (systems[systemName]) {  
            const module = await import(systems[systemName]);  
            const SystemClass = Object.values(module)[0];  
            return new SystemClass();  
        }  
    } catch (error) {  
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
            this.ARABIC_ITEM_MAP = this._createArabicItemMap();  
            
            // 🆕 قائمة الأوامر المجمعة
            this.commandGroups = {
                '1': { name: 'الأساسية والمالية', commands: ['بدء', 'معرفي', 'مساعدة', 'سحب', 'تحويل', 'إضافة'] },
                '2': { name: 'الاستكشاف والتنقل', commands: ['خريطة', 'بوابات', 'ادخل', 'انتقل', 'تجميع'] }, 
                '3': { name: 'القتال والمغامرات', commands: ['مغامرة', 'هجوم', 'هروب'] }, 
                '4': { name: 'الصناعة والتجهيز', commands: ['وصفات', 'اصنع', 'جهز', 'انزع'] },
                '5': { name: 'المعلومات والإدارة', commands: ['حالتي', 'بروفايل', 'حقيبة', 'معداتي', 'توب', 'لاعبين'] }
            };

            this.commands = {  
                // القوائم
                'مساعدة': this.handleHelp.bind(this), 'اوامر': this.handleHelp.bind(this),
                'رئيسية': this.handleHelp.bind(this), 'الرئيسية': this.handleHelp.bind(this),
                '1': this.handleShowGroup.bind(this, '1'), '2': this.handleShowGroup.bind(this, '2'), 
                '3': this.handleShowGroup.bind(this, '3'), '4': this.handleShowGroup.bind(this, '4'),
                '5': this.handleShowGroup.bind(this, '5'),
                
                // المالية 🆕
                'سحب': this.handleWithdrawGold.bind(this), 
                'إضافة': this.handleDepositRequest.bind(this), 
                'ايداع': this.handleDepositRequest.bind(this),
                'تحويل': this.handleTransferGold.bind(this), 
                
                // التنقل/الاستكشاف
                'انتقل': this.handleTravel.bind(this), 'سافر': this.handleTravel.bind(this), 'ادخل': this.handleEnterGate.bind(this),  
                'خريطة': this.handleMap.bind(this), 'بوابات': this.handleGates.bind(this), 'تجميع': this.handleGather.bind(this), 
                
                // القتال
                'مغامرة': this.handleAdventure.bind(this), 'قتال': this.handleAdventure.bind(this), 'معركة': this.handleAdventure.bind(this), 'مواجهة': this.handleAdventure.bind(this),  
                'هجوم': this.handleAttack.bind(this), 'اضرب': this.handleAttack.bind(this), 'هروب': this.handleEscape.bind(this), 'اهرب': this.handleEscape.bind(this),
                
                // الصناعة والتجهيز
                'وصفات': this.handleShowRecipes.bind(this), 'صناعة': this.handleShowRecipes.bind(this), 'اصنع': this.handleCraft.bind(this), 'صنع': this.handleCraft.bind(this), 'جهز': this.handleEquip.bind(this), 'تجهيز': this.handleEquip.bind(this), 'البس': this.handleEquip.bind(this), 'انزع': this.handleUnequip.bind(this), 'خلع': this.handleUnequip.bind(this),   
                
                // المعلومات والتسجيل
                'بدء': this.handleStart.bind(this), 'معرفي': this.handleGetId.bind(this), 'ذكر': this.handleGenderMale.bind(this), 'رجل': this.handleGenderMale.bind(this), 'ولد': this.handleGenderMale.bind(this), 'أنثى': this.handleGenderFemale.bind(this), 'بنت': this.handleGenderFemale.bind(this), 'فتاة': this.handleGenderFemale.bind(this), 'اسمي': this.handleSetName.bind(this),  
                'حالتي': this.handleStatus.bind(this), 'حالة': this.handleStatus.bind(this), 'توب': this.handleTopPlayers.bind(this), 'افضل': this.handleTopPlayers.bind(this), 'لاعبين': this.handleShowPlayers.bind(this), 'بروفايل': this.handleProfile.bind(this), 'بطاقة': this.handleProfile.bind(this), 'حقيبة': this.handleInventory.bind(this), 'جرد': this.handleInventory.bind(this), 'مخزن': this.handleInventory.bind(this), 'معداتي': this.handleEquipment.bind(this),
            };  

            this.allowedBeforeApproval = ['بدء', 'معرفي', 'مساعدة', 'اوامر', 'رئيسية', '1', '2', '3', '4', '5', 'ذكر', 'أنثى', 'اسمي'];  
              
            console.log('✅ CommandHandler تم تهيئته بنجاح');  
        } catch (error) {  
            console.error('❌ فشل في تهيئة CommandHandler:', error);  
            throw error;  
        }  
    }  

    _createArabicItemMap() {  
        const itemMap = {};  
        for (const itemId in items) { itemMap[items[itemId].name.toLowerCase()] = itemId; }  
        for (const locationId in locations) {  
            const locationName = locations[locationId].name;  
            itemMap[locationName.toLowerCase()] = locationId;  
            if (locationName.startsWith('ال')) { itemMap[locationName.substring(2).toLowerCase()] = locationId; }  
        }  
        return itemMap;  
    }  

    handleHelp(player, args) {
        const isAdmin = this.adminSystem.isAdmin(player.userId);
        
        if (!player.isApproved()) {
            return this.getRegistrationMessage(player);
        }
        
        if (args.length > 0 && ['1', '2', '3', '4', '5'].includes(args[0])) {
            return this.handleShowGroup(args[0], player);
        }
        
        let helpMessage = `📚 **قائمة الأوامر الرئيسية لمغارة غولد**\n\n`;
        helpMessage += `اختر رقم القائمة للدخول:\n`;
        
        for (const key in this.commandGroups) {
            helpMessage += `**${key}/** ${this.commandGroups[key].name}\n`;
        }
        helpMessage += `\n💡 **طريقة الاستخدام:** \`مساعدة [رقم]\` أو \`[رقم]\`\n`;
        
        if (isAdmin) {
             helpMessage += `\n👑 **للمدراء:** \`مدير\` (لعرض الأوامر الخاصة)\n`;
        }
        return helpMessage;
    }
    
    handleShowGroup(groupKey, player) {
        const group = this.commandGroups[groupKey];
        if (!group) return '❌ رقم القائمة غير صحيح.';

        let message = `📝 **قائمة ${group.name}**:\n`;
        message += `\`\`\`\n`;
        group.commands.forEach(cmd => {
            message += `• ${cmd}\n`;
        });
        message += `\`\`\`\n`;
        message += `💡 **الأوامر المتاحة:**\n`;
        group.commands.forEach(cmd => {
             const aliases = Object.keys(this.commands).filter(key => this.commands[key] === this.commands[cmd] && key !== cmd && !['1', '2', '3', '4', '5'].includes(key));
             message += `• \`${cmd}\`${aliases.length > 0 ? ` (أو: ${aliases.map(a => `\`${a}\``).join(', ')})` : ''}\n`;
        });
        message += `\n➡️ للعودة للقائمة الرئيسية، اكتب: \`مساعدة\``;
        return message;
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
        let commandParts = processedMessage.split(/\s+/);  
        let command = commandParts[0];  
        let args = commandParts.slice(1);  
          
        let fullCommand = command + (args[0] ? ` ${args[0]}` : ''); 
        
        if (fullCommand === 'موافقة لاعب') { command = 'موافقة_لاعب'; args = args.slice(1); } 
        else if (fullCommand === 'اعطاء مورد') { command = 'اعطاء_مورد'; args = args.slice(1); } 
        else if (fullCommand === 'اعطاء ذهب') { command = 'اعطاء_ذهب'; args = args.slice(1); } 
        else if (fullCommand === 'تغيير اسم') { command = 'تغيير_اسم'; args = args.slice(1); } 
        else if (fullCommand === 'زيادة صحة') { command = 'زيادة_صحة'; args = args.slice(1); } 
        else if (fullCommand === 'زيادة مانا') { command = 'زيادة_مانا'; args = args.slice(1); }  

        const isAdmin = this.adminSystem.isAdmin(id);  
          
        // التحقق من الردود التلقائية (تم حذفها للاختصار إذا لم يكن لديك ملف autoResponse)
          
        try {  
            let player = await Player.findOne({ userId: id });  

            if (!player) { player = await Player.createNew(id, name); }  
            if (isAdmin && player.registrationStatus !== 'completed') { player = await this.adminSystem.setupAdminPlayer(id, name); }  
            if (player.banned) { return '❌ تم حظرك من اللعبة.'; }  

            // 🎯 معالجة أوامر المدير أولاً (محدثة لدعم البحث بالـ ID الجديد)
            if (isAdmin) {  
                const adminCommands = this.adminSystem.getAdminCommands();  
                
                if (adminCommands[command]) {  
                    const targetIdentifier = args[0];
                    let targetPlayer = null;
                    
                    if (targetIdentifier) {
                        targetPlayer = await Player.findByIdentifier(targetIdentifier);
                    }

                    if (targetIdentifier && !targetPlayer) {
                        return `❌ لم يتم العثور على لاعب بالمعرّف أو الاسم: "${targetIdentifier}". يرجى استخدام المعرّف (PID) أو اسم اللاعب.`;
                    }
                    
                    // 💡 تمرير targetPlayer والمصفوفة args.slice(1) (بدون المعرّف)
                    const result = await this.adminSystem.handleAdminCommand(
                        command, 
                        args.slice(1), 
                        id, 
                        targetPlayer, 
                        this.ARABIC_ITEM_MAP
                    );  
                    
                    // حفظ اللاعب المستهدف إذا تم تعديله
                    if (targetPlayer && result && result.success) { await targetPlayer.save(); }
                    return result;  
                }  
            }  

            // معالجة الأوامر العادية  
            if (this.commands[command]) {  
                if (!this.allowedBeforeApproval.includes(command) && !player.isApproved()) {  
                    return this.getRegistrationMessage(player);  
                }  

                const handler = this.commands[command];   
                const result = await handler.call(this, player, args, id);  
                  
                if (typeof result === 'string' || (typeof result === 'object' && result.success)) {  
                    await player.save();  
                }  

                return result;  
            }  

            return await this.handleUnknown(command, await Player.findOne({ userId: id }));  

        } catch (error) {  
            console.error('❌ خطأ في معالجة الأمر:', error);  
            if (error.code === 11000) { const existingPlayer = await Player.findOne({ userId: id }); if (existingPlayer) { return this.process(sender, message); } return '❌ حدث خطأ في النظام. يرجى المحاولة مرة أخرى.'; }  
            return `❌ حدث خطأ: ${error.message}`;
        }  
    }  

    getRegistrationMessage(player) {  
        const status = player.registrationStatus;  
        if (status === 'pending') { return `⏳ **حسابك قيد الانتظار للموافقة**\n📝 اكتب "معرفي" للحصول على معرفك ثم أرسله للمدير.`; }   
        else if (status === 'approved') { return `👋 **تمت الموافقة على حسابك!**\n📝 الرجاء إكمال التسجيل:\n• اكتب "ذكر" 👦 أو "أنثى" 👧\n• ثم اكتب "اسمي [الاسم]" لاختيار اسم إنجليزي`; }  
        return '❌ يرجى إكمال عملية التسجيل أولاً.';  
    }  

    // ... (بقية دوال اللعبة)

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
                    return `👋 **مرحباً ${player.name}!**\nالرجاء اختيار جنسك:\n• اكتب "ذكر" 👦\n• اكتب "أنثى" 👧`;
                }   
                else if (step && step.step === 'name_selection') {  
                    return `📝 **الآن يرجى اختيار اسم إنجليزي**\nاكتب "اسمي [الاسم]" بين 3 إلى 9 أحرف إنجليزية\nمثال: اسمي John`;
                }  
            }  

            return `🎮 **مرحباً ${player.name} في مغارة غولد!**\n📍 موقعك: ${locations[player.currentLocation]?.name || player.currentLocation}\n✨ مستواك: ${player.level}\n💰 ذهبك: ${player.gold}\nاكتب "مساعدة" لرؤية الأوامر.`;
        } catch (error) {  
            return '❌ حدث خطأ في بدء اللعبة.';  
        }  
    }  

    async handleGetId(player) { return `🆔 معرفك هو : \`${player.userId}\`\n🔢 معرف اللاعب (PID): \`${player.playerId}\`\n📨 أرسل هذا المعرف للمدير للحصول على الموافقة.`; }
    async handleGenderMale(player) { const registrationSystem = await this.getSystem('registration'); return await registrationSystem.setGender(player.userId, 'male'); }  
    async handleGenderFemale(player) { const registrationSystem = await this.getSystem('registration'); return await registrationSystem.setGender(player.userId, 'female'); }  
    async handleSetName(player, args) {  
        const name = args.join(' ');  
        if (!name) return '❌ يرجى تحديد اسم. مثال: اسمي John';  
        const registrationSystem = await this.getSystem('registration');  
        return await registrationSystem.setName(player.userId, name);  
    }  

    // 1. أمر سحب (Withdraw)
    async handleWithdrawGold(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount <= 0) { return `❌ يرجى تحديد كمية صحيحة من الغولد للسحب. مثال: \`سحب ${MIN_WITHDRAWAL_AMOUNT}\``; }
        if (amount < MIN_WITHDRAWAL_AMOUNT) { return `❌ الحد الأدنى للسحب هو **${MIN_WITHDRAWAL_AMOUNT} غولد**.`; }
        if (player.gold < amount) { return `❌ ليس لديك ${amount} غولد. رصيدك الحالي: ${player.gold} غولد.`; }
        player.removeGold(amount);
        const notificationMessage = `🚨 **طلب سحب غولد جديد (سحب)**\n👤 اللاعب: ${player.name} (ID: ${player.userId} | PID: ${player.playerId})\n💵 المبلغ المطلوب: **${amount} غولد**\n✅ تم الخصم من رصيد اللاعب بنجاح.`;
        console.log("ADMIN WITHDRAWAL NOTIFICATION:", notificationMessage);
        return `✅ **تمت معالجة طلب السحب!**\nتم خصم **${amount} غولد** من رصيدك.\nسيتم إرسال طلبك لإدارة المجموعة (التحويل الخارجي). يرجى الانتظار.\nرصيدك الحالي في اللعبة: ${player.gold} غولد.`;
    }

    // 2. أمر إضافة (Deposit)
    async handleDepositRequest(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        const amount = parseInt(args[0], 10);
        let message = `💰 **طلب إيداع غولد (إضافة)**\n\n`;
        if (isNaN(amount) || amount <= 0) { message += `💡 هل ترغب في إيداع غولد إلى حسابك؟\n`; } else { message += `💡 أنت على وشك إيداع **${amount} غولد**.\n`; }
        message += `لإتمام عملية الإيداع، يرجى التواصل مع المدير على الرابط التالي لتحديد طريقة الدفع:\n\n` +
                   `🔗 **رابط التواصل مع المدير:** ${ADMIN_CONTACT_LINK}\n\n` + 
                   `**معلوماتك:** اسم: ${player.name} | معرف اللاعب: ${player.userId} | PID: ${player.playerId}`;
        return message;
    }
    
    // 3. أمر تحويل (Transfer)
    async handleTransferGold(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';
        const amount = parseInt(args[0], 10);
        const recipientIdentifier = args[1];
        if (isNaN(amount) || amount <= 0) { return `❌ يرجى تحديد كمية صحيحة من الغولد واسم المستلم. مثال: \`تحويل 50 John\` أو \`تحويل 50 P1001\``; }
        if (!recipientIdentifier) { return '❌ يرجى تحديد اسم أو ID اللاعب المستلم.'; }
        if (player.gold < amount) { return `❌ ليس لديك ${amount} غولد. رصيدك الحالي: ${player.gold} غولد.`; }
        
        const recipient = await Player.findByIdentifier(recipientIdentifier);

        if (!recipient) { return `❌ لم يتم العثور على لاعب بالاسم أو ID: "${recipientIdentifier}".`; }
        if (recipient.userId === player.userId) { return '❌ لا يمكنك تحويل الغولد لنفسك!'; }

        player.removeGold(amount);
        recipient.addGold(amount);
        await recipient.save();

        return `✅ **نجح التحويل!**\n` +
               `تم تحويل **${amount} غولد** إلى اللاعب **${recipient.name}** (PID: ${recipient.playerId}).\n` +
               `رصيدك المتبقي: ${player.gold} غولد.`;
    }
    
    // ... (بقية الدوال)

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
            return { type: 'image', path: imagePath, caption: `📋 بطاقة بروفايلك يا ${player.name}!` };  
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
                topMessage += `${rankIcon} #${index + 1}: ${p.name} (PID: ${p.playerId || 'N/A'}) - المستوى ${p.level}\n`;  
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
      
    async handleShowPlayers(player) {  
        try {  
            if (!this.adminSystem.isAdmin(player.userId)) { return '❌ هذا الأمر خاص بالمدراء.'; }  
            const activePlayers = await Player.find({ registrationStatus: 'completed' }).sort({ level: -1, gold: -1 }).select('name level gold currentLocation playerId');  
            let playerList = `╔═════════ 🧑‍💻  لوحة تحكم المدير ═════════╗\n`;  
            playerList += `║     📋 قائمة اللاعبين النشطين (${activePlayers.length})       ║\n`;  
            playerList += `╚═══════════════════════════════════╝\n`;  
            playerList += `\`\`\`markdown\n`;  
            playerList += `| PID | المستوى | الاسم | الذهب | الموقع \n`;  
            playerList += `|----|---------|--------|-------|--------\n`;  
            activePlayers.forEach((p, index) => {  
                const locationName = locations[p.currentLocation]?.name || p.currentLocation;
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
        if (!worldSystem) { return '❌ نظام الخريطة غير متوفر حالياً.'; }
        return worldSystem.showMap(player);   
    }  
      
    async handleGates(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const travelSystem = await this.getSystem('travel');  
        if (!travelSystem) { return '❌ نظام البوابات غير متوفر حالياً.'; }
        const gates = travelSystem.getNearbyGates(player);  
        if (gates.length === 0) { return `🚪 لا توجد بوابات نشطة حالياً في **${travelSystem.getLocationName(player.currentLocation)}**!`; }  
        let message = `🚪 **البوابات النشطة القريبة (${gates.length})**:\n\n`;  
        gates.forEach(gate => {  
            message += `🔹 **${gate.name}**\n`;   
            message += `   • 📊 الخطر: ${'⭐'.repeat(gate.danger)}\n`;  
            message += `   • 🎯 المستوى المطلوب: ${gate.requiredLevel}+\n`;  
            message += `   • 📖 ${gate.description}\n\n`;  
        });  
        message += `💡 **لدخول بوابة:** استخدم أمر \`ادخل [اسم البوابة]\``;  
        return message;  
    }  

    async handleEnterGate(player, args) {
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const gateName = args.join(' ');  
        if (!gateName) {  
            return '❌ يرجى تحديد اسم البوابة. استخدم "بوابات" لرؤية البوابات المتاحة.';  
        }  
        const travelSystem = await this.getSystem('travel');  
        if (!travelSystem) { return '❌ نظام السفر غير متوفر حالياً.'; }
        const result = await travelSystem.enterGate(player, gateName);  
        if (result.error) { return result.error; }  
        return result.message;  
    }

    async handleTravel(player, args) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const rawLocationName = args.join(' ');  
        if (!rawLocationName) { return '❌ يرجى تحديد اسم المكان. مثال: انتقل الصحراء'; }  
        const locationId = this.ARABIC_ITEM_MAP[rawLocationName.toLowerCase()] || rawLocationName.toLowerCase();  
        const travelSystem = await this.getSystem('travel');  
        if (!travelSystem) { return '❌ نظام السفر غير متوفر حالياً.'; }
        const result = await travelSystem.travelTo(player, locationId);  
        if (result.error) { return result.error; }  
        return result.message;  
    }  

    async handleGather(player, args) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const gatheringSystem = await this.getSystem('gathering');  
        if (!gatheringSystem) { return '❌ نظام الجمع غير متوفر حالياً.'; }
        if (args.length === 0) { return gatheringSystem.showAvailableResources(player).message; }  
        const rawResourceName = args.join(' ');  
        const resourceId = this.ARABIC_ITEM_MAP[rawResourceName.toLowerCase()] || rawResourceName.toLowerCase();  
        const result = await gatheringSystem.gatherResources(player, resourceId);  
        if (result.error) { return result.error; }  
        return result.message;  
    }  

    async handleShowRecipes(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const craftingSystem = await this.getSystem('crafting');  
        if (!craftingSystem) { return '❌ نظام الصناعة غير متوفر حالياً.'; }
        const result = craftingSystem.showAvailableRecipes(player);  
        return result.message;  
    }  

    async handleCraft(player, args) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        if (args.length === 0) { return this.handleShowRecipes(player); }  
        const rawItemName = args.join(' ');   
        if (!rawItemName) { return '❌ يرجى تحديد العنصر المراد صنعه. مثال: اصنع قوس خشبي'; }  
        const itemId = this.ARABIC_ITEM_MAP[rawItemName.toLowerCase()] || rawItemName.toLowerCase();  
        const craftingSystem = await this.getSystem('crafting');  
        if (!craftingSystem) { return '❌ نظام الصناعة غير متوفر حالياً.'; }
        const result = await craftingSystem.craftItem(player, itemId);  
        if (result.error) { return result.error; }  
        return result.message;  
    }  

    async handleEquip(player, args) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const itemName = args.join(' ');  
        if (!itemName) { return `❌ يرجى تحديد العنصر المراد تجهيزه.\n💡 مثال: جهز سيف خشبي`; }  
        const itemId = this.ARABIC_ITEM_MAP[itemName.toLowerCase()] || itemName.toLowerCase();  
        if (!itemId || !items[itemId]) { return `❌ لم يتم العثور على العنصر "${itemName}" في مخزونك أو غير معروف.`; }  
        const itemInfo = items[itemId];  
        const validEquipTypes = ['weapon', 'armor', 'accessory', 'tool'];  
        const equipType = itemInfo.type;  
        if (!validEquipTypes.includes(equipType)) { return `❌ العنصر "${itemInfo.name}" من نوع ${equipType} لا يمكن تجهيزه.`; }  
        if (player.getItemQuantity(itemId) === 0) { return `❌ لا تملك العنصر "${itemInfo.name}" في مخزونك.`; }  
        const result = player.equipItem(itemId, equipType, items);
        if (result.error) { return result.error; }  
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
        if (!slotName) { return `❌ يرجى تحديد الخانة المراد نزعها. (سلاح، درع، إكسسوار، أداة)`; }  
        const slotTranslations = { 'سلاح': 'weapon', 'سيف': 'weapon', 'درع': 'armor', 'ترس': 'armor', 'اكسسوار': 'accessory', 'إكسسوار': 'accessory', 'خاتم': 'accessory', 'قلادة': 'accessory', 'اداة': 'tool', 'أداة': 'tool', 'فأس': 'tool', 'منجل': 'tool', 'معول': 'tool' };  
        const englishSlot = slotTranslations[slotName] || slotName;  
        const validSlots = ['weapon', 'armor', 'accessory', 'tool'];  
        if (!validSlots.includes(englishSlot)) { return `❌ الخانة "${slotName}" غير صالحة. الخانات المتاحة: سلاح, درع, اكسسوار, اداة`; }  
        const result = player.unequipItem(englishSlot, items);
        if (result.error) { return result.error; }  
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
        if (!battleSystem) { return '❌ نظام القتال غير متوفر حالياً.'; }
        const result = await battleSystem.startBattle(player);  
        if (result.error) { return result.error; }  
        return result.message;  
    }  

    async handleAttack(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const battleSystem = await this.getSystem('battle');  
        if (!battleSystem) { return '❌ نظام القتال غير متوفر حالياً.'; }
        const result = await battleSystem.attack(player);  
        if (result.error) { return result.error; }  
        return result.message;   
    }  

    async handleEscape(player) {  
        if (!player.isApproved()) return '❌ يجب إكمال التسجيل أولاً.';  
        const battleSystem = await this.getSystem('battle');  
        if (!battleSystem) { return '❌ نظام القتال غير متوفر حالياً.'; }
        const result = await battleSystem.escape(player);  
        if (result.error) { return result.error; }  
        return result.message;  
    }  

    async handleUnknown(command, player) {  
        return `❓ أمر غير معروف: "${command}"\nاكتب "مساعدة" للقائمة.`;  
    }  
            }
