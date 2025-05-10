const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
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
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("This server does not have an active player session.")
                .setAuthor({
                    name: `Execution reverted`,
                });

            return interaction.reply({
                embeds: [embed],
            });
        }

        // Get the current track
        const currentTrack = queue.currentTrack;

        // Get the upcoming tracks
        const upcomingTracks = queue.tracks.toArray().slice(0, 5);

        // Create a message with the current track and upcoming tracks
        const embed = new EmbedBuilder()
            //.setColor(0x947e2e)
            .setDescription(`[${currentTrack.title}](${currentTrack.url})`)
            .setAuthor({
                name: "Now playing",
            })
            .addFields(
                ...upcomingTracks.map(
                    (track, index) => {
                        return {
                            name: `${index + 1}. ${track.author}`,
                            value: `[${track.title.substring(0, 20)}...](${track.url})`,
                            inline: true,
                        };
                    },
                )
            )
        // .setTimestamp();

        // Send the message
        return interaction.reply({
            embeds: [embed]
        });
    }
}