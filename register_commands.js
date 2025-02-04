const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: "bplay",
        description: "play music bruh",
        options: [
            {
                name: 'bvid',
                description: 'bvid of the video you want to play',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: "bstop",
        description: "stop the music bruh",
    },
    {
        name: "bskip",
        description: "skip current track and move to next one or stop music bot"
    }
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