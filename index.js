// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const { Player, GuildQueueEvent } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { ProxyAgent } = require("undici");
const path = require("path");
const fs = require("fs");
const {AttachmentExtractor, SpotifyExtractor} = require("@discord-player/extractor");




require('dotenv').config();


// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Add commands to client instance
client.commands = new Collection();

// Player instance (handles all queues and guilds)
const player = new Player(client);

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


async function loadPlayerExtractors() {
    // Load player extractors
    await player.extractors.register(AttachmentExtractor);
    await player.extractors.register(SpotifyExtractor);
    await player.extractors.register(YoutubeiExtractor, {
        proxy: new ProxyAgent({
            uri: process.env.PROXY_URI
        }),
        cookie: process.env.YT_CRE,
        // generateWithPoToken: true,
        streamOptions: {
            useClient: "IOS"
        }
    });
    console.log('Extractors loaded:', [...player.extractors.store.keys()]);
}

// apply commands and player extractors
loadPlayerExtractors()
    .then(_ => {
        // Retrieve commands
        const foldersPath = path.join(__dirname, 'commands');
        const commandsFolders = fs.readdirSync(foldersPath);

        for (const folder of commandsFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandsFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
            for (const file of commandsFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }

        // Add events to client
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }

        // Log in to Discord with your client's token
        client.login(process.env.TOKEN).catch(console.log);
    })
    .catch(e => console.error(e));


