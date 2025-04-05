const { SlashCommandBuilder } = require('discord.js');
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
            return interaction.reply(
                'This server does not have an active player session.',
            );
        }

        queue.clear();

        return interaction.reply(`Queue cleared.`);
    }
}