const { colors } = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs');
const log = require('../utils/log.js');

const options = {

	name: 'separation',
	aliases: ['sep', 's'],

	usage: '<#messages>',

	description: 'Sets a required number of messages between posts from the same user.\nSet to 0 to remove the restriction.',

	adminOnly: true,

	minArgs: 1,
};

function execute(message, args, restricts) {

	const separation = parseInt(args.pop());

	if (isNaN(separation) || separation < 0) {
		const errEmbed = new Discord.RichEmbed().setColor(colors.error)
			.setTitle("Separation needs to be a positive number");
		return message.channel.send(errEmbed);
	}

	log.log('INFO', `Setting separation for #${message.channel.name} to ${separation}`);

	// set limit in memory
	restricts.separation[`${message.channel.id}`] = separation;
	let replyStr = `Message separation set to ${separation} messages.`;

	if (separation == 0) {
		delete restricts.separation[`${message.channel.id}`];
		replyStr = "Message separation removed.";
	}

	// write to file
	fs.writeFileSync('./restrictions.json', JSON.stringify(restricts, null, 4));

	// send confirmation message, then delete after 60s
	const replyEmbed = new Discord.RichEmbed().setColor(colors.success)
		.setTitle(replyStr);
	message.channel.send(replyEmbed).then(response => response.delete(60 * 1000));

	// delete original command
	// need to check if cam be deleted since it might already have been deleted by the restriction pass
	if (message.deletable) message.delete();


	return;
}

module.exports = options;
module.exports.execute = execute;
