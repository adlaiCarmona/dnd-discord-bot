// TODO: search this!!!
const fs = require("node:fs");
const path = require("node:path");

require("dotenv").config();
const { BOT_TOKEN, MONGODB_URI_FULL } = process.env;

const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");

const chalk = require("chalk");

// create bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

// creating new Collection for cache
client.bot = new Collection();

/* --------------- Bot Commands --------------- */

// Getting Bot Commands from files
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

/* --------------- Bot Events --------------- */

// Get Event Handling by individual files
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
  } else {
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
}

client.login(BOT_TOKEN);

/* --------------- MongoDB --------------- */

// Connect to MongoDB cluster
// console.log(MONGODB_URI); // Variable expansion in .env ?
console.log(chalk.inverse(`[.env] ${process.env.TEST}`));

const mongoose = require("mongoose");
mongoose.connect(MONGODB_URI_FULL);

// Get Event Handling by individual files
const mongoPath = path.join(__dirname, "mongo");
const mongoFiles = fs
  .readdirSync(mongoPath)
  .filter((file) => file.endsWith(".js"));

for (const file of mongoFiles) {
  const filePath = path.join(mongoPath, file);
  const event = require(filePath);
  if (event.once) {
    mongoose.connection.once(event.name, (...args) => event.execute(...args));
  } else {
    mongoose.connection.on(event.name, (...args) => event.execute(...args));
  }
}
