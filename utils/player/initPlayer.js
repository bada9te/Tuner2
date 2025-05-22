const { GuildQueueEvent } = require("discord-player");
const { Player } = require("discord-player");
const { EmbedBuilder} = require('discord.js');
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { ProxyAgent } = require("undici");
const { AttachmentExtractor } = require("@discord-player/extractor");
const getValidGoogleOauth = require("../youtube/getValidGoogleOauth");
const OverriddenSoundCloudExtractor = require("../../extractors/overriddenSoundCloud");
const OverriddenSpotifyExtractor = require("../../extractors/overridenSpotify");
require('dotenv').config();
 

module.exports = async(client) => {
    // Player instance (handles all queues and guilds)
    const player = new Player(client);

    // Load player extractors
    await player.extractors.register(AttachmentExtractor);
    await player.extractors.register(OverriddenSpotifyExtractor);

    await player.extractors.register(OverriddenSoundCloudExtractor);
    await player.extractors.register(YoutubeiExtractor, {
        proxy: new ProxyAgent({
            uri: process.env.PROXY_URI
        }),
        cookie: await getValidGoogleOauth(),
        // generateWithPoToken: true,
        streamOptions: {
            useClient: "IOS",
        }
    });

    // re-init youtube extractor every 1 hour to avoid expired CRE 
    setInterval(async() => {
        await player.extractors.unregister(YoutubeiExtractor.identifier);
        await player.extractors.register(YoutubeiExtractor, {
            proxy: new ProxyAgent({
                uri: process.env.PROXY_URI
            }),
            cookie: await getValidGoogleOauth(),
            streamOptions: {
                useClient: "IOS",
            }
        });

        console.log("[GOOGLE_TOKENS_REFRESH] ✅ YouTube extractor registered (re-init) with new access_token");
    }, 45 * 60 * 1000);


    console.log('Extractors loaded:', [...player.extractors.store.keys()]);

    // Handle the event when a track starts playing
    player.events.on(GuildQueueEvent.PlayerStart, async (queue, track) => {
        const { channel } = queue.metadata;
        const embed = new EmbedBuilder()
            .setColor(0x495e35)
            .setDescription(`[${track.title}](${track.url})`)
            .setAuthor({
                name: `🍺 Started playing`,
            })
            .addFields(
                { name: '⏱️ Duration', value: track.duration, inline: true },
                { name: '👁️ Views', value: track.views.toString(), inline: true },
            )
            .setFooter({
                text: `Requested by ${track.requestedBy.username}`,
                iconURL: track.requestedBy.avatarURL()
            })
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

    player.events.on(GuildQueueEvent.Error, (queue, error) => {
        console.error(`❌ Error: ${error.message}`);
    });

    player.events.on(GuildQueueEvent.PlayerError, (queue, error) => {
        console.error(`❌ Player error: ${error.message}`);
    });

    return player;
}