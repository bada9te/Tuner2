const { GuildQueueEvent } = require("discord-player");
const { Player } = require("discord-player");
const { EmbedBuilder} = require('discord.js');
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { ProxyAgent } = require("undici");
const { AttachmentExtractor, SpotifyExtractor } = require("@discord-player/extractor");
const createSpotifyStream = require("./createSpotifyStream");
require('dotenv').config();


module.exports = async(client) => {
    // Player instance (handles all queues and guilds)
    const player = new Player(client);

    // Load player extractors
    await player.extractors.register(AttachmentExtractor);
    await player.extractors.register(SpotifyExtractor, {

        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        createStream: async(ext, url) => {
             return await createSpotifyStream(url);
        }
    });
    await player.extractors.register(YoutubeiExtractor, {
        proxy: new ProxyAgent({
            uri: process.env.PROXY_URI
        }),
        cookie: process.env.YT_CRE,
        // generateWithPoToken: true,
        streamOptions: {
            useClient: "IOS",
        }
    });
    console.log('Extractors loaded:', [...player.extractors.store.keys()]);

    // Handle the event when a track starts playing
    player.events.on(GuildQueueEvent.PlayerStart, async (queue, track) => {
        const { channel } = queue.metadata;
        console.log(`🎵 Playing: ${track.title}`);
        // console.log(track)
        const embed = new EmbedBuilder()
            .setColor(0x495e35)
            .setTitle(track.title)
            .setDescription(track.description)
            .setThumbnail(track.thumbnail)
            .setAuthor({
                name: track.author,
            })
            .setURL(track.url)
            .addFields(
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Views', value: track.views.toString(), inline: true },
            )
            .setFooter({
                text: `Requested by ${track.requestedBy.username}`,
                iconURL: track.requestedBy.avatarURL()
            })
            .setTimestamp();
        await channel.send({ embeds: [embed] });
    });

    // Handle the event when a track finishes playing
    player.events.on(GuildQueueEvent.PlayerFinish, async (queue, track) => {
        console.log(`Finished playing ${track.title}`);
    });


    player.events.on(GuildQueueEvent.Error, (queue, error) => {
        console.error(`❌ Error: ${error.message}`);
    });

    player.events.on(GuildQueueEvent.PlayerError, (queue, error) => {
        console.error(`❌ Player error: ${error.message}`);
    });

    return player;
}