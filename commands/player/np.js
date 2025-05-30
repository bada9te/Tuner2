const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { useQueue } = require('discord-player');
const formatSI = require('../../utils/common/formatSI');
const safeReply = require('../../utils/common/safeReply');

module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Displays current track info.'),
    async execute(interaction) {
        // Get the current queue
        const queue = useQueue();

        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ This server does not have an active player session.")

            return await safeReply(interaction, { embeds: [embed] });
        }

        // Get the currently playing song
        const currentSong = queue.currentTrack;

        // Check if there is a song playing
        if (!currentSong) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ No song is currently playing.")

            return await safeReply(interaction, { embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            // .setColor(0x495e35)
            .setDescription(`[${currentSong.title}](${currentSong.url})`)
            .setThumbnail(currentSong.thumbnail)
            .setAuthor({
                name: `📋 Now playing - ${currentSong.author}`,
            })
            .addFields(
                { name: '⏱️ _Duration_', value: currentSong.duration, inline: true },
                { name: '🎵 _Plays_', value: formatSI(currentSong.views), inline: true },
                { name: '🔍 _Requested by_', value: `<@${currentSong.requestedBy.id}>`, inline: true }
            )

        // Send the currently playing song information
        return await safeReply(interaction, { embeds: [embed] });
    }
}