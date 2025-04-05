const { SlashCommandBuilder } = require('discord.js');
const { useQueue, useMainPlayer} = require('discord-player');

module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the queue of the current server.'),
    async execute(interaction) {
        // Get the current queue
        const player = useMainPlayer();

        const queue = player.nodes.get(interaction.guildId);

        if (!queue) {
            return interaction.reply(
                'This server does not have an active player session.',
            );
        }

        // Get the current track
        const currentTrack = queue.currentTrack;

        // Get the upcoming tracks
        const upcomingTracks = queue.tracks.toArray().slice(0, 5);

        // Create a message with the current track and upcoming tracks
        const message = [
            `**Now Playing:** ${currentTrack.title} - ${currentTrack.author}`,
            '',
            '**Upcoming Tracks:**',
            ...upcomingTracks.map(
                (track, index) => `${index + 1}. ${track.title} - ${track.author}`,
            ),
        ].join('\n');

        // Send the message
        return interaction.reply(message);
    }
}