import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { queue } from '../../utils/common.js';
import { playerStore } from '../../utils/playerStore.js';

export const data = new SlashCommandBuilder()
    .setName('bstop')
    .setDescription('stop the bot and clear the queue');

export async function execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (connection) {
        connection.destroy();
        
        const guildPlayer = playerStore.get(interaction.guild.id);
        if (guildPlayer) {
            guildPlayer.stop(true);
            playerStore.delete(interaction.guild.id);
        }
        
        queue.length = 0;
        await interaction.reply("Cleared the queue and disconnected the bot!");
    } else {
        await interaction.reply("The bot is not currently in a voice channel.");
    }
}