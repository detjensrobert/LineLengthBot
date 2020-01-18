console.log("[ START ] Starting up...");
const Discord = require('discord.js');
const client = new Discord.Client();

// file i/o
const fs = require('fs');

// grab settings from file
const { token } = require('./token.json');
const { prefix, adminRoleID } = require('./config.json');

// load saved restrictions from file
// leave mutable for new restricts
let restricts = require('./restrictions.json')

// import commands from dir
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require("./commands/" + file);
	client.commands.set(command.name, command);

	console.log("[ START ] Added command: " + command.name);
}


// ========


client.once('ready', () => {
	console.log(`[ START ] Ready.`);
});

client.on('message', message => {
	
	// check message against dir, remove & dm author if over limit
	checkMessage(message);

	// ignore messages that dont start with a valid prefix
	if (!message.content.startsWith(prefix)) { return; }

	// ignore bot messages
	if (message.author.bot) { return; }

	// ignore DMs
	if (message.channel.type !== "text") { return; }

	// ignore messages not in specified channels, if given
	if (restrictToChannels && !restrictToChannels.includes(message.channel.id)) { return; }

	// turn message into array
	const args = message.content.trim().slice(prefix.length).split(/ +/);

	// pull first word (the command) out
	const commandName = args.shift().toLowerCase();

	// get command from name or alias
	const command = client.commands.get(commandName) ||
					client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;


	// == CHECK OPTIONS ==

	// if admin only
	if (command.adminOnly && !message.guild.fetchMember(message.author).roles.has(adminRoleID)) { return; }

	if (command.minArgs && args.length < command.minArgs) {
		const errEmbed = new Discord.RichEmbed().setColor(colors.error)
			.setTitle("Oops! Are you missing something?")
			.addField("Usage:", `\`${prefix}${command.name} ${command.usage}\``);
		return message.channel.send(errEmbed);
	}

	// ==============
	// ACTUAL COMMAND CALL
	command.execute(message, args, restricts)
		.catch(err => {
			console.error("[ ERROR ] " + err);
			message.reply('there was an error trying to execute that command!');
		});

});

console.log("[ START ] Logging in to Discord...");
client.login(token);

// catch and log promise rejections
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));


// ========


function checkMessage (message) {
	//chars first
	console.log(message.cleanContent);
}
