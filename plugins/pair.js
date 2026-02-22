const { cmd } = require("../command");
const axios = require("axios");

const CHANNEL_JID = "120363406265537739@newsletter";
const cooldowns = new Map();
const PAIR_IMAGE = "https://raw.githubusercontent.com/Akashkavindu/MINI-BOT-SOURCE/main/zanta-md.png";

cmd({
    pattern: "pair",
    alias: ["code", "login"],
    react: "🔑",
    desc: "Get ZANTA-MD pair code.",
    category: "main",
    filename: __filename
}, async (bot, mek, m, { from, q, reply, userSettings }) => {
    try {
        if (!q) return reply("ℹ️ *Please provide your phone number.*\n*Example:* .pair 947xxxxxxxx");

        let phoneNumber = q.replace(/[^0-9]/g, '');
        
        // Cooldown Check
        if (cooldowns.has(phoneNumber)) {
            return reply("⏳ *Wait a moment!* Request already in progress.");
        }

        await bot.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // Cooldown Set (40s)
        cooldowns.set(phoneNumber, Date.now());
        setTimeout(() => cooldowns.delete(phoneNumber), 40000); 

        const pairUrl = `https://zanta-mini-pair.onrender.com/code?number=${phoneNumber}`;

        const response = await axios.get(pairUrl, { timeout: 30000 });

        if (response.data && response.data.code) {
            const pairCode = response.data.code;
            const settings = userSettings || {};
            const isButtonsOn = settings.buttons === 'true';

            // --- [ Stylish Message Construction ] ---
            let mainMsg = `✨ *𝚉𝙰𝙽𝚃𝙰-𝙼𝙳* ✨\n\n` +
                          `  👤 *𝙽𝚄𝙼𝙱𝙴𝚁:* ${phoneNumber}\n` +
                          `  🔑 *𝙲𝙾𝙳𝙴:* ${pairCode}\n\n` +
                          `*𝟷.* 𝙲𝚘𝚙𝚢 𝚝𝚑𝚎 𝚌𝚘𝚍𝚎 𝚊𝚋𝚘𝚟𝚎.\n` +
                          `*2.* 𝙿𝚊𝚜𝚝𝚎 𝚒𝚝 𝚘𝚗 𝚢𝚘𝚞𝚛 𝚠𝚑𝚊𝚝𝚜𝚊𝚙𝚙.\n\n` +
                          `> *© 𝚉𝙰𝙽𝚃𝙰-𝙼𝙳 𝙾𝙵𝙵𝙸𝙲𝙸𝙰𝙻*`;

            const contextInfo = {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: CHANNEL_JID,
                    serverMessageId: 100,
                    newsletterName: "𝒁𝑨𝑵𝑻𝑨-𝑴𝑫 𝑶𝑭𝑭𝑰𝑪𝑰𝑨𝑳 </>"
                }
            };

            if (isButtonsOn) {
                // Button පාවිච්චි කිරීම (Copy button එකක් ලෙස)
                await bot.sendMessage(from, {
                    image: { url: PAIR_IMAGE },
                    caption: mainMsg,
                    footer: `© ZANTA-MD • PAIR CODE`,
                    buttons: [
                        { buttonId: `copy_code`, buttonText: { displayText: `📋 COPY CODE: ${pairCode}` }, type: 1 }
                    ],
                    headerType: 4,
                    contextInfo
                }, { quoted: mek });
            } else {
                // Button Off නම් සාමාන්‍ය මැසේජ් එක
                await bot.sendMessage(from, { 
                    image: { url: PAIR_IMAGE }, 
                    caption: mainMsg + `\n\n*Code:* ${pairCode}`, // Button නැති නිසා කෝඩ් එක වෙනම ලියා යවනවා
                    contextInfo 
                }, { quoted: mek });
            }

            await bot.sendMessage(from, { react: { text: '✅', key: mek.key } });

        } else {
            throw new Error("Invalid response");
        }

    } catch (e) {
        cooldowns.delete(q.replace(/[^0-9]/g, ''));
        console.error("Pair Error:", e.message);
        reply("❌ *Error:* සර්වර් එකෙන් කෝඩ් එක ලබාගත නොහැකි විය.");
    }
});
