const { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ComponentType,
    EmbedBuilder
} = require('discord.js');
const { useMainPlayer, QueryType } = require('discord-player');
const identifyExtractorEngine = require("../../utils/player/identifyExtractorEngine");
const {SpotifyExtractor} = require("@discord-player/extractor");
const { YoutubeiExtractor } = require('discord-player-youtubei');


module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Searches the track by provided query.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Youtube video link or text query')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('Upload a file to play')
                .setRequired(false)
        ),
    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        const embedErr = new EmbedBuilder()
            .setColor(0x942e2e);

        if (!channel) {
            embedErr.setDescription("👀 You are not connected to the voice channel!");
            return await interaction.followUp({ embeds: [embedErr] });
        }

        if (
            interaction.guild.members.me.voice.channel &&
            interaction.guild.members.me.voice.channel !== channel
        ) {
            embedErr.setDescription('🎵 I am already playing in a different voice channel!');
            return await interaction.followUp({ embeds: [embedErr] });
        }

        const permissions = channel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has(PermissionsBitField.Flags.Connect) ||
            !permissions.has(PermissionsBitField.Flags.Speak)) {
            embedErr.setDescription('⛓️‍💥 I do not have permission to join and speak in your voice channel!');
            return await interaction.followUp({ embeds: [embedErr] });
        }

        const query = interaction.options.getString('query');
        const attachment = interaction.options.getAttachment('file'); // Get the attachment if provided
        await interaction.deferReply();

        if (!query && !attachment) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("♿ Required parameter (query / file) was not provided!");

            return interaction.followUp({
                embeds: [embed],
            });
        }

        const url = query || attachment.url;

        try {
            const searchEngine = identifyExtractorEngine(url);
            console.log({searchEngine})

            if (!searchEngine) {
                const embed = new EmbedBuilder()
                    .setColor(0x942e2e)
                    .setDescription("❌ Platform is not supported.")

                return interaction.followUp({
                    embeds: [embed],
                });
            }


            let searchResult = await player.search(url, {
                requestedBy: interaction.user,
            });

            if (!searchResult || !searchResult.tracks.length) {
                const embed = new EmbedBuilder()
                    .setColor(0x942e2e)
                    .setDescription("❌ No tracks found for your query, pls re-run your request if you are sure that the track exists.")

                return interaction.followUp({
                    embeds: [embed],
                });
            }


            const topTracks = searchResult.tracks.slice(
                0, 
                searchEngine === `ext:${YoutubeiExtractor.identifier}` ? 10 : Infinity
            );
            let interval = undefined;

            if (topTracks.length > 1 && searchEngine === `ext:${YoutubeiExtractor.identifier}`) {
                let timeLeft = 60;
                const message = await interaction.followUp({
                    content: 'Select a track to play:',
                    components: [getSelectRow(timeLeft, topTracks)],
                    fetchReply: true
                });

                interval = setInterval(async () => {
                    timeLeft--;

                    if (timeLeft <= 0) {
                        clearInterval(interval);
                        return;
                    }

                    try {
                        await message.edit({
                            components: [getSelectRow(timeLeft, topTracks)],
                        });
                    } catch (e) {
                        console.warn('Failed to update placeholder:', e);
                        clearInterval(interval);
                    }
                }, 1000);

                const collector = interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                    time: 60000,
                    max: 1,
                });

                collector.on('collect', async i => {
                    if (i.user.id !== interaction.user.id) {
                        return i.reply({ content: 'This menu is not for you!', ephemeral: true });
                    }

                    await i.deferUpdate(); // prevent interaction expiration

                    const selectedIndex = parseInt(i.values[0]);
                    const selectedTrack = topTracks[selectedIndex];

                    try {
                        interval && clearInterval(interval);

                        await playTrackAndRespondMsg(
                            player,
                            channel,
                            selectedTrack,
                            interaction
                        );
                    } catch (err) {
                        console.warn('Playback error:', err);
                        const embed = new EmbedBuilder()
                            .setColor(0x942e2e)
                            .setDescription("❌ Something went wrong while trying to play the track.")
                        return interaction.followUp({
                            embeds: [embed],
                        });
                    }
                });

                collector.on('end', async collected => {
                    if (collected.size === 0) {
                        try {
                            const embed = new EmbedBuilder()
                                .setColor(0x942e2e)
                                .setDescription("⏱️ No selection made in time.")
                            return interaction.editReply({
                                content: "",
                                embeds: [embed],
                                components: []
                            });
                        } catch (err) {
                            console.warn('Failed to edit reply after collector timeout:', err);
                        }
                    }
                });
            } else {
                const selectedTrack = topTracks[0];
                await playTrackAndRespondMsg(
                    player,
                    channel,
                    selectedTrack,
                    interaction
                );
            }
        } catch (e) {
            console.error(e);
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ Something went wrong while trying to play the track.")

            return interaction.editReply({
                content: "",
                embeds: [embed],
                components: []
            });
        }
    },
};


// Create select menu with dynamic placeholder
function getSelectRow(secondsRemaining, topTracks) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('track_select')
        .setPlaceholder(`🔍 Choose a track (${secondsRemaining}s left)`)
        .addOptions(
            topTracks.map((track, index) => ({
                label: `[${track.duration}] ${track.title.slice(0, 80)}`,
                description: track.author.slice(0, 50),
                value: index.toString(),
            }))
        );

    return new ActionRowBuilder().addComponents(menu);
}


async function playTrackAndRespondMsg(player, channel, track, interaction) {
    // console.log({track});
    // ✅ Actually play the track
    await player.play(channel, track, {
        nodeOptions: {
            metadata: interaction,
            leaveOnEnd: true,
            disableSeeker: false,
        },
        fallbackSearchEngine: "autoSearch",
    });

    const embed = new EmbedBuilder()
        //.setColor(0x947e2e)
        .setDescription(`✏️ [${track.title}](${track.url})`);

    return interaction.editReply({
        content: "",
        embeds: [embed],
        components: []
    });
}