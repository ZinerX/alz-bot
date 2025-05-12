import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { queue } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
    .setName('bqueue')
    .setDescription('show the current music queue');

export async function execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (connection) {
        if (queue.length === 0) {
            await interaction.reply({ content: 'The queue is currently empty.', ephemeral: true });
            return;
        }
        let queueString = 'Current Queue:\n';
        queue.forEach((track, index) => {
            queueString += `${index + 1}. **${track.title}** by *${track.uploader}*\n`;
        });
        if (queueString.length > 2000) {
            queueString = queueString.substring(0, 1990) + "\n... (queue too long to display all)";
        }
        await interaction.reply({ content: queueString, ephemeral: true });
    } else {
        await interaction.reply({ content: 'The bot is not currently in a voice channel.', ephemeral: true });
    }
}