require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: 'keks',
        description: 'Keks!',
    }
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
    }
    catch (error) {
        console.error(error);
    }
})();