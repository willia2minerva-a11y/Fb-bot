// systems/economy/EconomySystem.js
import Player from '../../core/Player.js';

export class EconomySystem {
    constructor() {
        this.PLAYERS_PER_PAGE = 20;
        console.log('💰 نظام الاقتصاد تم تهيئته');
    }

    // ✅ عرض إحصائيات الاقتصاد العامة
    async showEconomyStats() {
        try {
            const stats = await Player.aggregate([
                {
                    $match: { registrationStatus: 'completed' }
                },
                {
                    $group: {
                        _id: null,
                        totalPlayers: { $sum: 1 },
                        totalGold: { $sum: '$gold' },
                        avgGold: { $avg: '$gold' },
                        maxGold: { $max: '$gold' },
                        minGold: { $min: '$gold' }
                    }
                }
            ]);

            if (stats.length === 0) {
                return `💰 إحصائيات الاقتصاد

❌ لا يوجد لاعبون مسجلون بعد.`;
            }

            const s = stats[0];

            // إحصائيات إضافية
            const playersWithGold = await Player.countDocuments({
                registrationStatus: 'completed',
                gold: { $gt: 0 }
            });

            const playersWithZeroGold = await Player.countDocuments({
                registrationStatus: 'completed',
                gold: 0
            });

            const pendingWithdrawals = await Player.countDocuments({
                'pendingWithdrawal.status': 'pending'
            });

            const totalPendingAmount = await Player.aggregate([
                { $match: { 'pendingWithdrawal.status': 'pending' } },
                { $group: { _id: null, total: { $sum: '$pendingWithdrawal.amount' } } }
            ]);

            const pendingAmount = totalPendingAmount[0]?.total || 0;

            // أغنى لاعب
            const richestPlayer = await Player.findOne({
                registrationStatus: 'completed'
            }).sort({ gold: -1 }).select('name gold playerId');

            let msg = `💰 إحصائيات الاقتصاد

📊 النظرة العامة:
• عدد اللاعبين: ${s.totalPlayers}
• إجمالي الغولد في البوت: ${Math.floor(s.totalGold)} غولد
• متوسط الغولد للاعب: ${Math.floor(s.avgGold)} غولد
• أعلى رصيد: ${s.maxGold} غولد
• أقل رصيد: ${s.minGold} غولد

👥 توزيع اللاعبين:
• لديهم غولد: ${playersWithGold}
• رصيدهم صفر: ${playersWithZeroGold}

💸 طلبات السحب:
• عدد الطلبات المعلقة: ${pendingWithdrawals}
• إجمالي المبالغ المعلقة: ${Math.floor(pendingAmount)} غولد

👑 أغنى لاعب:
• ${richestPlayer?.name || 'غير محدد'} - ${richestPlayer?.gold || 0} غولد

💡 لعرض قائمة الأغنياء: اغنياء [رقم الصفحة]`;

            return msg;
        } catch (error) {
            console.error('❌ خطأ في إحصائيات الاقتصاد:', error);
            return '❌ حدث خطأ في جلب الإحصائيات.';
        }
    }

    // ✅ عرض قائمة الأغنياء (بصفحات)
    async showRichestPlayers(page = 1) {
        try {
            const totalPlayers = await Player.countDocuments({
                registrationStatus: 'completed'
            });

            const totalPages = Math.ceil(totalPlayers / this.PLAYERS_PER_PAGE);

            if (totalPlayers === 0) {
                return `💰 قائمة الأغنياء

❌ لا يوجد لاعبون بعد.`;
            }

            if (page < 1 || page > totalPages) {
                return `❌ الصفحة ${page} غير موجودة.

📄 إجمالي الصفحات: ${totalPages}
💡 استخدم: اغنياء [رقم]`;
            }

            const skip = (page - 1) * this.PLAYERS_PER_PAGE;

            const players = await Player.find({
                registrationStatus: 'completed'
            })
            .sort({ gold: -1 })
            .skip(skip)
            .limit(this.PLAYERS_PER_PAGE)
            .select('name gold level playerId');

            let msg = `💰 أغنى اللاعبين - صفحة ${page}/${totalPages}\n`;

            players.forEach((p, index) => {
                const globalRank = skip + index + 1;
                const icon = globalRank === 1 ? '👑' : globalRank === 2 ? '🥈' : globalRank === 3 ? '🥉' : '▪️';

                msg += `\n${icon} ${globalRank}. ${p.name}\n`;
                msg += `   💰 ${p.gold} غولد\n`;
                msg += `   📊 المستوى: ${p.level}\n`;
            });

            msg += `\n💡 للتنقل: اغنياء [رقم الصفحة]`;

            return msg;
        } catch (error) {
            console.error('❌ خطأ في قائمة الأغنياء:', error);
            return '❌ حدث خطأ في جلب القائمة.';
        }
    }

    // ✅ عرض قائمة الفقراء (للأدمن - لمراقبة اللاعبين الجدد)
    async showPoorestPlayers(page = 1) {
        try {
            const totalPlayers = await Player.countDocuments({
                registrationStatus: 'completed'
            });

            const totalPages = Math.ceil(totalPlayers / this.PLAYERS_PER_PAGE);

            if (totalPlayers === 0) {
                return `💰 قائمة الفقراء

❌ لا يوجد لاعبون بعد.`;
            }

            if (page < 1 || page > totalPages) {
                return `❌ الصفحة ${page} غير موجودة.

📄 إجمالي الصفحات: ${totalPages}`;
            }

            const skip = (page - 1) * this.PLAYERS_PER_PAGE;

            const players = await Player.find({
                registrationStatus: 'completed'
            })
            .sort({ gold: 1 })
            .skip(skip)
            .limit(this.PLAYERS_PER_PAGE)
            .select('name gold level playerId');

            let msg = `💸 أفقر اللاعبين - صفحة ${page}/${totalPages}\n`;

            players.forEach((p, index) => {
                const globalRank = skip + index + 1;
                msg += `\n${globalRank}. ${p.name}\n`;
                msg += `   💰 ${p.gold} غولد\n`;
                msg += `   📊 المستوى: ${p.level}\n`;
            });

            msg += `\n💡 للتنقل: فقراء [رقم الصفحة]`;

            return msg;
        } catch (error) {
            console.error('❌ خطأ في قائمة الفقراء:', error);
            return '❌ حدث خطأ في جلب القائمة.';
        }
    }

    // ✅ عرض طلبات السحب (بصفحات)
    async showPendingWithdrawals(page = 1) {
        try {
            const totalPlayers = await Player.countDocuments({
                'pendingWithdrawal.status': 'pending'
            });

            const totalPages = Math.ceil(totalPlayers / this.PLAYERS_PER_PAGE);

            if (totalPlayers === 0) {
                return `💸 طلبات السحب

✅ لا توجد طلبات معلقة حالياً.`;
            }

            if (page < 1 || page > totalPages) {
                return `❌ الصفحة ${page} غير موجودة.

📄 إجمالي الصفحات: ${totalPages}`;
            }

            const skip = (page - 1) * this.PLAYERS_PER_PAGE;

            const players = await Player.find({
                'pendingWithdrawal.status': 'pending'
            })
            .sort({ 'pendingWithdrawal.requestedAt': 1 })
            .skip(skip)
            .limit(this.PLAYERS_PER_PAGE)
            .select('name gold playerId pendingWithdrawal');

            let msg = `💸 طلبات السحب المعلقة - صفحة ${page}/${totalPages}\n`;

            players.forEach((p, index) => {
                const globalRank = skip + index + 1;
                const requestDate = new Date(p.pendingWithdrawal.requestedAt);
                const dateStr = requestDate.toLocaleDateString('ar-EG');

                msg += `\n${globalRank}. ${p.name}\n`;
                msg += `   💰 المطلوب: ${p.pendingWithdrawal.amount} غولد\n`;
                msg += `   💎 الرصيد الحالي: ${p.gold} غولد\n`;
                msg += `   📅 التاريخ: ${dateStr}\n`;
            });

            msg += `\n💡 لمعالجة: معالجة_سحب [ID] [قبول/رفض]`;
            msg += `\n💡 للتنقل: طلبات_سحب [رقم]`;

            return msg;
        } catch (error) {
            console.error('❌ خطأ في طلبات السحب:', error);
            return '❌ حدث خطأ في جلب الطلبات.';
        }
    }

    // ✅ عرض إحصائيات لاعب محدد (للأدمن)
    async showPlayerEconomy(playerName) {
        try {
            const player = await Player.findOne({
                name: { $regex: new RegExp(playerName, 'i') }
            });

            if (!player) {
                return `❌ لم يتم العثور على لاعب باسم: ${playerName}`;
            }

            const referralsCount = player.referralCount || 0;
            const referralRewards = referralsCount * 50;

            // حساب ترتيبه
            const rank = await Player.countDocuments({
                registrationStatus: 'completed',
                gold: { $gt: player.gold }
            }) + 1;

            let msg = `💰 اقتصاد اللاعب: ${player.name}\n\n`;
            msg += `💎 الرصيد الحالي: ${player.gold} غولد\n`;
            msg += `📊 المستوى: ${player.level}\n`;
            msg += `🏆 الترتيب: #${rank}\n\n`;
            msg += `👥 عدد الإحالات: ${referralsCount}\n`;
            msg += `💰 أرباح الإحالة: ${referralRewards} غولد\n\n`;

            if (player.pendingWithdrawal?.status === 'pending') {
                msg += `💸 طلب سحب معلق: ${player.pendingWithdrawal.amount} غولد\n`;
            }

            const totalTransactions = player.transactions?.length || 0;
            msg += `📋 إجمالي المعاملات: ${totalTransactions}\n`;

            return msg;
        } catch (error) {
            console.error('❌ خطأ في اقتصاد اللاعب:', error);
            return '❌ حدث خطأ.';
        }
    }
}
