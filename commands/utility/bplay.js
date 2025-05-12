const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, createAudioResource, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const { queue } = require('../../utils/common.js');
const { get_video } = require('../../utils/get_video.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bplay')
		.setDescription('play videos with link')
		.addStringOption(option =>
			option
				.setName('link')
				.setDescription('the link for the video you want to play')),
	async execute(interaction) {
		if (interaction.member.voice.channelId === null) {
			interaction.reply("You need to be in a voice channel to use this command!");
			return;
		}
		console.log(interaction.options.get('link'));
		const input = interaction.options.get('link')["value"];
		await interaction.deferReply({ ephemeral: true });
		if (queue.length === 0) { // if queue is fresh then init connection and player and subcribe to state changes
			try {
				const video_data = await get_video(input); // todo: throw error and catch here if video not found / cannot be downloaded
				queue.push(video_data);
				const connection = joinVoiceChannel({
					channelId: interaction.member.voice.channelId,
					guildId: interaction.guild.id,
					adapterCreator: interaction.guild.voiceAdapterCreator,
				});
				player = createAudioPlayer();
				var subscription;

				connection.on(VoiceConnectionStatus.Ready, async () => {
					// console.log('Connection is in the Ready state!');
					subscription = connection.subscribe(player);
					
					let audio_resource = createAudioResource(`./music/${queue[0].id}fd.m4a`);
					player.play(audio_resource);
					interaction.editReply(`Now Playing \`${video_data.title} by ${video_data.uploader}\``);
				});

				connection.on(VoiceConnectionStatus.Disconnected, () => {
					console.log('Connection is Disconnected!');
					console.log('Stopping the player and clearing the queue');
					player.stop();
					subscription.unsubscribe();
					connection.destroy();
					queue.length = 0;
					return;
				});
				// console.log(queue.length);

				player.on('stateChange', (oldState, newState) => {
					console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
				});

				player.on(AudioPlayerStatus.Idle, () => {
					queue.shift();
					if (queue.length > 0) {
						var audio_resource = createAudioResource(`./music/${queue[0].id}fd.m4a`);
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
				interaction.editReply(e.message);
			}
		}
		else {
			try {
				const video_data = await get_video(input); // todo: throw error and catch here if video not found / cannot be downloaded
				queue.push(video_data);
				interaction.editReply(`Added \`${video_data.title} by ${video_data.uploader}\` to queue!`);
			}
			catch (e) {
				interaction.editReply(e.message);
			}

		}
	}

};