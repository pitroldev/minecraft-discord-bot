const axios = require("axios");

const config = require("./config.json");

module.exports = {
  async checkIfPortIsOpen(serverReload) {
    try {
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
        return await serverReload();
      }
    } catch (err) {
      console.log(
        `[${new Date()}] AUTOMATIC PORT CHECK: Cant Connect to PortCheckerAPI`
      );
      await serverReload();
      //check server online
      // initserver
    }
  },

  async checkIfServerIsOnline(client) {
    console.log(`[${new Date()}] Checking Server Status...`);
    try {
      const isOnline = await client.send("seed");
      isOnline && console.log(`[${new Date()}] Server is online!`);
      return !!isOnline;
    } catch (err) {
      console.log(`[${new Date()}] Server is offline!`);
      return false;
    }
  },
};
