const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🍗🍉🏀 Logged in as ${client.user.tag}`);

        
        client.user.setPresence({
            activities: [
                {
                    name: '🧙🏻‍♂️ Gandalf Sax Guy 10 Hours',
                    type: 2,
                },
            ],
        });
        
    },
};