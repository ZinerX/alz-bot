const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bstop')
        .setDescription('stop the bot and clear the queue'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        connection.disconnect();
        interaction.reply("Cleared the queue and disconnected the bot!")
    }
}