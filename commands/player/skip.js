const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips current track at server queue.'),
    async execute(interaction) {
        // Get the current queue
        const queue = useQueue();

        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ This server does not have an active player session.")

            return interaction.reply({
                embeds: [embed],
            });
        }

        if (!queue.isPlaying()) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ There is no track playing.")

            return interaction.reply({
                embeds: [embed],
            });
        }

        // Skip the current track
        queue.node.skip();

        // Send a confirmation message
        const embed = new EmbedBuilder()
            .setDescription('⏭️ Skipped.')

        return interaction.reply({
            embeds: [embed],
        });
    }
}