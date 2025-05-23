const path = require("path");
const fs = require("fs");
const { Collection } = require('discord.js');


module.exports = (client) => {
    // Add commands to client instance
    client.commands = new Collection();

    // Retrieve commands
    const foldersPath = path.join(__dirname, '..', '..', 'commands');
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
                console.log(`🚩 [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    // Add events to client
    const eventsPath = path.join(__dirname, '..', '..', 'events');
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
}