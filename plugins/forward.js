const { cmd } = require("../command");
const { generateForwardMessageContent, relayMessage } = require("@whiskeysockets/baileys");

cmd({
    pattern: "forward",
    alias: ["fwd", "sendto"],
    react: "↪",
    desc: "Forward messages to a specific JID/LID",
    category: "main",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply, isOwner }) => {
    try {
        // Owner Check
        if (!isOwner) return reply("❌ Bot Owner use only.");
        
        // Target Check
        if (!q) return reply("📌 Please provide a target JID or LID.\nExample: .forward 947xxxxxxxx@s.whatsapp.net");
        
        // Quoted Message Check
        if (!m.quoted) return reply("❌ Please reply to the message you want to forward.");

        const targetJid = q.trim();

        // මැසේජ් එකේ Content එක Forward කිරීමට සුදුසු විදිහට සකස් කිරීම
        // Gifted-Baileys වල m.quoted.fakeObj එක තමයි මුල් මැසේජ් එකේ දත්ත තියාගන්නේ
        let forwardContent = await generateForwardMessageContent(m.quoted.fakeObj, { force: true });

        // Content එකේ තියෙන message එක Target එකට Relay කිරීම
        // මේකෙන් තමයි RAM එක යන්නේ නැතුව Forward වෙන්නේ
        await bot.relayMessage(targetJid, forwardContent.message, { 
            messageId: forwardContent.key.id 
        });

        await bot.sendMessage(from, { react: { text: "✅", key: mek.key } });
        reply(`🚀 *Message Forwarded Successfully!*\n\n🎯 *To:* ${targetJid}`);

    } catch (e) {
        console.error("FORWARD ERROR:", e);
        reply("❌ Forwarding failed: " + e.message);
    }
});
