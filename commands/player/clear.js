const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { useQueue } = require('discord-player');
const safeReply = require('../../utils/common/safeReply');

module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears current server queue.'),
    async execute(interaction) {
        // Get the current queue
        const queue = useQueue();

        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ This server does not have an active player session.");

            return await safeReply(interaction, { embeds: [embed] });
        }

        queue.clear();

        const embed = new EmbedBuilder()
            .setDescription("💥 Server's player queue has been cleared.");

        return await safeReply(interaction, { embeds: [embed] });
    }
}