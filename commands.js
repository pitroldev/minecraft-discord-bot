const config = require("./config.json");
const services = require("./services.js");

function errorHandler(err, msg) {
  if (err.name === "RconError") {
    console.log(
      `[${new Date()}]: ${msg.author.username} >>> SERVER IS OFFLINE`
    );

    msg.reply(
      "o servidor atualmente se encontra **offline**, mas você pode inicializar ele utilizando o comando abaixo. ```/mine start```"
    );
  }
}

module.exports = {
  async serverStatus(msg, client) {
    try {
      const listString = await client.send("list");

      const regex = /\d+/g;
      const numberOfPlayersOnline = regex.exec(listString)[0];
      const nameOfPlayersOnline = listString.split(":")[1].trim().split(",");
      const playerNumberString =
        numberOfPlayersOnline > 0
          ? `Tem **${numberOfPlayersOnline}** player${
              numberOfPlayersOnline > 1 ? "s" : ""
            } jogando :D`
          : "Mas não tem ninguém jogando... :(";

      const playerNamesString = nameOfPlayersOnline.toString().trim();

      const botString = `o servidor está **online**!\n\n${playerNumberString}\n${
        playerNamesString ? "```" + playerNamesString + "```" : ""
      }`;

      console.log(`[${new Date()}]: ${msg.author.username} >>> Server Info`);
      return msg.reply(botString);
    } catch (err) {
      errorHandler(err, msg);
    }
  },

  async serverSeed(msg, client) {
    try {
      const listString = await client.send("seed");

      const regex = /\d+/g;
      const seedNumber = regex.exec(listString)[0];

      const botString = `a seed do server é **${seedNumber}**.`;

      console.log(`[${new Date()}]: ${msg.author.username} >>> Server Seed`);
      return msg.reply(botString);
    } catch (err) {
      errorHandler(err, msg);
    }
  },

  serverInfo(msg) {
    try {
      const { serverIP, serverVersion, linkToMinecraftClient } = config;

      const infoString =
        "```" +
        `IP: ${serverIP}\nVersão: ${serverVersion}\n\nLink para baixar o Minecraft: ${linkToMinecraftClient}` +
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
  },

  async serverReload(msg, client) {
    try {
      msg.reply("*por favor, aguarde enquanto reinicio o servidor...*");
      console.log(`[${new Date()}]: ${msg.author.username} >>> Server Reload`);
      await client.send("reload");
      return msg.reply("servidor **reiniciado** com sucesso!");
    } catch (err) {
      errorHandler(err, msg);
    }
  },

  async serverStart(msg, client) {
    try {
      console.log(
        `[${new Date()}]: ${msg.author.username} >>> ServerStart Command`
      );

      msg.reply("*aguarde enquanto verifico o servidor...*");
      if (await services.checkIfServerIsOnline(client)) {
        return msg.reply(
          "*o servidor já está online!*\n\nUtilize o comando abaixo para verificar. ```/mine status``` "
        );
      }

      msg.reply("*aguarde 30 segundos enquanto inicializo o servidor...*");

      const spawn = require("child_process").spawn;

      spawn("cmd.exe", ["/c", "runServer.bat"], {
        shell: true,
        detached: true,
      });

      console.log(`[${new Date()}]: ${msg.author.username} >>> SERVER STARTED`);

      return setTimeout(async () => {
        await client.connect();
        msg.reply("servidor inicializado com sucesso!");
      }, 30000);
    } catch (err) {
      console.log("serverStart", err);
      return msg.reply("ocorreu um erro ao tentar iniciar o servidor :/");
    }
  },

  helpCommand(msg) {
    try {
      console.log(`[${new Date()}]: ${msg.author.username} >>> Help Command`);
      return msg.reply(
        "logo abaixo estão os comandos disponíveis.\n```/mine info\n/mine status\n/mine seed\n/mine reload\n/mine start```"
      );
    } catch (err) {
      console.log("helpCommand", err);
    }
  },
};
