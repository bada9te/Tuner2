const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
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

        const embed = new EmbedBuilder()
            // .setColor(0x495e35)
            .setDescription(`[${currentSong.title}](${currentSong.url})`)
            .setThumbnail(currentSong.thumbnail)
            .setAuthor({
                name: `Now playing - ${currentSong.author}`,
            })
            .addFields(
                { name: 'Duration', value: currentSong.duration, inline: true },
                { name: 'Views', value: currentSong.views.toString(), inline: true },
            )
            .setFooter({
                text: `Requested by ${currentSong.requestedBy.username}`,
                iconURL: currentSong.requestedBy.avatarURL()
            })

        // Send the currently playing song information
        return interaction.reply({
            embeds: [embed],
        });
    }
}