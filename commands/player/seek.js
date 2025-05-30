const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const msToFromatted = require("../../utils/common/msToFromatted");
const safeReply = require('../../utils/common/safeReply');


module.exports = {
    isPlayerCommand: true,
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Rewinds the track to specified [+x] or [-x] seconds')
        .addIntegerOption(option => 
            option.setName('x')
                .setDescription('Seconds argument to rewind to')
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

            return await safeReply(interaction, { embeds: [embed] });
        }

        const currentSong = queue.currentTrack;
        const xTime = interaction.options.getInteger('x');

        const seekToMS = queue.node.getTimestamp().current.value + (Number(xTime) * 1000)

        queue.node.seek(seekToMS);

        const predictedMS = seekToMS > currentSong.durationMS ? "Skipped" : msToFromatted(seekToMS);

        const embed = new EmbedBuilder()
            .setDescription(`⏭️ Rewinded to ${xTime} seconds`)
            .addFields(
                { name: '⏱️ _Duration_', value: `${predictedMS} / ${currentSong.duration}`, inline: true },
            )

        return await safeReply(interaction, { embeds: [embed] });
    }
}