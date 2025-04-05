const { SlashCommandBuilder } = require('discord.js');
const { useQueue, useTimeline } = require('discord-player');

module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses playback at current server.'),
    async execute(interaction) {
        // Get the queue's timeline
        const timeline = useTimeline();

        if (!timeline) {
            return interaction.reply(
                'This server does not have an active player session.',
            );
        }

        // Invert the pause state
        const wasPaused = timeline.paused;

        wasPaused ? timeline.resume() : timeline.pause();

        // If the timeline was previously paused, the queue is now back to playing
        return interaction.reply(
            `The player is now ${wasPaused ? 'playing' : 'paused'}.`,
        );
    }
}