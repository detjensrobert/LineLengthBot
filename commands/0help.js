const { prefix, colors, middlemanRoleID } = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'help',
	aliases: ['info', '?', 'h'],

	description: 'Shows this list of commands.',
	
	adminOnly: true,

	cooldown: 5,
};
/* == HELP MESSAGE FORMAT ==
 * $NAME ($ALIASES)
 * $DESCRIP
 * Usage:
 *   $USAGE
 * Examples:
 *   $EXAMPLE
 */

async function execute(message) {

	console.log("[ INFO ] Showing help");

	const commands = message.client.commands;

	const helpEmbed = new Discord.RichEmbed().setColor(colors.info)
		.setAuthor("LineLengthBot Help", message.client.user.displayAvatarURL)
		.setFooter("LineLengthBot created by WholeWheatBagels", 'https://cdn.discordapp.com/avatars/197460469336899585/efb49d183b81f30c42b25517e057a704.png');

	commands.forEach((cmd) => {

		let helpStr = cmd.description;

		if (cmd.usage) {
			helpStr += `\n\`${prefix}${cmd.name} ${cmd.usage}\``;
		}
		else {
			helpStr += `\n\`${prefix}${cmd.name}\``;
		}

		if (cmd.example) {
			helpStr += `\nExamples:\n- \`${prefix}${cmd.name} ${cmd.example}\``;
		}

		if (cmd.adminOnly) {
			helpStr += "\n*(Admin restricted)*";
		}

		helpEmbed.addField(`**${cmd.name}**` + (cmd.aliases ? ", " + cmd.aliases.join(", ") : ""), helpStr);
	});

	message.channel.send(helpEmbed);

}

module.exports = options;
module.exports.execute = execute;
