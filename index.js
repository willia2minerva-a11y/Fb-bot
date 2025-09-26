const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoose = require("mongoose"); // أضفنا هذه المكتبة

const app = express();
app.use(bodyParser.json());

// ======================\
// التحقق من المتغيرات البيئية
// ======================\
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN;
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const ADMIN_PSID = process.env.ADMIN_PSID;
const MONGO_URI = process.env.MONGO_URI; // متغير رابط قاعدة البيانات

// نتأكد أن كل المتغيرات موجودة
if (!PAGE_ACCESS_TOKEN || !VERIFY_TOKEN || !MONGO_URI || !ADMIN_PSID) {
  console.error("❌ تأكد من وجود كل المتغيرات البيئية: FB_PAGE_TOKEN, FB_VERIFY_TOKEN, ADMIN_PSID, MONGO_URI");
  process.exit(1);
}

// ======================\
// الاتصال بقاعدة البيانات
// ======================\
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ تم الاتصال بقاعدة البيانات بنجاح"))
  .catch(err => {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", err);
    process.exit(1);
  });

// ======================\
// تعريف شكل بيانات اللاعب في قاعدة البيانات
// ======================\
const playerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // معرف اللاعب
  name: String,
  allowed: { type: Boolean, default: false }, // هل مسموح له باللعب
  stats: {
    level: { type: Number, default: 1 },
    hp: { type: Number, default: 100 },
    attack: { type: Number, default: 10 },
  },
  resources: {
    wood: { type: Number, default: 0 },
    stone: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
  },
});

const Player = mongoose.model("Player", playerSchema);

// ======================\
// إرسال رسالة (تبقى كما هي)
// ======================\
const sendMessage = (psid, message) => {
  axios.post(
    `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    { recipient: { id: psid }, message: { text: message } }
  ).catch((err) => console.error("Error sending message:", err.response?.data || err.message));
};

// ======================\
// Webhook
// ======================\
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

// نستخدم async لأننا سنتعامل مع قاعدة البيانات التي تحتاج وقتًا للرد
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      const psid = event.sender.id;
      const text = event.message?.text?.trim();

      if (!text) continue; // تجاهل الرسائل التي ليست نصية

      try {
        // نبحث عن اللاعب، إذا لم يكن موجودًا، ننشئ واحدًا جديدًا
        let player = await Player.findOne({ id: psid });
        if (!player) {
          player = await Player.create({ id: psid, name: `Player_${psid}` });
        }

        // 🔹 أوامر المدير
        if (psid === ADMIN_PSID && text.startsWith("!اعطاء_صلاحية")) {
          const targetId = text.split(" ")[1];
          if (!targetId) {
             sendMessage(psid, "استخدم: !اعطاء_صلاحية <psid>");
             continue;
          }
          const playerToAuthorize = await Player.findOneAndUpdate(
            { id: targetId },
            { allowed: true },
            { new: true } // لإرجاع اللاعب بعد التحديث
          );

          if (playerToAuthorize) {
            sendMessage(psid, `✅ تم منح الصلاحية لـ ${playerToAuthorize.name}`);
            sendMessage(targetId, "🎮 لقد تم منحك صلاحية اللعب!");
          } else {
            sendMessage(psid, "❌ لا يوجد لاعب بهذا المعرف.");
          }
          continue; // ننتقل للحدث التالي
        }

        // 🔹 منع غير المصرح لهم
        if (!player.allowed) {
          sendMessage(psid, "⛔ لم يتم منحك الصلاحية بعد للعب. اطلب من المدير إضافتك.");
          continue;
        }

        // 🔹 أوامر اللعبة
        let replyMessage = ""; // رسالة الرد
        switch (text) {
          case "!مغارة":
            player.stats.hp -= 10;
            replyMessage = `⚔️ دخلت المغارة وواجهت وحشًا! صحتك الآن: ${player.stats.hp}`;
            break;
          case "!بروفايل":
            replyMessage = `👤 الاسم: ${player.name}\n🏆 المستوى: ${player.stats.level}\n❤️ الصحة: ${player.stats.hp}\n⚔️ الهجوم: ${player.stats.attack}`;
            break;
          // ... يمكنك إضافة باقي الأوامر هنا بنفس الطريقة
          default:
            replyMessage = "❓ أمر غير معروف. الأوامر المتاحة: !مغارة, !بروفايل";
        }
        
        await player.save(); // نحفظ أي تغييرات على اللاعب في قاعدة البيانات
        sendMessage(psid, replyMessage);

      } catch (error) {
        console.error("Error processing webhook:", error);
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ======================\
// تشغيل السيرفر (تبقى كما هي)
// ======================\
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
