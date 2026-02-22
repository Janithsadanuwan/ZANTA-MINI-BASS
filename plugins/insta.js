const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd({
    pattern: "insta",
    alias: ["ig", "instagram", "igdl"],
    react: "📸",
    desc: "Download Instagram Media with selection menu",
    category: "download",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply, prefix, senderNumber, sender }) => {
    try {
        if (!q) return reply("📸 *ZANTA-MD INSTAGRAM DL*\n\nExample: .insta https://www.instagram.com/reels/xxxx/");
        if (!q.includes("instagram.com")) return reply("❌ Please provide a valid Instagram link.");

        // API Request එකට රිඇක්ෂන් එකක් දාමු
        await bot.sendMessage(from, { react: { text: "🔍", key: mek.key } });

        // Vercel API එකට request එක යැවීම
        const apiUrl = `https://zanta-api.vercel.app/api/insta?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.status) {
            const result = response.data;
            
            let msg = `✨ *ZANTA-MD INSTA DL* ✨\n\n` +
                      `📝 *Type:* Instagram Media\n` +
                      `🔗 *Link:* ${q.split('?')[0]}\n\n` +
                      `*Reply with a number:* \n\n` +
                      `1️⃣ *Download Media* (Video/Image)\n\n` +
                      `> *© Powered by ZANTA-MD*`;

            const sentMsg = await bot.sendMessage(from, { 
                image: { url: result.thumbnail }, 
                caption: msg 
            }, { quoted: mek });

            // --- Reply Listener Logic ---
            const listener = async (update) => {
                const msgUpdate = update.messages[0];
                if (!msgUpdate.message) return;

                const body = msgUpdate.message.conversation || 
                             msgUpdate.message.extendedTextMessage?.text;

                // මේක reply එකක්ද කියලා බලමු
                const isReplyToBot = msgUpdate.message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

                if (isReplyToBot && body === '1') {
                    // Listener එක මුලින්ම ඕෆ් කරමු double requests නොවෙන්න
                    bot.ev.off('messages.upsert', listener);

                    await bot.sendMessage(from, { react: { text: '📥', key: msgUpdate.key } });

                    try {
                        const mediaUrl = result.downloadUrl;
                        
                        // URL එක ඇතුළේ mp4 තියෙනවද කියලා check කිරීම (Case insensitive)
                        const isVideo = mediaUrl.toLowerCase().includes("mp4") || mediaUrl.toLowerCase().includes("video");

                        if (isVideo) {
                            await bot.sendMessage(from, { 
                                video: { url: mediaUrl }, 
                                caption: `✅ *Downloaded by ZANTA-MD*`,
                                mimetype: 'video/mp4', // අනිවාර්යයි
                                fileName: 'insta_video.mp4'
                            }, { quoted: msgUpdate });
                        } else {
                            await bot.sendMessage(from, { 
                                image: { url: mediaUrl }, 
                                caption: `✅ *Downloaded by ZANTA-MD*`
                            }, { quoted: msgUpdate });
                        }

                        await bot.sendMessage(from, { react: { text: '✅', key: msgUpdate.key } });
                    } catch (err) {
                        console.error("SEND ERROR:", err);
                        reply("❌ Error while sending media. The link might have expired.");
                    }
                }
            };

            bot.ev.on('messages.upsert', listener);

            // විනාඩි 5කින් listener එක auto kill කරමු
            setTimeout(() => {
                bot.ev.off('messages.upsert', listener);
            }, 300000);

        } else {
            return reply("❌ Media not found. Please check the link and try again.");
        }

    } catch (e) {
        console.log("INSTA ERROR:", e);
        reply("❌ *Error:* " + (e.response?.data?.message || e.message));
    }
});
