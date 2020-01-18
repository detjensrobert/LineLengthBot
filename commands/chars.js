const { colors } = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'chars',

	usage: '<max-chars>',

	description: 'Restricts messages in the channel to less than <max-chars> characters.',

	adminOnly: true,
	
	minArgs: 1,
};

function execute(message, args, restricts) {
	
	const maxChars = parseInt(args.pop());

	if (isNaN(capacity) || capacity <= 0) {
		const errEmbed = new Discord.RichEmbed().setColor(colors.error)
			.setTitle("Character limit needs to be a positive number")
			.addField("Usage:", `\`${prefix}${options.name} ${options.usage}\``);
		return message.channel.send(errEmbed);
	}
	
	// set limit in memory
	restricts.chars[message.channel.id] = maxChars;
	
	// write to file
	fs.writeFileSync('student-2.json', JSON.stringify(restricts, null, 4));
}

module.exports = options;
module.exports.execute = execute;
