import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs-extra";

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN;
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const ADMIN_PSID = process.env.ADMIN_PSID || "123456789"; // ضع ID حقك هنا أو في Railway

const PLAYERS_FILE = "./players.json";

// ✅ تحميل اللاعبين من ملف
function loadPlayers() {
  try {
    return fs.readJsonSync(PLAYERS_FILE);
  } catch {
    return {};
  }
}

// ✅ حفظ اللاعبين
function savePlayers(players) {
  fs.writeJsonSync(PLAYERS_FILE, players, { spaces: 2 });
}

// ✅ إضافة لاعب جديد
function addPlayer(psid, name = "مغامر") {
  const players = loadPlayers();
  if (!players[psid]) {
    players[psid] = {
      name,
      level: 1,
      health: 100,
      attack: 10,
      resources: 0,
      authorized: psid === ADMIN_PSID // المدير مفعّل تلقائي
    };
    savePlayers(players);
  }
  return players[psid];
}

// ✅ Webhook للتحقق
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

// ✅ استقبال الرسائل
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ✅ معالجة الرسائل
function handleMessage(sender_psid, received_message) {
  const players = loadPlayers();
  let player = players[sender_psid] || addPlayer(sender_psid);

  if (!player.authorized && sender_psid !== ADMIN_PSID) {
    return callSendAPI(sender_psid, { text: "❌ لست مصرح لك باللعب، اطلب من المدير الإذن." });
  }

  const text = received_message.text?.trim();

  if (!text) return;

  if (text === "!مغارة") {
    player.health -= 10;
    player.resources += 5;
    callSendAPI(sender_psid, {
      text: `👹 واجهت وحشًا! -10 صحة. +5 موارد. \nالصحة: ${player.health}, الموارد: ${player.resources}`
    });
  } else if (text === "!بروفايل") {
    callSendAPI(sender_psid, {
      text: `📜 بروفايلك:\nالاسم: ${player.name}\nالمستوى: ${player.level}\nالصحة: ${player.health}\nالهجوم: ${player.attack}\nالموارد: ${player.resources}`
    });
  } else if (text === "!ترتيب") {
    const count = Object.keys(players).length;
    callSendAPI(sender_psid, { text: `👥 عدد اللاعبين: ${count}` });
  } else if (text === "!خريطة") {
    callSendAPI(sender_psid, {
      text: "🗺️ المناطق المتاحة: \n- الثلوج ❄️\n- السهوب 🌾\n- الصحراء 🏜️\n- الغابات 🌳"
    });
  } else if (text.startsWith("!authorize") && sender_psid === ADMIN_PSID) {
    const target = text.split(" ")[1];
    if (players[target]) {
      players[target].authorized = true;
      savePlayers(players);
      callSendAPI(sender_psid, { text: `✅ تم منح الإذن لـ ${players[target].name}` });
    } else {
      callSendAPI(sender_psid, { text: "❌ اللاعب غير موجود." });
    }
  } else {
    callSendAPI(sender_psid, { text: "⚔️ الأوامر: !مغارة, !بروفايل, !ترتيب, !خريطة" });
  }

  players[sender_psid] = player;
  savePlayers(players);
}

// ✅ إرسال رسالة
function callSendAPI(sender_psid, response) {
  axios({
    method: "POST",
    url: `https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    data: {
      recipient: { id: sender_psid },
      message: response,
    },
  })
    .then(() => console.log("✅ رسالة أرسلت"))
    .catch((err) => console.error("❌ خطأ:", err.response?.data || err.message));
}

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot is running on port ${PORT}`));
