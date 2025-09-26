const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN;
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

// وضع psid الخاص بك كمدير
const ADMIN_PSID = 'ضع_psid_خاصتك_هنا'; // استبدله برقم معرفك

const DATA_FILE = path.join(__dirname, 'players.json');

if (!fs.existsSync(DATA_FILE)) fs.writeJsonSync(DATA_FILE, { players: [] });

const getPlayers = () => fs.readJsonSync(DATA_FILE).players;
const savePlayers = (players) => fs.writeJsonSync(DATA_FILE, { players });
const isAuthorized = (psid) => getPlayers().find(p => p.id === psid && p.allowed);

const addPlayer = (psid, name) => {
    const players = getPlayers();
    if (!players.find(p => p.id === psid)) {
        players.push({ id: psid, name, allowed: false, stats: { level: 1, hp: 100, attack: 10 }, resources: {} });
        savePlayers(players);
    }
};

const sendMessage = (psid, message) => {
    axios.post(`https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: psid },
        message: { text: message }
    }).catch(err => console.error(err.response?.data));
};

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const event = entry.messaging[0];
            const psid = event.sender.id;

            if (event.message && event.message.text) {
                const text = event.message.text.trim();
                addPlayer(psid, `Player_${psid}`);

                // أوامر المدير فقط
                if (psid === ADMIN_PSID && text.startsWith("!اعطاء_صلاحية")) {
                    const parts = text.split(" ");
                    if (parts.length === 2) {
                        const targetId = parts[1];
                        const players = getPlayers();
                        const player = players.find(p => p.id === targetId);
                        if (player) {
                            player.allowed = true;
                            savePlayers(players);
                            sendMessage(psid, `تم منح الصلاحية لـ ${targetId}`);
                            sendMessage(targetId, "لقد تم منحك صلاحية اللعب! 🎮");
                        } else {
                            sendMessage(psid, "لا يوجد لاعب بهذا المعرف.");
                        }
                    } else {
                        sendMessage(psid, "استخدم: !اعطاء_صلاحية <psid>");
                    }
                    return;
                }

                // التحقق من صلاحية اللاعب
                if (!isAuthorized(psid)) {
                    sendMessage(psid, "لم يتم منحك الصلاحية بعد للعب. انتظر الموافقة.");
                    return;
                }

                // أوامر اللعبة
                if (text === "!مغارة") {
                    sendMessage(psid, "أنت تواجه وحشًا بسيطًا! قوة الوحش: 50");
                } else if (text === "!بروفايل") {
                    const player = getPlayers().find(p => p.id === psid);
                    sendMessage(psid, `الاسم: ${player.name}\nالمستوى: ${player.stats.level}\nالصحة: ${player.stats.hp}\nالهجوم: ${player.stats.attack}`);
                } else if (text === "!ترتيب") {
                    const players = getPlayers();
                    sendMessage(psid, `عدد اللاعبين: ${players.length}\nتأكد من تطوير نظام الترتيب لاحقًا`);
                } else if (text === "!خريطة") {
                    sendMessage(psid, "المناطق المتاحة:\n1- الثلوج ❄️\n2- السهوب 🌾\n3- الصحراء 🏜️\n4- الغابات 🌲");
                } else {
                    sendMessage(psid, "أمر غير معروف. استخدم !مغارة، !بروفايل، !ترتيب، أو !خريطة");
                }
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
