import { SlashCommandBuilder } from 'discord.js';
import {
    joinVoiceChannel,
    createAudioPlayer,
    AudioPlayerStatus,
    createAudioResource,
    VoiceConnectionStatus,
    getVoiceConnection,
    entersState
} from '@discordjs/voice';
import { queue } from '../../utils/common.js';
import { get_video } from '../../utils/get_video.js';
import { playerStore } from '../../utils/playerStore.js';

export const data = new SlashCommandBuilder()
    .setName('bplay')
    .setDescription('play videos with link')
    .addStringOption(option =>
        option
            .setName('link')
            .setDescription('the link for the video you want to play')
            .setRequired(true));

async function playNext(guildId, interaction) {
    if (queue.length > 0) {
        try {
            const guildPlayer = playerStore.get(guildId);
            if (!guildPlayer) {
                console.log(`No player found for guild ${guildId} to play next track.`);
                return;
            }
            const resource = createAudioResource(`./music/${queue[0].id}fd.m4a`);
            guildPlayer.play(resource);
            if (interaction && interaction.channel) {
                interaction.channel.send(`Now Playing: **${queue[0].title}** by *${queue[0].uploader}*`).catch(console.error);
            }
        } catch (e) {
            console.error("Error creating resource for next track:", e);
            if (interaction && interaction.channel) {
                interaction.channel.send('Error playing the next song.').catch(console.error);
            }
        }
    } else {
        const connection = getVoiceConnection(guildId);
        if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
            // Optionally destroy connection if queue is empty and player is idle
            connection.destroy(); 
        }
    }
}

export async function execute(interaction) {
    if (!interaction.member.voice.channelId) {
        await interaction.reply("You need to be in a voice channel to use this command!");
        return;
    }

    const link = interaction.options.getString('link');

    await interaction.deferReply();

    let guildPlayer = playerStore.get(interaction.guild.id);
    let connection = getVoiceConnection(interaction.guild.id);

    try {
        const video_data = await get_video(link);
        queue.push(video_data);

        if (!connection || connection.state.status === VoiceConnectionStatus.Destroyed) {
            connection = joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    // Connection recovered
                } catch (error) {
                    // Connection was destroyed or timed out
                    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                        connection.destroy();
                    }
                    playerStore.delete(interaction.guild.id);
                    queue.length = 0; // Clear queue for this guild
                    console.log(`Cleaned up for guild ${interaction.guild.id} after disconnect.`);
                }
            });

            connection.on(VoiceConnectionStatus.Destroyed, () => {
                console.log(`Connection explicitly destroyed for guild ${interaction.guild.id}`);
                playerStore.delete(interaction.guild.id);
                queue.length = 0; 
            });

        } // End of new connection setup

        if (!guildPlayer) {
            guildPlayer = createAudioPlayer();
            playerStore.set(interaction.guild.id, guildPlayer);
            connection.subscribe(guildPlayer); // Subscribe the new or existing connection

            guildPlayer.on(AudioPlayerStatus.Idle, () => {
                console.log(`Player idle for guild ${interaction.guild.id}`);
                const oldSong = queue.shift(); // Remove the song that just finished
                playNext(interaction.guild.id, interaction); // Pass interaction to allow channel messages
            });

            guildPlayer.on('error', error => {
                console.error(`Error in audio player for guild ${interaction.guild.id}:`, error);
                // Potentially try to play next song or notify user
                queue.shift(); // Remove problematic song
                playNext(interaction.guild.id, interaction);
            });
        } // End of new player setup
        
        // If player is idle and songs were added to queue, start playing
        if (guildPlayer.state.status === AudioPlayerStatus.Idle && queue.length > 0) {
            playNext(interaction.guild.id, null); // Don't send initial message from here, deferReply is used
            await interaction.editReply(`Added to queue and now playing: **${video_data.title}** by *${video_data.uploader}*`);
        } else if (queue.length > 0) {
            await interaction.editReply(`Added to queue: **${video_data.title}** by *${video_data.uploader}*`);
        }

    } catch (e) {
        console.error("Error executing bplay command:", e);
        await interaction.editReply(e.message || 'An error occurred while trying to play the video.').catch(console.error);
        const index = queue.findIndex(song => song.id === (link.includes('bvid=') ? link.split('bvid=')[1].split('&')[0] : link));
        if (index > -1) queue.splice(index, 1);
    }
}