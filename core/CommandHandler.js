import { BattleSystem } from '../systems/battle/BattleSystem.js';
import { TravelSystem } from '../systems/world/TravelSystem.js';
import { WorldMap } from '../systems/world/WorldMap.js';
import { GatheringSystem } from '../systems/gathering/GatheringSystem.js';
import { CraftingSystem } from '../systems/crafting/CraftingSystem.js';
import { ProfileSystem } from '../systems/profile/ProfileSystem.js';
import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js'; 

export default class CommandHandler {
  constructor() {
    console.log('🔄 تهيئة CommandHandler...');

    try {
      // تهيئة الأنظمة الأساسية
      this.battleSystem = new BattleSystem();
      this.travelSystem = new TravelSystem();
      this.worldMap = new WorldMap(this.travelSystem);
      this.gatheringSystem = new GatheringSystem();
      this.craftingSystem = new CraftingSystem();
      this.profileSystem = new ProfileSystem();
      this.cardGenerator = new ProfileCardGenerator(); 

      // الأوامر الأساسية
      this.commands = {
        'بدء': this.handleStart.bind(this),
        'حالتي': this.handleStatus.bind(this),
        'بروفايلي': this.handleProfile.bind(this),
        'مساعدة': this.handleHelp.bind(this),
        'حقيبتي': this.handleInventory.bind(this),
        'خريطة': this.handleMap.bind(this),
        'تجميع': this.handleGather.bind(this),
        'مغامرة': this.handleAdventure.bind(this),
        'هجوم': this.handleAttack.bind(this),
        'هروب': this.handleEscape.bind(this),
        
        // 🆕 إضافة أمر تغيير الاسم
        'تغيير_اسم': this.handleChangeName.bind(this)
      };

      console.log('✅ CommandHandler تم تهيئته بنجاح');
    } catch (error) {
      console.error('❌ فشل في تهيئة CommandHandler:', error);
      throw error;
    }
  }

  // 🆕 تم تعديل دالة process لتمرير الحجج ومعرف المرسل
  async process(sender, message) {
    const { id, name } = sender;
    
    // 🆕 تقسيم الرسالة إلى أمر وحجج
    const parts = message.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);

    try {
      console.log('🔍 البحث عن لاعب في قاعدة البيانات...');
      let player = await Player.findOne({ userId: id });

      if (!player) {
        console.log('🎮 إنشاء لاعب جديد...');
        player = await Player.createNew(id, name);
        console.log(`✅ لاعب جديد: ${player.name} (${player.userId})`);
      } else {
        console.log(`✅ لاعب موجود: ${player.name} (المستوى: ${player.level})`);
      }

      if (player.banned) {
        return '❌ تم حظرك من اللعبة. لا يمكنك استخدام الأوامر.';
      }

      console.log(`🔍 البحث عن الأمر: "${command}"`);
      if (this.commands[command]) {
        console.log(`✅ تم العثور على الأمر، تنفيذه...`);
        
        // 🆕 تمرير player, args, و senderId (وهو id) لجميع الدوال
        const result = await this.commands[command](player, args, id);

        // لا نقوم بحفظ اللاعب هنا، لأن بعض الأوامر مثل "هجوم" أو "تجميع"
        // تقوم بحفظه بعد كل إجراء. هذا يمنع الحفظ المتكرر.
        // يجب أن تحتوي الأوامر التي تعدل بيانات اللاعب (مثل changeName) على save()
        // لكننا سنسمح لـ changeName بتمرير النتيجة ليتم حفظها في النهاية
        if (typeof result === 'string' || (result && result.message)) {
            await player.save();
            console.log('✅ تم حفظ بيانات اللاعب');
        }

        return result;
      } else {
        console.log('❌ أمر غير معروف');
        return await this.handleUnknown(command, player);
      }

    } catch (error) {
      console.error('❌ خطأ تفصيلي في معالجة الأمر:');
      console.error('📝 رسالة الخطأ:', error.message);
      console.error('🏷️ نوع الخطأ:', error.name);
      console.error('📂 مكدس الاستدعاء:', error.stack);

      return `❌ حدث خطأ أثناء معالجة طلبك.
      
تفاصيل الخطأ: ${error.message}

يرجى المحاولة مرة أخرى أو الاتصال بالدعم.`;
    }
  }

  async handleStart(player) {
    try {
      console.log('🎮 تنفيذ أمر البدء...');
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

  async handleStatus(player) {
    try {
      console.log('📊 تنفيذ أمر الحالة...');
      // ⚠️ يجب أن تتأكد أن getPlayerStatus تستقبل لاعب فقط ولا تحتاج args/senderId
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

  async handleHelp(player) {
    try {
      console.log('🆘 تنفيذ أمر المساعدة...');
      // 🆕 إضافة أمر المدير إلى قائمة المساعدة
      return `🆘 **أوامر مغارة غولد**

🎯 **الأساسية:**
بدء - بدء اللعبة
حالتي - عرض حالتك
بروفايلي - بطاقة اللاعب
مساعدة - عرض هذه القائمة

🗺️ **الاستكشاف:**
خريطة - عرض الخريطة
تجميع - جمع الموارد
مغامرة - بدء مغامرة

🎒 **الإدارة:**
حقيبتي - عرض المحتويات

⚔️ **القتال:**
هجوم - الهجوم في المعركة
هروب - الهروب من المعركة

👑 **أوامر المدير:**
تغيير_اسم [الاسم الجديد أو [المعرف] [الاسم الجديد]] - تغيير اسم اللاعب.`;
    } catch (error) {
      console.error('❌ خطأ في handleHelp:', error);
      throw error;
    }
  }

  async handleMap(player) {
    try {
      console.log('🗺️ تنفيذ أمر الخريطة...');
      const result = this.worldMap.showMap(player);
      console.log('✅ نتيجة الخريطة:', result);
      // يجب أن يتم حفظ اللاعب هنا إذا كان showMap يقوم بتغيير بياناته
      // بما أن الكود الأصلي كان يحتوي على save() في دالة process
      // سنعتمد على دالة process في الحفظ.
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
      console.log('🌿 تنفيذ أمر التجميع...');
      const result = this.gatheringSystem.gatherResources(player, player.currentLocation);
      console.log('✅ نتيجة التجميع:', result);

      if (result.error) return result.error;
      // إذا كان result هو كائن به message، ستقوم دالة process بالحفظ
      return result.message;
    } catch (error) {
      console.error('❌ خطأ في handleGather:', error);
      return '❌ حدث خطأ أثناء جمع الموارد. حاول مرة أخرى.';
    }
  }

  async handleAdventure(player) {
    try {
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

  async handleInventory(player) {
    try {
      console.log('🎒 تنفيذ أمر الحقيبة...');
      // ⚠️ يجب أن تتأكد أن getPlayerInventory تستقبل لاعب فقط ولا تحتاج args/senderId
      const result = this.profileSystem.getPlayerInventory(player); 
      console.log('✅ نتيجة الحقيبة:', result);
      return result;
    } catch (error) {
      console.error('❌ خطأ في handleInventory:', error);

      // عرض بدائي للحقيبة
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

  async handleAttack(player) {
    try {
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

  // --------------------------------------------------
  // 🆕 دالة معالجة الأمر الجديد: تغيير الاسم
  // --------------------------------------------------
  // هذه الدالة تتلقى player, args, و senderId (معرف المرسل)
  async handleChangeName(player, args, senderId) {
      // تفويض المهمة إلى دالة changeName الموجودة في ProfileSystem
      try {
          const result = await this.profileSystem.changeName(player, args, senderId);
          // لا حاجة لـ player.save() هنا لأن دالة process ستقوم بذلك
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
