const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { useMainPlayer } = require('discord-player');


module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Searches the track by provided query.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query')
                .setRequired(true)
        ),
    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return await interaction.reply('You are not connected to the voice channel!');
        }

        // Get the voice channel of the user and check permissions
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply(
                'You need to be in a voice channel to play music!',
            );
        }

        if (
            interaction.guild.members.me.voice.channel &&
            interaction.guild.members.me.voice.channel !== voiceChannel
        ) {
            return interaction.reply(
                'I am already playing in a different voice channel!',
            );
        }

        if (
            !voiceChannel
                .permissionsFor(interaction.guild.members.me)
                .has(PermissionsBitField.Flags.Connect)
        ) {
            return interaction.reply(
                'I do not have permission to join your voice channel!',
            );
        }


        if (
            !voiceChannel
                .permissionsFor(interaction.guild.members.me)
                .has(PermissionsBitField.Flags.Speak)
        ) {
            return interaction.reply(
                'I do not have permission to speak in your voice channel!',
            );
        }

        const query = interaction.options.getString('query', true);

        await interaction.deferReply();

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: interaction,
                },
            });

            return interaction.followUp(`**${track.cleanTitle}** enqueued.`);
        } catch (e) {
            console.error(e);
            return interaction.followUp(`Track could not be played.`);
        }
    }
}