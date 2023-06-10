require('dotenv').config()
const { Client, Events, GatewayIntentBits } = require('discord.js');

//channels...
var logchannel = {};

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

    client.guilds.cache.forEach( guild => {
		logchannel[guild.id] = guild.channels.cache.find(x => x.name === '📇log');
	});
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
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

    console.log(oldUserChannel);
    console.log(newUserChannel);
});

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);