import { BattleSystem } from '../systems/battle/BattleSystem.js';
import { TravelSystem } from '../systems/world/TravelSystem.js';
import { WorldMap } from '../systems/world/WorldMap.js';
import { GatheringSystem } from '../systems/gathering/GatheringSystem.js';
import { CraftingSystem } from '../systems/crafting/CraftingSystem.js';
import { ProfileSystem } from '../systems/profile/ProfileSystem.js';
import { RegistrationSystem } from '../systems/registration/RegistrationSystem.js';
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
      this.cardGenerator = new ProfileCardGenerator(); 

      // 🆕 الأوامر الجديدة لنظام التسجيل
      this.commands = {
        'بدء': this.handleStart.bind(this),
        'معرفي': this.handleGetId.bind(this),
        'ذكر': this.handleGenderMale.bind(this),
        'أنثى': this.handleGenderFemale.bind(this),
        'اسمي': this.handleSetName.bind(this),
        'موافقة_لاعب': this.handleApprovePlayer.bind(this),
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

      // 🆕 الأوامر المسموحة قبل الموافقة
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

      // 🆕 التحقق من حالة التسجيل
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

      console.log(`🔍 البحث عن الأمر: "${command}"`);
      if (this.commands[command]) {
        console.log(`✅ تم العثور على الأمر، تنفيذه...`);
        const result = await this.commands[command](player, args, id);
        
        if (typeof result === 'string') {
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

  // 🆕 الأوامر الجديدة لنظام التسجيل
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

  async handleApprovePlayer(player, args, senderId) {
    try {
      console.log('✅ تنفيذ أمر الموافقة على اللاعب...');
      
      // التحقق من صلاحية المدير
      const ADMIN_PSID = process.env.ADMIN_PSID;
      if (senderId !== ADMIN_PSID) {
        return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
      }

      if (args.length === 0) {
        // عرض اللاعبين المنتظرين
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

  // الأوامر الحالية (معدلة للتحقق من التسجيل)
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

  async handleHelp(player) {
    try {
      console.log('🆘 تنفيذ أمر المساعدة...');
      
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

      if (player.userId === process.env.ADMIN_ID) {
        helpMessage += `

👑 **أوامر المدير:**
موافقة_لاعب - عرض/موافقة اللاعبين
تغيير_اسم [الاسم الجديد أو [المعرف] [الاسم الجديد]] - تغيير اسم اللاعب`;
      }

      return helpMessage;
    } catch (error) {
      console.error('❌ خطأ في handleHelp:', error);
      throw error;
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
      if (!player.isApproved()) {
        return '❌ يجب إكمال التسجيل أولاً لاستخدام هذا الأمر.';
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

  async handleUnknown(command, player) {
    return `❓ **أمر غير معروف**: "${command}"\n\nاكتب "مساعدة" لرؤية الأوامر المتاحة.`;
  }
           }
