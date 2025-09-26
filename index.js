const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");

const app = express().use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "test_token";

// تحميل بيانات اللاعبين
const playersFile = "./players.json";
function loadPlayers() {
  if (!fs.existsSync(playersFile)) return {};
  return JSON.parse(fs.readFileSync(playersFile));
}
function savePlayers(players) {
  fs.writeFileSync(playersFile, JSON.stringify(players, null, 2));
}

// ✅ Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Handle messages
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
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

function handleMessage(sender_psid, received_message) {
  let response;
  let players = loadPlayers();

  // لو اللاعب مش موجود، نضيفه
  if (!players[sender_psid]) {
    players[sender_psid] = {
      name: `Player-${sender_psid.substring(0, 5)}`,
      level: 1,
      health: 100,
      attack: 10,
      resources: 0
    };
    savePlayers(players);
  }
  const player = players[sender_psid];

  if (received_message.text) {
    const msg = received_message.text.trim();

    if (msg === "!مغارة") {
      let monsterHealth = 30;
      if (player.attack >= monsterHealth) {
        player.resources += 10;
        response = { text: `⚔️ ${player.name} هزم الوحش وربح 10 موارد! 🎉` };
      } else {
        player.health -= 20;
        response = { text: `💀 ${player.name} خسر المعركة! -20 صحة.` };
      }
      savePlayers(players);
    } else if (msg === "!بروفايل") {
      response = {
        text: `👤 الاسم: ${player.name}\n⭐ المستوى: ${player.level}\n❤️ الصحة: ${player.health}\n⚔️ الهجوم: ${player.attack}\n💎 الموارد: ${player.resources}`
      };
    } else if (msg === "!ترتيب") {
      const count = Object.keys(players).length;
      response = { text: `📊 عدد اللاعبين الحاليين: ${count}` };
    } else if (msg === "!خريطة") {
      response = { text: "🗺️ المناطق: الثلوج ❄️، السهوب 🌾، الصحراء 🏜️، الغابات 🌳" };
    } else {
      response = { text: "❓ الأوامر المتاحة: !مغارة ، !بروفايل ، !ترتيب ، !خريطة" };
    }
  }

  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  const request_body = {
    recipient: { id: sender_psid },
    message: response
  };

  axios.post(
    `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    request_body
  )
  .then(() => console.log("✅ Message sent!"))
  .catch(err => console.error("❌ Unable to send message:", err.response?.data || err));
}

// ✅ Use Heroku port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is listening on port ${PORT}`));
