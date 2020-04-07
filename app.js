const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.js');
var messageUpdater = false;

client.on("ready", () => {
  console.log(`ready!`);
  let servers = config.servers;
  let channel = client.channels.get(config.channel);
  var interval = setInterval(function() {
      let index = 0;
      let serverCount = [];
      servers.forEach((server) => {
        index++;
        let rcon = require('srcds-rcon')({
          address: server.ip,
          password: server.password
        });
        rcon.connect().then(() => {
          return rcon.command('status').then(status => {
            console.log(status);
            let count = status.match(/[0-9]{1,2} humans/)[0];
            count = count.split(" ")[0];
            let data = {
              name: server.name,
              ip: server.ip,
              password: server.password,
              port: server.port,
              count: count,
            };
            serverCount.push(JSON.stringify(data));
            if (index == servers.length) {
              let index = 0;
              let embedRelay = new Discord.RichEmbed();
              serverCount.forEach((server) => {
                server = JSON.parse(server);
                index++;
                embedRelay.addField(`"${server.name}" IP: ${server.ip}:${server.port}`, `Users Online: ${server.count}`);
                if (index == serverCount.length) {
                  if (messageUpdater) {
                    messageUpdater.edit(embedRelay);
                  } else {
                    channel.send(embedRelay).then(msg => {
                      messageUpdater = msg;
                    });
                  }
                }
              });
            }
          });
        }).then(
          () => rcon.disconnect()
        ).catch(err => {
          console.log('caught', err);
          console.log(err.stack);
        });
      });
    },
    config.refreshRate);
});

client.login(config.token);
