// core/commands/commands/RegistrationCommands.js
import { BaseCommand } from './BaseCommand.js';

export class RegistrationCommands extends BaseCommand {
    getCommands() {
        return {
            'بدء': this.handleStart.bind(this),
            'معرفي': this.handleGetId.bind(this),
            'ذكر': this.handleGenderMale.bind(this),
            'رجل': this.handleGenderMale.bind(this),
            'ولد': this.handleGenderMale.bind(this),
            'أنثى': this.handleGenderFemale.bind(this),
            'بنت': this.handleGenderFemale.bind(this),
            'فتاة': this.handleGenderFemale.bind(this),
            'اسمي': this.handleSetName.bind(this)
        };
    }

    async handleStart(player) {
        try {
            if (player.isPending()) {
                return `⏳ **حسابك قيد الانتظار للموافقة**

📝 **لتفعيل حسابك:**
1. اكتب "معرفي" للحصول على معرفك
2. أرسل المعرف للمدير
3. انتظر موافقة المدير

📋 **الأوامر المتاحة لك حالياً:**
• \`حالتي\` - عرض حالتك
• \`معرفي\` - عرض المعرف للمدير
• \`مساعدة\` - عرض الأوامر المتاحة

💡 بعد الموافقة، ستتمكن من إكمال إنشاء شخصيتك.`;
            } else if (player.isApprovedButNotCompleted()) {
                const registrationSystem = await this.getSystem('registration');
                const step = registrationSystem ? registrationSystem.getRegistrationStep(player.userId) : null;

                if (step && step.step === 'gender_selection') {
                    return `👋 **مرحباً ${player.name}!**

✅ **تمت موافقة المدير على حسابك!**

الآن يرجى اختيار جنس شخصيتك:
• اكتب "ذكر" 👦
• اكتب "أنثى" 👧

💡 هذا الخيار نهائي وسيؤثر على مظهر شخصيتك.`;
                } else if (step && step.step === 'name_selection') {
                    return `📝 **الآن يرجى اختيار اسم إنجليزي**

اكتب "اسمي [الاسم]" بين 3 إلى 9 أحرف إنجليزية
مثال: اسمي John
مثال: اسمي Sarah

💡 الاسم سيكون هوية شخصيتك في اللعبة.`;
                }
            }

            return `🎮 **مرحباً ${player.name} في مغارة غولد!**
📍 موقعك: ${player.currentLocation}
✨ مستواك: ${player.level}
💰 ذهبك: ${player.gold}
اكتب "مساعدة" لرؤية الأوامر.`;
        } catch (error) {
            return this.handleError(error, 'بدء اللعبة');
        }
    }

    async handleGetId(player) {
        return `🆔 **معرفك هو:** \`${player.userId}\`

📨 **أرسل هذا المعرف للمدير للحصول على الموافقة.**

💡 **خطوات التفعيل:**
1. انسخ المعرف أعلاه
2. أرسله للمدير في رسالة خاصة
3. انتظر موافقة المدير
4. بعد الموافقة، اكتب "بدء" لمتابعة إنشاء شخصيتك

⏳ **حالة حسابك:** ${player.registrationStatus === 'pending' ? 'قيد الانتظار' : player.registrationStatus}`;
    }

    async handleGenderMale(player) {
        if (!player.isApprovedButNotCompleted()) {
            return this.getRegistrationMessage(player);
        }

        const registrationSystem = await this.getSystem('registration');
        if (registrationSystem) {
            const result = await registrationSystem.setGender(player.userId, 'male');
            return result;
        } else {
            player.gender = 'male';
            player.registrationStatus = 'name_pending';
            await player.save();
            return `✅ تم اختيار الجنس: ذكر 👦

📝 **الآن يرجى اختيار اسم إنجليزي:**
اكتب "اسمي [الاسم]" بين 3 إلى 9 أحرف إنجليزية
مثال: اسمي John

💡 الاسم سيكون هوية شخصيتك في اللعبة.`;
        }
    }

    async handleGenderFemale(player) {
        if (!player.isApprovedButNotCompleted()) {
            return this.getRegistrationMessage(player);
        }

        const registrationSystem = await this.getSystem('registration');
        if (registrationSystem) {
            const result = await registrationSystem.setGender(player.userId, 'female');
            return result;
        } else {
            player.gender = 'female';
            player.registrationStatus = 'name_pending';
            await player.save();
            return `✅ تم اختيار الجنس: أنثى 👧

📝 **الآن يرجى اختيار اسم إنجليزي:**
اكتب "اسمي [الاسم]" بين 3 إلى 9 أحرف إنجليزية
مثال: اسمي Sarah

💡 الاسم سيكون هوية شخصيتك في اللعبة.`;
        }
    }

    async handleSetName(player, args) {
        if (!player.isApprovedButNotCompleted()) {
            return this.getRegistrationMessage(player);
        }

        const name = args.join(' ');
        if (!name) return '❌ يرجى تحديد اسم. مثال: اسمي John';

        const registrationSystem = await this.getSystem('registration');
        if (registrationSystem) {
            const result = await registrationSystem.setName(player.userId, name);
            return result;
        } else {
            if (name.length < 3 || name.length > 9) {
                return '❌ الاسم يجب أن يكون بين 3 إلى 9 أحرف.';
            }
            if (!/^[a-zA-Z]+$/.test(name)) {
                return '❌ الاسم يجب أن يحتوي على أحرف إنجليزية فقط.';
            }

            player.name = name;
            player.registrationStatus = 'completed';
            await player.save();
            return `🎉 **تهانينا! اكتمل إنشاء شخصيتك!**

✅ **تم اختيار الاسم:** ${name}
✅ **الجنس:** ${player.gender === 'male' ? 'ذكر 👦' : 'أنثى 👧'}

🎮 **الآن يمكنك البدء في اللعب!**
اكتب "مساعدة" لرؤية جميع الأوامر المتاحة.`;
        }
    }
}
