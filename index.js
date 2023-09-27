require('dotenv').config();
const { Client, Events, GatewayIntentBits, TextChannel } = require('discord.js');
const fs = require('fs');
const scraper = require('./commands/scraper.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds]});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	sendMessage("I'm awake", process.env.TEST_CHANNEL);
	postAnnouncement();
	client.user.setActivity('Barbie', {
		type: 3,
		url: 'https://youtu.be/dQw4w9WgXcQ',
	})
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);


async function postAnnouncement() {
{
	try {
		await scrapeAndFormat();
	}
	catch (e) {
		sendMessage("HELP! I can't scrape D2L! " + e, process.env.TEST_CHANNEL);
	}
	var dateStr = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
	var now = new Date(dateStr);
	var millisTill = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0, 0) - now;
	setInterval(await postAnnouncement, millisTill);
}}

async function scrapeAndFormat()
{
	await scraper.scrapeD2L().then((result) => {
		let res = result.replaceAll('<p>', '').replaceAll('</p>', '\n');
		res = res.replaceAll('<br>', '\n');
		res = res.replaceAll('<br/>', '\n');
		res = res.replaceAll('<br />', '\n');
		res = res.replaceAll('<div>', '').replaceAll('</div>', '\n');
		res = res.replaceAll('<a', '').replaceAll('</a>', '');
		res = res.replaceAll('">', ' ');
		res = res.replaceAll ('href="', '').replaceAll('"', '');
		res = res.replaceAll('rel=.*?"', '');
		res = res.decodeHTML();

		if (sendNewMessage(res))
		{
			sendMessage("\n# Announcement\n" + res, process.env.TEST_CHANNEL);

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
		channel.send(message);
	}
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
});}