const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, clientId } = require('./config.json');

//channels...
var logchannel = {};

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

    client.guilds.cache.forEach( guild => {
		logchannel[guild.id] = guild.channels.cache.find(x => x.name === '📇log');
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
	if(oldState.id == clientId || newState.id == clientId) return;
    let newUserChannel = newState.channel;
	let oldUserChannel = oldState.channel;

    if(oldUserChannel === null && newUserChannel !== null){
		logchannel[newUserChannel.guild.id].send(`${newState.member.displayName} joined ${newUserChannel}`)
		//if (newState.id == process.env.JJ_ID) chatchannel.send('Gör plats!')
	} else if(newUserChannel === null){
		logchannel[oldUserChannel.guild.id].send(`${oldState.member.displayName} left ${oldUserChannel}`)
	} else if (oldUserChannel && newUserChannel && oldUserChannel.id != newUserChannel.id){
		logchannel[oldUserChannel.guild.id].send(`${newState.member.displayName} left ${oldUserChannel} and joined ${newUserChannel}`)
	}
});

// Log in to Discord with your client's token
client.login(token);