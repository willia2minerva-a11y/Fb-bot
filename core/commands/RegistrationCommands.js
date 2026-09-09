// core/commands/commands/RegistrationCommands.js
import { BaseCommand } from './BaseCommand.js';
import { locations } from '../../data/locations.js';

export class RegistrationCommands extends BaseCommand {
    getCommands() {
        return {
            'بدء': this.handleStart.bind(this),
            'ابدأ': this.handleStart.bind(this),
            'ابدء': this.handleStart.bind(this),
            'ابد': this.handleStart.bind(this),
            'معرفي': this.handleGetId.bind(this),
            'معرف': this.handleGetId.bind(this),
            'اي دي': this.handleGetId.bind(this),
            'ذكر': this.handleGenderMale.bind(this),
            'رجل': this.handleGenderMale.bind(this),
            'ولد': this.handleGenderMale.bind(this),
            'انثى': this.handleGenderFemale.bind(this),
            'أنثى': this.handleGenderFemale.bind(this),
            'بنت': this.handleGenderFemale.bind(this),
            'فتاة': this.handleGenderFemale.bind(this),
            'اسمي': this.handleSetName.bind(this)
        };
    }

    getLocationName(locationId) {
        if (!locationId) return 'الغابة';
        return locations[locationId]?.name || locationId;
    }

    async handleStart(player) {
        try {
            if (player.isPending()) {
                return `🔒 حسابك غير نشط

📩 راسل الأدمن لتفعيل حسابك:
${this.commandHandler?.adminProfileUrl || 'https://www.facebook.com/'}

🆔 معرفك:
${player.userId}

📋 الأوامر المسموحة:
• حالتي
• معرفي
• مساعدة`;
            }

            if (player.isApprovedButNotCompleted()) {
                const registrationSystem = await this.getSystem('registration');
                const step = registrationSystem ? registrationSystem.getRegistrationStep(player.userId) : null;

                if (step?.step === 'gender_selection') {
                    return `👋 أهلاً ${player.name}

✅ تمت الموافقة على حسابك

اختر جنس شخصيتك:
• ذكر 👦
• أنثى 👧

⚠️ هذا الخيار نهائي`;
                }

                if (step?.step === 'name_selection') {
                    return `📝 اختر اسم إنجليزي

اكتب: اسمي [الاسم]
بين 3 إلى 9 أحرف إنجليزية

مثال:
اسمي John
اسمي Sarah`;
                }
            }

            const locationName = this.getLocationName(player.currentLocation);

            return `🎮 مرحباً ${player.name} في مغارة غولد!

📍 موقعك: ${locationName}
✨ مستواك: ${player.level}
💰 ذهبك: ${player.gold}

اكتب "مساعدة" لرؤية الأوامر`;
        } catch (error) {
            return this.handleError(error, 'بدء اللعبة');
        }
    }

    async handleGetId(player) {
        return `🆔 معرفك هو:

${player.userId}

📨 أرسل هذا المعرف للأدمن للتفعيل

💡 خطوات التفعيل:
1. انسخ المعرف
2. أرسله للأدمن
3. انتظر الموافقة
4. اكتب "بدء" بعد الموافقة

⏳ حالتك: ${player.registrationStatus === 'pending' ? 'قيد الانتظار' : player.registrationStatus}`;
    }

    async handleGenderMale(player) {
        if (!player.isApprovedButNotCompleted()) {
            return this.getRegistrationMessage(player);
        }

        const registrationSystem = await this.getSystem('registration');
        if (registrationSystem) {
            return await registrationSystem.setGender(player.userId, 'male');
        }

        player.gender = 'male';
        player.registrationStatus = 'name_pending';
        await player.save();

        return `✅ تم اختيار الجنس: ذكر 👦

📝 الآن اختر اسم إنجليزي:
اكتب "اسمي [الاسم]"
بين 3 إلى 9 أحرف

مثال: اسمي John`;
    }

    async handleGenderFemale(player) {
        if (!player.isApprovedButNotCompleted()) {
            return this.getRegistrationMessage(player);
        }

        const registrationSystem = await this.getSystem('registration');
        if (registrationSystem) {
            return await registrationSystem.setGender(player.userId, 'female');
        }

        player.gender = 'female';
        player.registrationStatus = 'name_pending';
        await player.save();

        return `✅ تم اختيار الجنس: أنثى 👧

📝 الآن اختر اسم إنجليزي:
اكتب "اسمي [الاسم]"
بين 3 إلى 9 أحرف

مثال: اسمي Sarah`;
    }

    async handleSetName(player, args) {
        if (!player.isApprovedButNotCompleted()) {
            return this.getRegistrationMessage(player);
        }

        const name = args.join(' ');
        if (!name) return '❌ اكتب اسمك. مثال: اسمي John';

        const registrationSystem = await this.getSystem('registration');
        if (registrationSystem) {
            return await registrationSystem.setName(player.userId, name);
        }

        if (name.length < 3 || name.length > 9) {
            return '❌ الاسم يجب أن يكون بين 3 و 9 أحرف.';
        }
        if (!/^[a-zA-Z]+$/.test(name)) {
            return '❌ الاسم إنجليزي فقط.';
        }

        player.name = name;
        player.registrationStatus = 'completed';
        await player.save();

        return `🎉 اكتمل إنشاء شخصيتك!

✅ الاسم: ${name}
✅ الجنس: ${player.gender === 'male' ? 'ذكر 👦' : 'أنثى 👧'}

🎮 اكتب "مساعدة" لرؤية الأوامر`;
    }
}
