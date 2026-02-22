const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");
const { Readable } = require("stream"); // Stream එකක් විදිහට හසුරුවන්න

cmd({
    pattern: "insta",
    alias: ["ig", "instagram", "igdl"],
    react: "📸",
    desc: "Download Instagram Media with stream optimization",
    category: "download",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply, prefix, senderNumber, sender }) => {
    try {
        if (!q) return reply("📸 *ZANTA-MD INSTAGRAM DL*\n\nExample: .insta https://www.instagram.com/reels/xxxx/");
        if (!q.includes("instagram.com")) return reply("❌ Please provide a valid Instagram link.");

        await bot.sendMessage(from, { react: { text: "🔍", key: mek.key } });

        const apiUrl = `https://zanta-api.vercel.app/api/insta?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.status) {
            const result = response.data;
            
            let msg = `✨ *ZANTA-MD INSTA DL* ✨\n\n` +
                      `📝 *Type:* Instagram Media\n` +
                      `🔗 *Link:* ${q.split('?')[0]}\n\n` +
                      `*Reply with a number:* \n\n` +
                      `1️⃣ *Download Media* (Optimized)\n\n` +
                      `> *© Powered by ZANTA-MD*`;

            const sentMsg = await bot.sendMessage(from, { 
                image: { url: result.thumbnail }, 
                caption: msg 
            }, { quoted: mek });

            const listener = async (update) => {
                const msgUpdate = update.messages[0];
                if (!msgUpdate || !msgUpdate.message) return;

                const body = msgUpdate.message.conversation || 
                             msgUpdate.message.extendedTextMessage?.text;

                const isReplyToBot = msgUpdate.message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

                if (isReplyToBot && body === '1') {
                    bot.ev.off('messages.upsert', listener);
                    await bot.sendMessage(from, { react: { text: '📥', key: msgUpdate.key } });

                    try {
                        const mediaUrl = result.downloadUrl;
                        const isVideo = mediaUrl.toLowerCase().includes("mp4") || mediaUrl.toLowerCase().includes("video");

                        // AXIOS STREAM පාවිච්චි කිරීම
                        const mediaResponse = await axios({
                            method: 'get',
                            url: mediaUrl,
                            responseType: 'stream', // මෙතන තමයි magic එක තියෙන්නේ
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                                'Referer': 'https://instasave.website/'
                            }
                        });

                        if (isVideo) {
                            await bot.sendMessage(from, { 
                                video: { stream: mediaResponse.data }, // Stream එකක් විදිහට යවනවා
                                caption: `✅ *Downloaded by ZANTA-MD*`,
                                mimetype: 'video/mp4',
                                fileName: 'insta_video.mp4'
                            }, { quoted: msgUpdate });
                        } else {
                            await bot.sendMessage(from, { 
                                image: { stream: mediaResponse.data }, 
                                caption: `✅ *Downloaded by ZANTA-MD*`
                            }, { quoted: msgUpdate });
                        }

                        await bot.sendMessage(from, { react: { text: '✅', key: msgUpdate.key } });
                    } catch (err) {
                        console.error("STREAM ERROR:", err.message);
                        reply("❌ Failed to stream media. The link might be restricted.");
                    }
                }
            };

            bot.ev.on('messages.upsert', listener);
            setTimeout(() => bot.ev.off('messages.upsert', listener), 300000);

        } else {
            return reply("❌ Media not found.");
        }

    } catch (e) {
        console.log("INSTA ERROR:", e);
        reply("❌ *Error:* " + (e.response?.data?.message || e.message));
    }
});
