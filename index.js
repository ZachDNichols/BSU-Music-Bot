require('dotenv').config();
const { Client, Events, GatewayIntentBits, TextChannel, ActivityType } = require('discord.js');
const fs = require('fs');
const scraper = require('./commands/scraper.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds]});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	postAnnouncement();
	client.user.setActivity('Barbie', {
		type: 3,
		url: 'https://youtu.be/dQw4w9WgXcQ',
	})
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);


async function postAnnouncement() {
	let firstTimeCall = false;
	if (!firstTimeCall) {
		await scrapeAndFormat().then((result) => { 	firstTimeCall = true; });
	}

	setInterval(await scrapeAndFormat, 86400000);
}

async function scrapeAndFormat()
{
	await scraper.scrapeD2L().then((result) => {
		let res = result.replaceAll('<p>', '').replaceAll('</p>', '\n');
		res = res.replaceAll('<br>', '\n');
		res = res.replaceAll('<br/>', '\n');
		res = res.replaceAll('<br />', '\n');
		res = res.replaceAll('<a', '').replaceAll('</a>', '');
		res = res.replaceAll('">', ' ');
		res = res.replaceAll ('href="', '').replaceAll('"', '');
		res = res.replaceAll('rel=.*?"', '');
		res = res.decodeHTML();

		if (sendNewMessage(res))
		{
			sendMessage(res, process.env.ANNOUNCE_CHANNEL);

			sendLog(true);
		}
		else
		{
			sendLog(false);
		}
	});
}

function sendLog(scrapeStatus)
{
	const channel = client.channels.cache.get(process.env.TEST_CHANNEL);

	if (scrapeStatus)
	{
		if (channel instanceof TextChannel)
		{
			channel.send("Scraped and formatted at " + new Date().toLocaleString() + ". New announcement found.");
		}
	}
	else
	{
		if (channel instanceof TextChannel)
		{
			channel.send("Scraped and formatted at " + new Date().toLocaleString() + ". No announcement found.");
		}
	}
}

function sendMessage(message, id)
{
	const channel = client.channels.cache.get(id);
	if (channel instanceof TextChannel)
	{
		channel.send("@everyone\n# Announcement\n" + message);
	}

	console.log( channel.type );
}

function sendNewMessage(message)
{
	if (!fs.existsSync("msg.txt"))
	{
		fs.writeFileSync("msg.txt", message);
		return true;
	}

	const oldMessage = fs.readFileSync("msg.txt", "utf-8");

	if (oldMessage === message)
	{
		return false;
	}

	fs.writeFileSync("msg.txt", message);
	return true;
}

String.prototype.decodeHTML = function() {
	let map = {"gt":">" /* , … */};
	return this.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function($0, $1) {
		if ($1[0] === "#") {
			return String.fromCharCode($1[1].toLowerCase() === "x" ? parseInt($1.substr(2), 16)  : parseInt($1.substr(1), 10));
		} else {
			return map.hasOwnProperty($1) ? map[$1] : $0;
		}
	});
};