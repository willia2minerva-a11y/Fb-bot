const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// ميدل وير لفهم JSON
app.use(bodyParser.json());

// راوت للتأكد أن السيرفر شغال
app.get("/", (req, res) => {
  res.send("🚀 Fb Bot is running successfully!");
});

// ويبهوك لمسنجر
app.post("/webhook", (req, res) => {
  console.log("Webhook event:", req.body);

  // مثال رد بسيط
  if (req.body.object === "page") {
    req.body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// تأكيد التحقق من الفيسبوك
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "my_secret_token";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
