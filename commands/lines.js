const { colors } = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs');

const options = {

	name: 'lines',

	usage: '<max-lines>',

	description: 'Restricts messages in the channel to less than <max-lines> lines.',

	adminOnly: true,

	minArgs: 1,
};

function execute(message, args, restricts) {

	const maxLines = parseInt(args.pop());

	if (isNaN(maxLines) || maxLines < 0) {
		const errEmbed = new Discord.RichEmbed().setColor(colors.error)
			.setTitle("Line limit needs to be a positive number");
		return message.channel.send(errEmbed);
	}

	// set limit in memory
	restricts.lines[`${message.channel.id}`] = maxLines;
	if (maxLines == 0) {
		delete restricts.lines[`${message.channel.id}`];
	}

	// write to file
	fs.writeFileSync('../restrictions.json', JSON.stringify(restricts, null, 4));

	const replyEmbed = new Discord.RichEmbed().setColor(colors.success)
		.setTitle(`Line limit set to ${maxLines} characters.`);
	return message.channel.send(replyEmbed);
}

module.exports = options;
module.exports.execute = execute;
