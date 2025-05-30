const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { useTimeline } = require('discord-player');
const safeReply = require('../../utils/common/safeReply');

module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses playback at current server.'),
    async execute(interaction) {
        // Get the queue's timeline
        const timeline = useTimeline();

        if (!timeline) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ This server does not have an active player session.")

            return await safeReply(interaction, { embeds: [embed] });
        }

        // Invert the pause state
        const wasPaused = timeline.paused;

        wasPaused ? timeline.resume() : timeline.pause();

        // If the timeline was previously paused, the queue is now back to playing
        const embed = new EmbedBuilder()
            .setDescription(`${wasPaused ? '▶️' : '⏸️'} The player is now ${wasPaused ? 'playing' : 'paused'}.`)

        return await safeReply(interaction, { embeds: [embed] });
    }
}