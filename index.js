const Rcon = require("modern-rcon");
const Discord = require("discord.js");

const config = require("./config.json");

const services = require("./services.js");
const commands = require("./commands.js");

const { host, password, timeout } = config.serverRcon;

const client = new Rcon(host, password, timeout);

async function serverConnect() {
  await client
    .connect()
    .then(() => console.log(`[${new Date()}] RCON: Conectado com sucesso.`))
    .catch(() =>
      console.log(`[${new Date()}] RCON: Erro ao conectar ao servidor.`)
    );

  async function serverReload() {
    try {
      console.log(`[${new Date()}] AUTOMATIC PORT CHECK: Server Reload.`);
      await client.send("reload confirm");
    } catch (err) {
      console.log(`[${new Date()}] RCON: Erro ao executar reload automático.`);
    }
  }

  services.checkIfPortIsOpen(serverReload);
  setInterval(
    () => services.checkIfPortIsOpen(serverReload),
    config.checkPortIntervalMin * 60 * 1000
  );
}

function discordBotStart() {
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
      botCommands(msg);
    }
  });

  client.login(config.discordToken);
}

function botCommands(msg) {
  const commandString = msg.content.toLowerCase();
  const registerRegex = /[/mine register]/g;
  switch (true) {
    case commandString === "/mine reload": {
      return commands.serverReload(msg, client);
    }
    case commandString === "/mine start": {
      return commands.serverStart(msg, client);
    }
    case commandString === "/mine status": {
      return commands.serverStatus(msg, client);
    }
    case commandString === "/mine info": {
      return commands.serverInfo(msg);
    }
    case commandString === "/mine seed": {
      return commands.serverSeed(msg, client);
    }
    case registerRegex.test(commandString): {
      return commands.serverRegister(msg, client);
    }
    default:
      return commands.helpCommand(msg);
  }
}

serverConnect();
discordBotStart();
