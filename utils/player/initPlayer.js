const { GuildQueueEvent } = require("discord-player");
const { Player } = require("discord-player");
const { EmbedBuilder} = require('discord.js');
const { AttachmentExtractor } = require("@discord-player/extractor");
const OverriddenSoundCloudExtractor = require("../../extractors/overriddenSoundCloud");
const OverriddenSpotifyExtractor = require("../../extractors/overriddenSpotify");
const formatSI = require("../common/formatSI");
require('dotenv').config();
 

module.exports = async(client) => {
    // Player instance (handles all queues and guilds)
    const player = new Player(client);

    // Load player extractors
    await player.extractors.register(AttachmentExtractor);
    await player.extractors.register(OverriddenSpotifyExtractor);
    await player.extractors.register(OverriddenSoundCloudExtractor);
    // await player.extractors.register(OverriddenYoutubeExtractor);
    

    console.log('⚙️  Extractors loaded:', [...player.extractors.store.keys()]);

    // Handle the event when a track starts playing
    player.events.on(GuildQueueEvent.PlayerStart, async (queue, track) => {
        const { channel } = queue.metadata;
        const embed = new EmbedBuilder()
            .setColor(0x495e35)
            .setDescription(`**[${track.title}](${track.url})**`)
            .setAuthor({
                name: `🍺 Started playing`,
            })
            .addFields(
                { name: `${track?.raw?.live ? '🍿' : '⏱️'} _Duration_`, value: track?.raw?.live ? "Live" : track.duration, inline: true },
                { name: '🎵 _Plays_', value: formatSI(track.views), inline: true },
                { name: '🔍 _Requested by_', value: `<@${track.requestedBy.id}>`, inline: true }
            )
            // .setFooter({
            //     text: ``,
            //     iconURL: track.requestedBy.avatarURL()
            // })
            // .setTimestamp();
        track?.thumbnail && embed.setThumbnail(track.thumbnail);

        await channel.send({ embeds: [embed] });
    });

    player.events.on(GuildQueueEvent.AudioTrackAdd, async(queue, track) => {
        /*
        const { channel } = queue.metadata;
        const embed = new EmbedBuilder()
            //.setColor(0x947e2e)
            .setDescription(`[${track.title}](${track.url})`)
            .setAuthor({
                name: "Added to the queue",
            })
            .setFooter({
                text: `Requested by ${track.requestedBy.username}`,
                iconURL: track.requestedBy.avatarURL()
            })
        // .setTimestamp();
        await channel.send({ embeds: [embed] });
        */
    });

    player.events.on(GuildQueueEvent.Error, async(queue, error) => {
        console.error(`❌ Error: ${error.message}`);
        const { channel } = queue.metadata;
        const embed = new EmbedBuilder()
            .setColor(0x942e2e)
            .setDescription(`❌ ${error.message}`)

        await channel.send({ embeds: [embed] });
    });

    player.events.on(GuildQueueEvent.PlayerError, async(queue, error) => {
        console.error(`❌ Player error: ${error.message}`);
        const { channel } = queue.metadata;
        const embed = new EmbedBuilder()
            .setColor(0x942e2e)
            .setDescription(`❌ ${error.message}`)

        await channel.send({ embeds: [embed] });
    });

    
    player.events.on(GuildQueueEvent.WillPlayTrack, async(queue, track, config, done) => {
        const { channel } = queue.metadata;
        const embed = new EmbedBuilder()
            .setDescription(`Preparing the audio stream...`)

        await channel.send({ embeds: [embed] });
        done();
    });
    

    return player;
}