import Player from '../../core/Player.js';

export class RegistrationSystem {
  constructor() {
    this.registrationSteps = new Map();
    console.log('✅ نظام التسجيل تم تهيئته');
  }

  // بدء عملية التسجيل
  async startRegistration(userId, userName) {
    try {
      let player = await Player.findOne({ userId });
      
      if (!player) {
        player = await Player.createNew(userId, `مغامر-${userId.slice(-6)}`);
      }

      this.registrationSteps.set(userId, {
        step: 'waiting_approval',
        player: player
      });

      return {
        success: true,
        message: `🎮 **مرحباً في مغارة غولد!**

⏳ حسابك قيد الانتظار للموافقة.

يرجى استخدام أمر "معرفي" للحصول على معرفك وإرساله إلى المدير للحصول على الموافقة.`,
        step: 'waiting_approval'
      };
    } catch (error) {
      console.error('❌ خطأ في بدء التسجيل:', error);
      return { success: false, message: '❌ حدث خطأ في بدء التسجيل.' };
    }
  }

  // الموافقة على اللاعب من المدير
  async approvePlayer(targetUserId, adminId) {
    try {
      const player = await Player.findOne({ userId: targetUserId });
      
      if (!player) {
        return { success: false, message: '❌ لم يتم العثور على اللاعب.' };
      }

      if (player.registrationStatus === 'approved') {
        return { success: false, message: '✅ هذا اللاعب موافق عليه مسبقاً.' };
      }

      player.registrationStatus = 'approved';
      player.approvedAt = new Date();
      player.approvedBy = adminId;
      await player.save();

      this.registrationSteps.set(targetUserId, {
        step: 'gender_selection',
        player: player
      });

      return { 
        success: true, 
        message: `✅ تمت الموافقة على اللاعب ${player.name} (${targetUserId}) بنجاح.\n\nسيتم الآن مطالبتهم باختيار الجنس.` 
      };
    } catch (error) {
      console.error('❌ خطأ في الموافقة على اللاعب:', error);
      return { success: false, message: '❌ حدث خطأ في الموافقة على اللاعب.' };
    }
  }

  // اختيار الجنس
  async setGender(userId, gender) {
    try {
      const player = await Player.findOne({ userId });
      
      if (!player) {
        return { success: false, message: '❌ لم يتم العثور على اللاعب.' };
      }

      if (player.registrationStatus !== 'approved') {
        return { success: false, message: '❌ لم يتم الموافقة على حسابك بعد.' };
      }

      if (!['male', 'female'].includes(gender)) {
        return { success: false, message: '❌ الجنس غير صحيح. يرجى اختيار "ذكر" أو "أنثى".' };
      }

      player.gender = gender;
      this.registrationSteps.set(userId, {
        step: 'name_selection',
        player: player
      });

      await player.save();

      return {
        success: true,
        message: `✅ تم اختيار الجنس: ${gender === 'male' ? '👦 ذكر' : '👧 أنثى'}\n\nالآن يرجى اختيار اسم إنجليزي بين 3 إلى 9 أحرف:\n\nاكتب "اسمي [الاسم]" مثال: اسمي John`,
        step: 'name_selection'
      };
    } catch (error) {
      console.error('❌ خطأ في تعيين الجنس:', error);
      return { success: false, message: '❌ حدث خطأ في تعيين الجنس.' };
    }
  }

  // اختيار الاسم
  async setName(userId, name) {
    try {
      const player = await Player.findOne({ userId });
      
      if (!player) {
        return { success: false, message: '❌ لم يتم العثور على اللاعب.' };
      }

      if (player.registrationStatus !== 'approved') {
        return { success: false, message: '❌ لم يتم الموافقة على حسابك بعد.' };
      }

      // التحقق من صحة الاسم
      if (!name || name.length < 3 || name.length > 9) {
        return { success: false, message: '❌ الاسم يجب أن يكون بين 3 إلى 9 أحرف إنجليزية.' };
      }

      if (!/^[a-zA-Z]+$/.test(name)) {
        return { success: false, message: '❌ الاسم يجب أن يحتوي على أحرف إنجليزية فقط.' };
      }

      // التحقق من عدم استخدام الاسم مسبقاً
      const existingPlayer = await Player.findOne({ 
        name: new RegExp(`^${name}$`, 'i'),
        userId: { $ne: userId }
      });

      if (existingPlayer) {
        return { success: false, message: '❌ هذا الاسم مستخدم مسبقاً. يرجى اختيار اسم آخر.' };
      }

      player.name = name;
      player.registrationStatus = 'completed';
      player.playerId = `P${Date.now().toString().slice(-6)}`;
      await player.save();

      this.registrationSteps.delete(userId);

      return {
        success: true,
        message: `🎉 **مبروك! تم إنشاء حسابك بنجاح**\n\n👤 الاسم: ${name}\n🆔 المعرف: ${player.playerId}\n👦 الجنس: ${player.gender === 'male' ? 'ذكر' : 'أنثى'}\n\nاكتب "بدء" لبدء اللعبة!`,
        step: 'completed'
      };
    } catch (error) {
      console.error('❌ خطأ في تعيين الاسم:', error);
      return { success: false, message: '❌ حدث خطأ في تعيين الاسم.' };
    }
  }

  // الحصول على حالة التسجيل
  getRegistrationStep(userId) {
    return this.registrationSteps.get(userId);
  }

  // الحصول على قائمة اللاعبين المنتظرين
  async getPendingPlayers() {
    try {
      const players = await Player.find({ 
        registrationStatus: 'pending' 
      }).select('userId name createdAt');
      
      return players;
    } catch (error) {
      console.error('❌ خطأ في جلب اللاعبين المنتظرين:', error);
      return [];
    }
  }
}
