const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { queue } = require('../../utils/common.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('bqueue')
        .setDescription('show the current music queue'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
            let queueString = 'Current Queue:\n'
            queue.forEach((track, index) => {
                queueString += `${index + 1}. **${track.title}** by *${track.uploader}*\n`
            })
            await interaction.reply({ content: queueString, ephemeral: true });
        } else {
            await interaction.reply({ content: 'The bot is not currently in a voice channel.', ephemeral: true });
        }
    }
}