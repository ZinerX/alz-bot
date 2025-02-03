const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: "play",
        description: "play music bruh",
        options: [
            {
                name: 'bvid_or_link',
                description: 'bvid or link of the video you want to play',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
]

const rest = new REST().setToken(process.env.token);

(async () => {
    try {
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.cid, process.env.gid),
            { body: commands },
        )
        console.log(data);
    } catch (e) {
        console.log(e);
    }
})();