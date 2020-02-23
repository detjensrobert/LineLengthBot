const c = require('chalk');

function buildStr (type, message) {
	const d = new Date();
	let str;
	
	switch (type) {
		case 'START':
			str = c.cyan(type);
			break;
		case 'INFO':
			str = c.green(type);
			break;
		case 'WARN':
			str = c.yellow(type);
			break;
		case 'ERR':
			str = c.red(type);
			break;
		default:
			str = c.grey(type);
	}
	
	return "[ " + c.grey(d.toLocaleString()) + " | " + str + " ] " + message;
}

function log (type, message) {
	console.log(buildStr(type, message));
}

function error(type, message) {
	console.error(buildStr(type, message));
}

module.exports.log = log;
module.exports.error = error;
