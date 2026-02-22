const { cmd } = require("../command");

cmd({
    pattern: "forward",
    alias: ["fwd", "sendto"],
    react: "↪",
    desc: "Forward messages using Gifted-Baileys method",
    category: "main",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Bot Owner use only.");
        if (!q) return reply("📌 Please provide a target JID or LID.");
        if (!m.quoted) return reply("❌ Reply to a message to forward.");

        const targetJid = q.trim();

        // Gifted-Baileys වල තියෙන copyNForward function එක පාවිච්චි කරමු.
        // මේකෙන් Caption, ViewOnce, සහ LID issues ඔක්කොම ලේසියෙන් handle වෙනවා.
        await bot.copyNForward(targetJid, m.quoted.fakeObj, true);

        await bot.sendMessage(from, { react: { text: "✅", key: mek.key } });
        reply(`🚀 Forwarded to: ${targetJid}`);

    } catch (e) {
        console.error("FORWARD ERROR:", e);
        reply("❌ Error: " + e.message);
    }
});
