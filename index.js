const Server = require("./minecraftServer.js");
const DiscordBot = require("./discordBot.js");

const minecraftServer = new Server();
const discordBot = new DiscordBot(minecraftServer);

minecraftServer.serverConnect();
discordBot.start();
