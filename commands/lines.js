const { colors } = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'CMD_NAME',

	usage: 'USAGE',

	description: 'DESCRIPTION',

	cooldown: 3,
	minArgs: $MIN_ARGS,
};

async function execute(message, args, db) {
	
	// CODE HERE
	
}

module.exports = options;
module.exports.execute = execute;
