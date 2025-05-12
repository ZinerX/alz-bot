const { queue } = require('../../utils/common.js');
const { SlashCommandBuilder } = require('discord.js');
const { createAudioResource, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bskip')
        .setDescription('skip to the next track in the queue'),
    async execute(interaction) {
        if (interaction.member.voice.channelId === null) {
            interaction.reply("You need to be in a voice channel to use this command!");
            return;
        }
        queue.shift();
        if (queue.length > 0) {
            var audio_resource = createAudioResource(`./music/${queue[0].id}fd.mp3`);
            player.play(audio_resource);
            interaction.reply("Skipped.");
        }
        else {
            const connection = getVoiceConnection(interaction.guild.id);
            connection.disconnect();
            interaction.reply("Skipped last in the queue, now disconnecting the bot...")
        }
    }
}