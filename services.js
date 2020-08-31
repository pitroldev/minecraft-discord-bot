const request = require("request");
const cheerio = require("cheerio");

const config = require("./config.json");

module.exports = {
  async checkIfPortIsOpen(serverReload) {
    try {
      const { serverIP, serverPort } = config;
      const url = "https://portchecker.co/";

      const options = {
        method: "POST",
        url,
        headers: {
          "content-type":
            "multipart/form-data; boundary=---011000010111000001101001",
        },
        formData: { target_ip: serverIP, port: serverPort },
      };

      console.log(
        `[${new Date()}] AUTOMATIC PORT CHECK: Checking Port Status...`
      );

      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        const $ = cheerio.load(body);

        const isOpen = $(".smaller-on-mobile span").text() === "open";

        //check server online
        // initserver

        if (!isOpen) {
          serverReload();
        } else {
          console.log(
            `[${new Date()}] AUTOMATIC PORT CHECK: Server Port is OK.`
          );
        }
      });
    } catch (err) {
      console.log(
        `[${new Date()}] AUTOMATIC PORT CHECK: Cant Connect to portchecker.co`
      );
      serverReload();
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
