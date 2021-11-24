const {
  MessageEmbed
} = require("discord.js");
const Command = require("../../classes/Command");
const BotRuntime = require("../BotRuntime");
const CommandResponse = require("../Utils/CommandResponse");

/**
 * 
 * @returns {object}
 */
async function helpHandler () {
  const desc = "Read about how to use the arcade bot [here](https://docs.hyarcade.xyz/Bot-Commands)";

  const embed = new MessageEmbed()
    .setTitle(`${BotRuntime.client.user.username} help`)
    .setDescription(desc)
    .setThumbnail(BotRuntime.client.user.avatarURL())
    .setColor(0x2f3136);
  
  return new CommandResponse("", embed);
}

module.exports = new Command("help", ["*"], helpHandler, 0);
