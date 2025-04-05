const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Displays current track info.'),
    async execute(interaction) {
        // Get the current queue
        const queue = useQueue();

        if (!queue) {
            return interaction.reply(
                'This server does not have an active player session.',
            );
        }

        // Get the currently playing song
        const currentSong = queue.currentTrack;

        // Check if there is a song playing
        if (!currentSong) {
            return interaction.reply('No song is currently playing.');
        }

        // Send the currently playing song information
        return interaction.reply(`Now playing: ${currentSong.cleanTitle}`);
    }
}