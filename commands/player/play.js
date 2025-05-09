const { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const identifyExtractorEngine = require("../../utils/identifyExtractorEngine");


module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Searches the track by provided query.')
        .addStringOption(option =>
            option.setName('src')
                .setDescription('Song link or text query')
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

        if (!channel) {
            return await interaction.reply('You are not connected to the voice channel!');
        }

        if (
            interaction.guild.members.me.voice.channel &&
            interaction.guild.members.me.voice.channel !== channel
        ) {
            return interaction.reply('I am already playing in a different voice channel!');
        }

        const permissions = channel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has(PermissionsBitField.Flags.Connect) ||
            !permissions.has(PermissionsBitField.Flags.Speak)) {
            return interaction.reply('I do not have permission to join and speak in your voice channel!');
        }

        const query = interaction.options.getString('src');
        const attachment = interaction.options.getAttachment('file'); // Get the attachment if provided
        await interaction.deferReply();

        if (!query && !attachment) {
            return interaction.followUp('Required parameter (query / file) was not provided!');
        }

        const url = query || attachment.url;

        try {
            const searchEngine = identifyExtractorEngine(url);
            console.log({searchEngine})

            if (!searchEngine) {
                return interaction.followUp('Platform is not supported yet.');
            }

            let searchResult = await player.search(url, {
                requestedBy: interaction.user,
                // searchEngine
            });

            if (!searchResult || !searchResult.tracks.length) {
                return interaction.followUp('No tracks found for your query.');
            }


            const topTracks = searchResult.tracks.slice(0, 10);
            const menu = new StringSelectMenuBuilder()
                .setCustomId('track_select')
                .setPlaceholder('Choose a track to play')
                .addOptions(
                    topTracks.map((track, index) => {
                        return {
                            label: `[${track.duration}] ${track.title.slice(0, 80)}`,
                            description: track.author.slice(0, 50),
                            value: index.toString(),
                        }
                    })
                );

            const row = new ActionRowBuilder().addComponents(menu);

            await interaction.followUp({
                content: 'Select a track to play:',
                components: [row],
            });

            const collector = interaction.channel.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 15000,
                max: 1,
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: 'This menu is not for you!', ephemeral: true });
                }

                await i.deferUpdate(); // prevent interaction expiration

                const selectedIndex = parseInt(i.values[0]);
                const selectedTrack = topTracks[selectedIndex];

                console.log(selectedTrack);

                const queue = player.nodes.get(interaction.guildId) ?? player.nodes.create(interaction.guild, {
                    metadata: interaction,
                    selfDeaf: true,
                    volume: 100,
                });

                if (!queue.connection) await queue.connect(channel);

                queue.addTrack(selectedTrack);

                if (!queue.isPlaying()) {
                    await queue.node.play();
                }

                try {
                    await interaction.editReply({
                        content: `Enqueued: **${selectedTrack.title}**`,
                        components: [],
                    });
                } catch (err) {
                    console.warn('Could not update interaction:', err);
                }
            });


            collector.on('end', async collected => {
                if (collected.size === 0) {
                    try {
                        await interaction.editReply({
                            content: 'No selection made in time.',
                            components: [],
                        });
                    } catch (err) {
                        console.warn('Failed to edit reply after collector timeout:', err);
                    }
                }
            });
        } catch (e) {
            console.error(e);
            return interaction.followUp('Something went wrong while trying to play the track.');
        }
    },
};
