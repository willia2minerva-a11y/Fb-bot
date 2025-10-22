// systems/economy/TransactionSystem.js
import { v4 as uuidv4 } from 'uuid';

export class TransactionSystem {
  constructor() {
    this.adminUserId = process.env.ADMIN_USER_ID; // معرف المدير
    this.depositLink = 'https://paypal.me/yourusername'; // رابط الإيداع
    this.minWithdrawal = 100; // الحد الأدنى للسحب
    this.minDeposit = 50; // الحد الأدنى للإيداع
  }

  // طلب سحب
  async requestWithdrawal(player, amount) {
    if (amount < this.minWithdrawal) {
      return { 
        error: `❌ الحد الأدنى للسحب هو ${this.minWithdrawal} غولد.` 
      };
    }

    if (player.gold < amount) {
      return { error: '❌ لا تملك رصيد كافٍ للسحب.' };
    }

    // خصم المبلغ مؤقتاً
    player.gold -= amount;
    player.pendingWithdrawal = {
      amount: amount,
      requestedAt: new Date(),
      status: 'pending'
    };

    // إضافة للمعاملات
    player.transactions.push({
      id: uuidv4(),
      type: 'withdrawal',
      amount: amount,
      status: 'pending',
      description: `طلب سحب ${amount} غولد`
    });

    await player.save();

    // إرجاع رسالة للمدير (ستحتاج لتطبيق آلية الإشعار)
    this.notifyAdmin(player, amount);

    return {
      success: true,
      message: `✅ تم تقديم طلب سحب ${amount} غولد بنجاح!\n📋 سيتم معالجته خلال 24 ساعة.\n💎 رصيدك الحالي: ${player.gold} غولد`
    };
  }

  // إشعار المدير
  notifyAdmin(player, amount) {
    // هنا يمكنك إرسال رسالة للمدير عبر البوت
    const adminMessage = {
      type: 'withdrawal_request',
      playerId: player.userId,
      playerName: player.name,
      amount: amount,
      timestamp: new Date()
    };
    
    // حفظ الطلب في قاعدة بيانات الطلبات أو إرساله مباشرة للمدير
    console.log('🔄 طلب سحب جديد:', adminMessage);
    // TODO: تطبيق آلية إرسال الإشعار للمدير
  }

  // عرض إرشادات الإيداع
  getDepositInstructions(player) {
    const depositInfo = {
      instructions: `💳 **طريقة الإيداع:**\n\n` +
                   `1. قم بتحويل المبلغ عبر الرابط التالي:\n` +
                   `   🔗 ${this.depositLink}\n\n` +
                   `2. بعد التحويل، أرسل إشعار التحويل للمدير\n` +
                   `3. سيتم إضافة الغولد خلال 24 ساعة\n\n` +
                   `💡 الحد الأدنى للإيداع: ${this.minDeposit} غولد`,
      adminContact: 'راسل المدير: @YourUsername'
    };

    return depositInfo;
  }

  // تحويل بين اللاعبين
  async transferGold(sender, receiverUserId, amount) {
    if (sender.gold < amount) {
      return { error: '❌ رصيدك غير كافٍ للتحويل.' };
    }

    if (amount <= 0) {
      return { error: '❌ المبلغ يجب أن يكون أكبر من الصفر.' };
    }

    const receiver = await Player.findOne({ userId: receiverUserId });
    if (!receiver) {
      return { error: '❌ اللاعب المستهدف غير موجود.' };
    }

    if (receiver.userId === sender.userId) {
      return { error: '❌ لا يمكن التحويل لنفسك.' };
    }

    // تنفيذ التحويل
    sender.gold -= amount;
    receiver.gold += amount;

    // تسجيل المعاملات
    const transactionId = uuidv4();
    
    sender.transactions.push({
      id: transactionId,
      type: 'transfer_sent',
      amount: amount,
      status: 'completed',
      targetPlayer: receiver.userId,
      description: `تحويل إلى ${receiver.name}`
    });

    receiver.transactions.push({
      id: transactionId,
      type: 'transfer_received', 
      amount: amount,
      status: 'completed',
      targetPlayer: sender.userId,
      description: `تحويل من ${sender.name}`
    });

    await sender.save();
    await receiver.save();

    return {
      success: true,
      message: `✅ تم تحويل ${amount} غولد إلى ${receiver.name} بنجاح!\n💎 رصيدك الحالي: ${sender.gold} غولد`
    };
  }

  // سجل المعاملات
  getTransactionHistory(player, limit = 10) {
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

      history += `${icons[transaction.type]} ${statusIcons[transaction.status]} `;
      history += `${this.formatTransactionType(transaction.type)}: ${transaction.amount} غولد\n`;
      
      if (transaction.targetPlayer) {
        history += `   👤 ${transaction.description}\n`;
      }
      
      history += `   📅 ${new Date(transaction.createdAt).toLocaleDateString('ar-SA')}\n\n`;
    });

    return history;
  }

  formatTransactionType(type) {
    const types = {
      withdrawal: 'سحب',
      deposit: 'إيداع',
      transfer_sent: 'تحويل مرسل',
      transfer_received: 'تحويل مستلم'
    };
    return types[type] || type;
  }
}
