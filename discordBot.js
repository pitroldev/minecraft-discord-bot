const Discord = require("discord.js");

const config = require("./config.json");

const Server = require("./minecraftServer.js");

class DiscordBot {
  constructor(server) {
    this.server = server;
    this.isOnline = false;
    this.serverIsOnline = false;
  }

  botCommands(msg) {
    try {
      const commandString = msg.content.toLowerCase();
      const registerRegex = /mine register/g;
      switch (true) {
        case commandString === "/mine reload": {
          return this.server.serverReload(msg);
        }
        case commandString === "/mine start": {
          return this.server.serverStart(msg);
        }
        case commandString === "/mine status": {
          return this.server.serverStatus(msg);
        }
        case commandString === "/mine info": {
          return this.serverInfo(msg);
        }
        case commandString === "/mine seed": {
          return this.server.serverSeed(msg);
        }
        case registerRegex.test(commandString): {
          return this.server.serverRegister(msg);
        }
        default:
          return this.helpCommand(msg);
      }
    } catch (err) {
      console.log("botCommands err", err);
    }
  }

  helpCommand(msg) {
    try {
      console.log(`[${new Date()}]: ${msg.author.username} >>> Help Command`);
      return msg.reply(
        "logo abaixo estão os comandos disponíveis.\n```/mine register\n/mine info\n/mine status\n/mine seed\n/mine reload\n/mine start```"
      );
    } catch (err) {
      console.log("helpCommand", err);
    }
  }

  serverInfo(msg) {
    try {
      const { serverIP, serverVersion, linkToMinecraftClient } = config;

      const infoString =
        "```" +
        `IP: ${serverIP}\nVersão: ${serverVersion}\n\nBaixe o Java 64 bits: https://www.java.com/pt_BR/download/manual.jsp\nBaixe o Minecraft: https://skmedix.pl/sklauncher/downloads\nEscolha sua Skin: https://pt.namemc.com/minecraft-skins\nCrie sua conta: https://skmedix.pl/sklauncher/register\n\nSe registre usando /mine register <SeuUsername>` +
        "```";

      console.log(
        `[${new Date()}]: ${msg.author.username} >>> ServerInfo Command`
      );

      msg.reply(
        `logo abaixo estão algumas informações do servidor.\n${infoString}`
      );
    } catch (err) {
      console.log("serverInfo", err);
    }
  }

  start() {
    try {
      const client = new Discord.Client();
      client.on("ready", () => {
        console.log(`Logado como ${client.user.tag}.`);
      });

      client.on("message", (msg) => {
        if (
          config.discordTextChannel &&
          msg.channel.name !== config.discordTextChannel
        ) {
          return;
        }
        if (msg.content.split(" ")[0] === "/mine") {
          this.botCommands(msg);
        }
      });

      client.login(config.discordToken);
      this.isOnline = true;
    } catch (err) {
      this.isOnline = false;
    }
  }
}

module.exports = DiscordBot;
