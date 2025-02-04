// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, createAudioResource, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const { get_video } = require('./get_video.js')
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

const initMusicFolder = () => {
    if (fs.existsSync('./music')) {
        console.log("music folder found, making sure it is empty to prevent wasting space over time...");
        fs.readdir('music', (err, files) => {
            if (err) throw err;
          
            for (const file of files) {
              fs.unlink(path.join('music', file), (err) => {
                if (err) throw err;
              });
            }
          });
    }
    else {
        console.log("music folder not found, making one now...");
        fs.mkdir(path.join(__dirname, 'music'),
            (err) => {
                if (err) {
                    return console.error(err);
                }
                console.log('music folder created successfully!');
            });
    }
}

var queue = [];
var player;
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // COMMAND: PLAY
    // FUNCTION: PLAY MUSIC OR ADD MUSIC TO QUEUE IF ALREADY PLAYING
    if (interaction.commandName === "bplay") {
        if (interaction.member.voice.channelId === null) {
            interaction.reply("You need to be in a voice channel to use this command!");
            return;
        }
        const input = interaction.options.get('bvid')['value'];
        console.log(input.substring(0, 3));
        if (input.substring(0, 3) === "BV1") {
            if (queue.length === 0) { // if queue is fresh then init connection and player and subcribe to state changes
                try {
                    const video_data = await get_video(input); // todo: throw error and catch here if video not found / cannot be downloaded
                    queue.push(input);
                    console.log("downloaders");
                    console.log(interaction.member.voice.channelId);
                    console.log(interaction.guild.id);
                    const connection = joinVoiceChannel({
                        channelId: interaction.member.voice.channelId,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                    player = createAudioPlayer();
                    var subscription;
                    connection.on(VoiceConnectionStatus.Ready, (oldState, newState) => {
                        console.log('Connection is in the Ready state!');
                        subscription = connection.subscribe(player);
                        const audio_resource = createAudioResource(`./music/${queue[0]}.mp3`, {
                            metadata: {
                                title: "amongus",
                            }
                        });
                        player.play(audio_resource);
                        interaction.reply(`Now Playing \`${video_data.title} by ${video_data.owner}\``);
                    });
                    connection.on(VoiceConnectionStatus.Disconnected, (oldState, newState) => {
                        console.log('Connection is Disconnected!');
                        console.log('Stopping the player and clearing the queue');
                        player.stop();
                        subscription.unsubscribe();
                        connection.destroy();
                        queue = [];
                        return;
                    });
                    console.log(queue.length);
                    player.on('stateChange', (oldState, newState) => {
                        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
                    });
                    player.on(AudioPlayerStatus.Idle, () => {
                        console.log("idleidleidleidleidle");
                        queue.shift();
                        if (queue.length > 0) {
                            const audio_resource = createAudioResource(`./music/${queue[0]}.mp3`, {
                                metadata: {
                                    title: "amongus",
                                }
                            });
                            player.play(audio_resource);
                        }
                        else {
                            if (player) { player.stop(); };
                            if (connection) { connection.destroy(); };
                        }
                    })
                }
                catch (e) {
                    console.log(e.message);
                    interaction.reply(e.message);
                }
            }
            else {
                try {
                    const video_data = await get_video(input); // todo: throw error and catch here if video not found / cannot be downloaded
                    queue.push(input);
                    interaction.reply(`Added \`${video_data.title} by ${video_data.owner}\` to queue!`);
                }
                catch (e) {
                    interaction.reply(e.message);
                }

            }



            // const audio_resource = createAudioResource(`./${queue[0]}.mp3`, {
            //     metadata: {
            //         title: "amongus",
            //     }
            // });
            // player.play(audio_resource);
        }
        else {
            interaction.reply("please use valid BVID")
        }
    }

    if (interaction.commandName === "bstop") {
        const connection = getVoiceConnection(interaction.guild.id);
        connection.disconnect();
        interaction.reply("Cleared the queue and disconnected the bot!")
    }

    if (interaction.commandName === "bskip") {
        queue.shift();
        if (queue.length > 0) {
            const audio_resource = createAudioResource(`./music/${queue[0]}.mp3`, {
                metadata: {
                    title: "amongus",
                }
            });
            player.play(audio_resource);
            interaction.reply("Skipped.");
        }
        else {
            const connection = getVoiceConnection(interaction.guild.id);
            connection.disconnect();
            interaction.reply("Skipped last in the queue, now disconnecting the bot...")
        }
    }
})

initMusicFolder();
// Log in to Discord with your client's token
client.login(process.env.token);