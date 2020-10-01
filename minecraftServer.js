const Rcon = require("modern-rcon");
const axios = require("axios");
const config = require("./config.json");

class Server {
  constructor() {
    this.isOnline = false;
    this.isBusy = true;
    this.client = null;
    this.portCheck = null;
  }

  async checkIfServerIsOnline() {
    console.log(`[${new Date()}] Checking Server Status...`);
    try {
      const isOnline = await this.client.send("seed");
      isOnline && console.log(`[${new Date()}] Server is online!`);
      this.isOnline = true;
      return true;
    } catch (err) {
      console.log(`[${new Date()}] Server is offline!`);
      this.isOnline = false;
      return false;
    }
  }

  async serverConnect(msg) {
    try {
      const { host, password, timeout } = config.serverRcon;

      if (!!this.client) {
        await this.client
          .disconnect()
          .then(() => {
            console.log(`[${new Date()}] RCON: Desconectado com sucesso.`);
          })
          .catch(() =>
            console.log(
              `[${new Date()}] RCON: Erro ao se desconectar do servidor.`
            )
          );
      } else {
        this.client = new Rcon(host, password, timeout);
      }

      await this.client
        .connect()
        .then(() => {
          this.isBusy = false;
          this.isOnline = true;
          console.log(`[${new Date()}] RCON: Conectado com sucesso.`);
          msg && msg.reply("servidor inicializado com sucesso!");
        })
        .catch(() => {
          this.isBusy = false;
          this.isOnline = false;
          console.log(`[${new Date()}] RCON: Erro ao conectar ao servidor.`);
          msg && msg.reply("ocorreu um erro ao tentar iniciar o servidor :/");
        });

      this.checkIfPortIsOpen();
      if (!this.portCheck) {
        this.portCheck = setInterval(
          () => this.checkIfPortIsOpen(),
          config.checkPortIntervalMin * 60 * 1000
        );
      }
    } catch (err) {
      this.isBusy = false;
      console.log("serverConnect", err);
    }
  }

  async automaticServerReload() {
    try {
      if (!this.isOnline) {
        this.errorHandler();
      }
      console.log(`[${new Date()}] AUTOMATIC PORT CHECK: Server Reload.`);

      await this.client.send("reload confirm");
    } catch (err) {
      console.log(`[${new Date()}] RCON: Erro ao executar reload automático.`);
      this.errorHandler();
    }
  }

  async serverStatus(msg) {
    try {
      if (this.isBusy) {
        return msg.reply(
          "por favor aguarde enquanto eu finalizo outra tarefa..."
        );
      }

      if (!this.isOnline) {
        return this.errorHandler(msg);
      }

      this.isBusy = true;

      const listString = await this.client.send("list");

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

      console.log(`[${new Date()}]: ${msg.author.username} >>> Server Status`);
      this.isBusy = false;
      return msg.reply(botString);
    } catch (err) {
      return this.errorHandler(msg);
    }
  }

  async serverSeed(msg) {
    try {
      if (this.isBusy) {
        return msg.reply(
          "por favor aguarde enquanto eu finalizo outra tarefa..."
        );
      }

      if (!this.isOnline) {
        return this.errorHandler(msg);
      }

      this.isBusy = true;
      const listString = await this.client.send("seed");

      const regex = /\d+/g;
      const seedNumber = regex.exec(listString)[0];

      const botString = `a seed do server é **${seedNumber}**.`;

      console.log(`[${new Date()}]: ${msg.author.username} >>> Server Seed`);

      this.isBusy = false;
      return msg.reply(botString);
    } catch (err) {
      return this.errorHandler(msg);
    }
  }

  async serverRegister(msg) {
    try {
      if (this.isBusy) {
        return msg.reply(
          "por favor aguarde enquanto eu finalizo outra tarefa..."
        );
      }

      if (!this.isOnline) {
        return this.errorHandler(msg);
      }

      this.isBusy = true;

      const username = msg.content
        .toLowerCase()
        .replace("/mine register", "")
        .trim();
      const whitelistReq = await this.client.send(`whitelist add ${username}`);

      let botString;

      if (whitelistReq) {
        botString = `o player ${username} foi registrado com sucesso!`;
        console.log(
          `[${new Date()}]: ${
            msg.author.username
          } >>> Whitelisted: ${username} SUCCESS`
        );
      } else {
        botString = `houve uma falha ao registrar o player ${username}...\nVerifique se o servidor está online usando o comendo **/mine status**`;
        console.log(
          `[${new Date()}]: ${
            msg.author.username
          } >>> Whitelisted: ${username} FAIL`
        );
      }

      this.isBusy = false;
      return msg.reply(botString);
    } catch (err) {
      return this.errorHandler(msg);
    }
  }

  async serverReload(msg) {
    try {
      if (this.isBusy) {
        return msg.reply(
          "por favor aguarde enquanto eu finalizo outra tarefa..."
        );
      }

      if (!this.isOnline) {
        return this.errorHandler(msg);
      }

      this.isBusy = true;

      msg.reply("*por favor aguarde enquanto reinicio o servidor...*");
      console.log(`[${new Date()}]: ${msg.author.username} >>> Server Reload`);
      await this.client.send("reload confirm");

      this.isBusy = false;
      return msg.reply("servidor **reiniciado** com sucesso!");
    } catch (err) {
      return this.errorHandler(msg);
    }
  }

  async serverStart(msg) {
    try {
      console.log(
        `[${new Date()}]: ${msg.author.username} >>> ServerStart Command`
      );

      if (this.isBusy) {
        return msg.reply(
          "por favor aguarde enquanto eu finalizo outra tarefa..."
        );
      }
      msg.reply("*aguarde enquanto verifico o servidor...*");

      const isOnline = await this.checkIfServerIsOnline();

      if (isOnline) {
        return this.serverStatus(msg);
      }

      this.isBusy = true;

      msg.reply(
        "*o servidor está **offline**, por favor aguarde 60 segundos enquanto inicializo o servidor...*"
      );

      const spawn = require("child_process").spawn;

      spawn("cmd.exe", ["/c", "runServer.bat"], {
        shell: true,
        detached: true,
      });

      console.log(`[${new Date()}]: ${msg.author.username} >>> SERVER STARTED`);

      return setTimeout(() => this.serverConnect(msg), 60000);
    } catch (err) {
      this.isBusy = false;
      console.log("serverStart", err);
      return msg.reply("ocorreu um erro ao tentar iniciar o servidor :/");
    }
  }

  async checkIfPortIsOpen() {
    try {
      if (!this.isOnline) {
        return console.log(
          `[${new Date()}] AUTOMATIC PORT CHECK: Server is OFFLINE, nothing to check.`
        );
      }

      const { serverIP, serverPort, portCheckerURI } = config;

      const portCheckerAPI = axios.create({ baseURL: portCheckerURI });

      console.log(
        `[${new Date()}] AUTOMATIC PORT CHECK: Checking Port Status...`
      );

      const response = await portCheckerAPI.post("/", {
        host: serverIP,
        port: serverPort,
      });

      const { isPortReachable } = response.data;

      if (isPortReachable) {
        return console.log(`[${new Date()}] AUTOMATIC PORT CHECK: Port is OK!`);
      } else {
        console.log(`[${new Date()}] AUTOMATIC PORT CHECK: Port is Closed.`);
        return await this.automaticServerReload();
      }
    } catch (err) {
      console.log(
        `[${new Date()}] AUTOMATIC PORT CHECK: Cant Connect to PortCheckerAPI`,
        err
      );
      await this.automaticServerReload();
    }
  }

  errorHandler(msg) {
    this.isBusy = false;
    this.isOnline = false;

    console.log(
      `[${new Date()}]: ${msg.author.username || "BOT"} >>> SERVER IS OFFLINE`
    );

    msg &&
      msg.reply(
        "o servidor atualmente se encontra **offline**, mas você pode inicializar ele utilizando o comando abaixo. ```/mine start```"
      );
  }
}

module.exports = Server;
