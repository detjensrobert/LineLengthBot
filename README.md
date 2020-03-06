# LineLength

This bot restricts messages in Discord channels to a certain length.

------------

### Usage
`!setmax chars <max>`
`!setmax lines <max>`
`!setmax separation <max>`

	Restricts messages in the channel to however many lines or characters in length. Messages over this limit will be deleted and the author DM'd.
	
	Set to `0` to clear any previous restricion.
	
	This command can only be used by a configurable admin role set in the config file.

------------

### Setup

Main file is `bot.js`.  `npm start` will start the bot.

Bot token goes in `token.json`. Create if not present:
```json
{
  "token": "TOKEN HERE"
}
```

The admin role's ID and the prefix goes in `config.json`: 
```json
{
  "prefix": "!PREFIX",
  "adminRoleID": "ROLE ID HERE"
}
```
