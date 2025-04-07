// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player, GuildQueueEvent } = require("discord-player");
const { DefaultExtractors} = require('@discord-player/extractor');
const path = require("path");
const fs = require("fs");
const {MainCustomExtractor} = require("./custom-audio-extractors/mainExtractor");
const ffmpegPath = require('ffmpeg-static');
// const { YoutubeiExtractor } = require("discord-player-youtubei")

require('dotenv').config();

// JSON.stringify = require('safe-stable-stringify')

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
const player = new Player(client, {
    ffmpegPath: ffmpegPath
});

// Handle the event when a track starts playing
player.events.on(GuildQueueEvent.PlayerStart, async (queue, track) => {
    const { channel } = queue.metadata;
    console.log(`🎵 Playing: ${track.title}`);
    await channel.send(`Now playing: ${track.title}`);
});

// Handle the event when a track finishes playing
player.events.on(GuildQueueEvent.PlayerFinish, async (queue, track) => {
    const { channel } = queue.metadata;
    await channel.send(`Finished playing ${track.title}`);
});


player.events.on(GuildQueueEvent.Error, (queue, error) => {
    console.error(`❌ Error: ${error.message}`);
});


async function loadExt() {
    // Load player extractors
    // await player.extractors.register(MainCustomExtractor, true);
    // await player.extractors.loadMulti([...DefaultExtractors, YoutubeiExtractor]);
    await player.extractors.register(MainCustomExtractor);
}

loadExt()
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


