const { colors } = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs');
const log = require('../utils/log.js');

const options = {

	name: 'lines',
	aliases: ['line', 'l'],

	usage: '<#max-lines>',

	description: 'Restricts messages in the channel to less than <max-lines> lines.\nSet to 0 to remove the restriction.',

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

	log.log('INFO', `Setting line limit for #${message.channel.name} to ${maxLines}`);

	// set limit in memory
	restricts.lines[`${message.channel.id}`] = maxLines;
	let replyStr = `Line limit set to ${maxLines} lines.`;

	if (maxLines == 0) {
		delete restricts.lines[`${message.channel.id}`];
		replyStr = "Line limit removed.";
	}

	// write to file
	fs.writeFileSync('./restrictions.json', JSON.stringify(restricts, null, 4));

	// send confirmation message, then delete after 60s
	const replyEmbed = new Discord.RichEmbed().setColor(colors.success)
		.setTitle(replyStr);
	message.channel.send(replyEmbed).then(response => response.delete(60 * 1000));

	// delete original command
	// need to check if cam be deleted since it might already have been deleted by the restriction pass
	if (!message.deleted) message.delete();


	return;
}

module.exports = options;
module.exports.execute = execute;
