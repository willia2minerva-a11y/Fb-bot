const express = require("express");
const app = express();

// هنا اكتب رمز الاستدعاء اللي تختاره بنفسك
const VERIFY_TOKEN = "my_secret_token";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));            sendMessage(psid, `✅ تم منح الصلاحية لـ ${playerToAuthorize.name}`);
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
