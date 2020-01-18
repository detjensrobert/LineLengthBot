const { colors } = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs');

const options = {

	name: 'chars',

	usage: '<max-chars>',

	description: 'Restricts messages in the channel to less than <max-chars> characters.',

	adminOnly: true,

	minArgs: 1,
};

function execute(message, args, restricts) {

	const maxChars = parseInt(args.pop());

	if (isNaN(maxChars) || maxChars < 0) {
		const errEmbed = new Discord.RichEmbed().setColor(colors.error)
			.setTitle("Character limit needs to be a positive number");
		return message.channel.send(errEmbed);
	}

	console.log(`[ INFO ] Setting character limit for ${message.channel.name} to ${maxChars}`); 

	// set limit in memory
	restricts.chars[`${message.channel.id}`] = maxChars;
	let replyStr = `Character limit set to ${maxChars} characters.`;
	
	if (maxChars == 0) {
		delete restricts.chars[`${message.channel.id}`];
		replyStr = "Character limit removed."
	}

	// write to file
	fs.writeFileSync('./restrictions.json', JSON.stringify(restricts, null, 4));

	const replyEmbed = new Discord.RichEmbed().setColor(colors.success)
		.setTitle(replyStr);
	return message.channel.send(replyEmbed);
}

module.exports = options;
module.exports.execute = execute;
