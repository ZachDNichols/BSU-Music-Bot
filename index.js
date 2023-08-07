require('dotenv').config();
const { Client, Events, GatewayIntentBits, TextChannel} = require('discord.js');
const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	postAnnouncement();
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

const scraper = require('./scraper.js');

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
		const res = result.replaceAll('<p>', '').replaceAll('</p>', '\n');

		if (sendNewMessage(res))
		{
			sendMessage(res, process.env.TEST_CHANNEL);
		}
	});

	console.log("Scraped and formatted at " + new Date().toLocaleString());
}

function sendMessage(message, id)
{
	const channel = client.channels.cache.get(id);
	if (channel instanceof TextChannel)
	{
		channel.send("# Announcement\n" + message);
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
