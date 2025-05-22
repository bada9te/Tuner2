const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
                .setDescription("❌ This server does not have an active player session.")

            return interaction.reply({
                embeds: [embed],
            });
        }

        // Get the current track
        const currentTrack = queue.currentTrack;

        // Get the upcoming tracks
        const upcomingTracks = queue.tracks.toArray();

        // Create a message with the current track and upcoming tracks
        await sendQueue(interaction, currentTrack, upcomingTracks);
    }
}




async function sendQueue(interaction, currentTrack, upcomingTracks) {
    const tracksPerPage = 10;
    let currentPage = 0;
    const totalPages = Math.ceil(upcomingTracks.length / tracksPerPage);

    const generateEmbed = (page) => {
        const start = page * tracksPerPage;
        const end = start + tracksPerPage;
        const tracks = upcomingTracks.slice(start, end);

        const embed = new EmbedBuilder()
            .setAuthor({ name: "🎶 Music Queue" })
            .setDescription(
                (tracks.length
                    ? `${tracks.map((track, i) => `📌 [${track.title}](${track.url})`).join('\n')}`
                    : `🪹 _Queue is empty._`
                ) +
                `\n\n_Page ${page + 1} of ${totalPages}_`
            );

        return embed;
    };

    const createRow = (page) => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⬅️ Prev')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),

            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next ➡️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages - 1)
        );
    };

    const message = await interaction.reply({
        embeds: [generateEmbed(currentPage)],
        components: [createRow(currentPage)],
        fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
        time: 60000,
        filter: i => i.user.id === interaction.user.id
    });

    collector.on('collect', async i => {
        if (i.customId === 'next') currentPage++;
        if (i.customId === 'prev') currentPage--;

        await i.update({
            embeds: [generateEmbed(currentPage)],
            components: [createRow(currentPage)]
        });
    });

    collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
            ...createRow(currentPage).components.map(btn => btn.setDisabled(true))
        );
        await message.edit({ components: [disabledRow] });
    });
}
