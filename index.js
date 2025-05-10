// Require the necessary discord.js classes
const { Client, GatewayIntentBits} = require('discord.js');
const applyClientCommandsAndEvents = require("./utils/applyClientCommandsAndEvents");
const initPlayer = require("./utils/initPlayer");
require('dotenv').config();


(async() => {
    // Create a new client instance
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
        ]
    });

    // initialize audio player
    client.player = await initPlayer(client);

    // read commands and events
    applyClientCommandsAndEvents(client);

    // Log in to Discord with your client's token
    client.login(process.env.TOKEN).catch(console.log);
})()


