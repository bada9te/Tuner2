const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const msToFromatted = require("../../utils/common/msToFromatted");
const safeReply = require('../../utils/common/safeReply');


module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Sets the global playback volume at server')
        .addIntegerOption(option => option.setName('x')
            .setDescription('Volume in %')
            .setRequired(true)
        ),
    async execute(interaction) {
        const queue = useQueue();
        
        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ This server does not have an active player session.")

            return await safeReply(interaction, { embeds: [embed] });
        }

        if (!queue.isPlaying()) {
            const embed = new EmbedBuilder()
                .setColor(0x942e2e)
                .setDescription("❌ There is no track playing.")

            return await safeReply(interaction, { embeds: [embed],  });
        }

        const xVol = interaction.options.getInteger('x');
        queue.node.setVolume(xVol);

        const embed = new EmbedBuilder()
            .setDescription(`⏭️ Volume ${xVol}%`);
           
        return await safeReply(interaction, { embeds: [embed] });
    }
}