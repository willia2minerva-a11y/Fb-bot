const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// إنشاء تطبيق Express
const app = express();
app.use(bodyParser.json());

// قراءة المتغيرات البيئية
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN;
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const ADMIN_PSID = process.env.ADMIN_PSID;
const APP_SECRET = process.env.FB_APP_SECRET;

// التحقق من المتغيرات البيئية
const required = ["FB_PAGE_TOKEN", "FB_VERIFY_TOKEN", "FB_APP_SECRET", "ADMIN_PSID"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("❌ المتغيرات التالية ناقصة:", missing.join(", "));
  process.exit(1);
}

// ملف بيانات اللاعبين
const DATA_FILE = path.join(__dirname, "players.json");
try {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeJsonSync(DATA_FILE, { players: [] });
    console.log("📝 players.json تم إنشاؤه بنجاح.");
  }
} catch (err) {
  console.error("⚠️ خطأ أثناء إنشاء players.json:", err.message);
}

// دوال إدارة اللاعبين
const getPlayers = () => {
  try {
    return fs.readJsonSync(DATA_FILE).players;
  } catch (err) {
    console.error("⚠️ خطأ في قراءة players.json:", err.message);
    return [];
  }
};

const savePlayers = (players) => {
  try {
    fs.writeJsonSync(DATA_FILE, { players });
  } catch (err) {
    console.error("⚠️ خطأ في حفظ players.json:", err.message);
  }
};

const isAuthorized = (psid) => getPlayers().find((p) => p.id === psid && p.allowed);

const addPlayer = (psid, name) => {
  const players = getPlayers();
  if (!players.find((p) => p.id === psid)) {
    players.push({
      id: psid,
      name,
      allowed: false,
      stats: { level: 1, hp: 100, attack: 10 },
      resources: {},
    });
    savePlayers(players);
  }
};

// دالة إرسال رسالة
const sendMessage = (psid, message) => {
  axios
    .post(`https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: psid },
      message: { text: message },
    })
    .catch((err) => console.error("⚠️ خطأ إرسال:", err.response?.data || err.message));
};

// Webhook لتأكيد الربط مع فيسبوك
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  } else {
    return res.sendStatus(403);
  }
});

// استقبال الرسائل من فيسبوك
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const event = entry.messaging[0];
      const psid = event.sender.id;

      if (event.message && event.message.text) {
        const text = event.message.text.trim();
        addPlayer(psid, `Player_${psid}`);

        // أوامر المدير
        if (psid === ADMIN_PSID && text.startsWith("!اعطاء_صلاحية")) {
          const parts = text.split(" ");
          if (parts.length === 2) {
            const targetId = parts[1];
            const players = getPlayers();
            const player = players.find((p) => p.id === targetId);
            if (player) {
              player.allowed = true;
              savePlayers(players);
              sendMessage(psid, `✅ تم منح الصلاحية لـ ${targetId}`);
              sendMessage(targetId, "🎮 لقد تم منحك صلاحية اللعب!");
            } else {
              sendMessage(psid, "❌ لا يوجد لاعب بهذا المعرف.");
            }
          } else {
            sendMessage(psid, "استخدم: !اعطاء_صلاحية <psid>");
          }
          return;
        }

        // تحقق من صلاحية اللاعب
        if (!isAuthorized(psid)) {
          sendMessage(psid, "⛔ لم يتم منحك الصلاحية بعد للعب. انتظر الموافقة.");
          return;
        }

        // أوامر اللعبة
        if (text === "!مغارة") {
          sendMessage(psid, "⚔️ أنت تواجه وحشًا بسيطًا! قوة الوحش: 50");
        } else if (text === "!بروفايل") {
          const player = getPlayers().find((p) => p.id === psid);
          sendMessage(
            psid,
            `👤 الاسم: ${player.name}\n🏆 المستوى: ${player.stats.level}\n❤️ الصحة: ${player.stats.hp}\n⚔️ الهجوم: ${player.stats.attack}`
          );
        } else if (text === "!ترتيب") {
          const players = getPlayers();
          sendMessage(psid, `📊 عدد اللاعبين: ${players.length}\n(نظام الترتيب لاحقًا)`);
        } else if (text === "!خريطة") {
          sendMessage(
            psid,
            "🗺️ المناطق المتاحة:\n1- الثلوج ❄️\n2- السهوب 🌾\n3- الصحراء 🏜️\n4- الغابات 🌲"
          );
        } else {
          sendMessage(psid, "❓ أمر غير معروف. استخدم !مغارة، !بروفايل، !ترتيب، أو !خريطة");
        }
      }
    });

    return res.status(200).send("EVENT_RECEIVED");
  } else {
    return res.sendStatus(404);
  }
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
