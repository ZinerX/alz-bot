// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, createAudioResource, VoiceConnectionStatus } = require('@discordjs/voice');
const { get_video } = require('./get_video.js')
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
] });

var queue = [];

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "play") {
        const input = interaction.options.get('bvid_or_link')['value'];
        console.log(input.substring(0, 3));
        if (input.substring(0, 3) === "BV1") {
            queue.push(input);
            await get_video(input);
            console.log("downloaders");
            console.log(interaction.member.voice.channelId);
            console.log(interaction.guild.id);
            const connection = joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            const player = createAudioPlayer();
            console.log(queue.length);
            const audio_resource = createAudioResource(`./${queue[0]}.mp3`, {
                metadata: {
                    title: "amongus",
                }
            });
            player.play(audio_resource);
            connection.subscribe(player);
        }
        else {
            interaction.reply("please use valid BVID")
        }
    }
})

// Log in to Discord with your client's token
client.login(process.env.token);