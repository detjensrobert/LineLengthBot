console.log("[ START ] Starting up...");
const Discord = require('discord.js');
const client = new Discord.Client();
const log = require('./utils/log.js');

// file i/o
const fs = require('fs');

// grab settings from file
const { token } = require('./token.json');
const config = require('./config.json');

// load saved restrictions from file (or template if no file)
let restricts;
log.log('START', "Loading restrictions from file...");
if (fs.existsSync('./restrictions.json')) {
	restricts = require('./restrictions.json');
}
else {
	log.log('START', "No restrictions file found, using blank template...");
	restricts = { "chars": {}, "lines": {}, "separation": {} };
}

// import commands from dir
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require("./commands/" + file);
	client.commands.set(command.name, command);

	log.log('START', "Added command: " + command.name);
}


// ========


client.once('ready', () => {
	log.log('START', "Ready.");
});

client.on('message', message => {

	// check message against dir, remove & dm author if over limit
	checkMessage(message);

	// ignore messages that dont start with a valid prefix
	if (!message.content.startsWith(config.prefix)) { return; }

	// ignore bot messages
	if (message.author.bot) { return; }

	// ignore DMs
	if (message.channel.type !== "text") { return; }

	// turn message into array
	const args = message.content.trim().slice(config.prefix.length).split(/ +/);

	// pull first word (the command) out
	const commandName = args.shift().toLowerCase();

	// get command from name or alias
	const command = client.commands.get(commandName) ||
					client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;


	// == CHECK OPTIONS ==

	// if admin only
	if (command.adminOnly && !message.member.roles.has(config.adminRoleID)) { return; }

	if (command.minArgs && args.length < command.minArgs) {
		const errEmbed = new Discord.RichEmbed().setColor(config.colors.error)
			.setTitle("Oops! Are you missing something?")
			.addField("Usage:", `\`${config.prefix}${command.name} ${command.usage}\``);
		return message.channel.send(errEmbed);
	}

	// ==============
	// ACTUAL COMMAND CALL
	command.execute(message, args, restricts);

});

log.log('START', "Logging in to Discord...");
client.login(token);

// catch and log promise rejections
process.on('unhandledRejection', error => console.error('[ ERROR ] Uncaught Promise Rejection:\n', error));


// ========

async function checkMessage(message) {

	// ignore bot messages
	if (message.author.bot) return;

	// get restrictions for the channel
	const maxChars = restricts.chars[`${message.channel.id}`];
	const maxLines = restricts.lines[`${message.channel.id}`];
	const minSepar = restricts.separation[`${message.channel.id}`];

	// if no restriction
	if (!(maxChars || maxLines || minSepar)) return;

	const overChars = message.cleanContent.length > maxChars;
	const overLines = message.cleanContent.split(/\r\n|\r|\n/).length > maxLines;

	// check to see if any of the last X messages are from this message's author
	// but only if theres a limit
	let tooClose = false;
	if (minSepar > 0) {
		const recentMsgs = await message.channel.fetchMessages({ 'before': message.id, 'limit': minSepar });
		tooClose = recentMsgs.find(m => m.author.id === message.author.id);
	}
	

	// if not over any restrict
	if (!(overChars || overLines || tooClose)) return;

	let restrictStr = "";
	if (maxChars) restrictStr += `Under ${maxChars} characters\n`;
	if (maxLines) restrictStr += `Under ${maxLines} lines\n`;
	if (minSepar) restrictStr += `At least ${minSepar} other messages between yours\n`;

	let reasonStrs = [];
	if (overChars) reasonStrs.push(`too big`);
	if (overLines) reasonStrs.push(`too long`);
	if (tooClose) reasonStrs.push(`sent too fast`);
	reasonStrs = reasonStrs.join(', ');

	// replace code ticks with quotes and trim message if its too long
	let msgText = message.cleanContent.replace(/`/gi, "'");
	if (msgText.length > 900) msgText = msgText.substring(0, 900) + " (...)";

	// if restricted and over the limit
	log.log('INFO', `Deleting message from ${message.author.username} in #${message.channel.name}`);
	const errEmbed = new Discord.RichEmbed().setColor(config.colors.error)
		.setTitle(`Oops! Your message in \`${message.guild.name}\` was deleted for being` + reasonStrs)
		.addField(`In \`#${message.channel.name}\`, keep posts within these guidelines:`, restrictStr)
		.addField("Original post:", "```" + msgText + "```");
	await message.author.send(errEmbed);

	// log message to log channel
	const logEmbed = new Discord.RichEmbed().setColor(config.colors.info).setTimestamp()
		.setDescription(`Message from ${message.author} in ${message.channel} deleted for being: ` + reasonStrs)
		.addField("Original post:", "```" + msgText + "```");
	message.guild.channels.get(config.logChannel).send(logEmbed);

	if (message.deletable) message.delete();
}
