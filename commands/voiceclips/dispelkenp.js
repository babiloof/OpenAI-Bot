const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource  } = require('@discordjs/voice');
const { voiceclipsdir } = require('../../config.json');

var path = require('path');
const voiceclip = path.parse(path.basename(__filename)).name;

module.exports = {
	data: new SlashCommandBuilder()
		.setName(voiceclip)
		.setDescription(`Plays voiceclip ${voiceclip}!`),
	async execute(interaction) {
		if (!interaction.member.voice.channel) {
			return interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true });
		}

		//create audio player
		const player = createAudioPlayer();

		player.on(AudioPlayerStatus.Playing, () => {
			console.log(`Playing voiceclip ${voiceclip}!`);
		});

		player.on('error', error => {
			console.error(`Error: ${error.message} with resource`);
		});

		player.on(AudioPlayerStatus.Idle, () => {
			setTimeout(() => {
				connection.disconnect();
			}, 1000);
		});

		//create and play audio
		const resource = createAudioResource(`${voiceclipsdir}${voiceclip}.mp3`);
		player.play(resource);

		//create the connection to the voice channel
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator
		});

		interaction.reply({ content:`Played voiceclip ${voiceclip}!`, ephemeral: true })

		// Subscribe the connection to the audio player (will play audio on the voice connection)
		const subscription = connection.subscribe(player);

		// subscription could be undefined if the connection is destroyed!
		//if (subscription) {
			// Unsubscribe after 5 seconds (stop playing audio on the voice connection)
		//	setTimeout(() => subscription.unsubscribe(), 5_000);
		//}
	},
};
