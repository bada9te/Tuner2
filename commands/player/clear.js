const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { useQueue } = require('discord-player');


module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears current server queue.'),
    async execute(interaction) {
        // Get the current queue
        const queue = useQueue();

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

        queue.clear();

        const embed = new EmbedBuilder()
            .setDescription("Server's player queue has been cleared.")
            .setAuthor({
                name: `Server queue`,
            });

        return interaction.reply({
            embeds: [embed],
        });
    }
}