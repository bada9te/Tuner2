async function safeReply(interaction, data) {
    if (interaction.replied || interaction.deferred) {
        return interaction.followUp(data);
    } else {
        return interaction.reply(data);
    }
}

module.exports = safeReply;
