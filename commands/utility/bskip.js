import { queue } from '../../utils/common.js';
import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { playerStore } from '../../utils/playerStore.js';

export const data = new SlashCommandBuilder()
    .setName('bskip')
    .setDescription('skip to the next track in the queue');

export async function execute(interaction) {
    if (!interaction.member.voice.channelId) {
        await interaction.reply("You need to be in a voice channel to use this command!");
        return;
    }

    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
        await interaction.reply("The bot is not in a voice channel.");
        return;
    }

    const guildPlayer = playerStore.get(interaction.guild.id);
    if (!guildPlayer) {
        await interaction.reply("The bot is not playing anything or the player is not initialized.");
        return;
    }

    if (queue.length === 0) {
        await interaction.reply("The queue is empty, nothing to skip.");
        return;
    }


    guildPlayer.stop(); 

    await interaction.reply("Skipped to the next track (if one exists).");
}