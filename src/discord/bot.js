const Discord = require("discord.js");
const config = require("../../config.json");
const { addAccounts } = require("../listUtils");
const { logger } = require("../utils");
const botCommands = require("./botCommands");

/**
 * Execute the discord bot
 *
 */
module.exports = function doBot() {
    const client = new Discord.Client();

    function isValidIGN(txt) {
        return (
            txt.length < 17 &&
            txt.length > 2 &&
            !txt.includes("!") &&
            !txt.includes("?") &&
            !txt.includes("<") &&
            !txt.includes(";") &&
            !txt.includes('"') &&
            txt != "liar" &&
            txt != "pog" &&
            txt != "fuck" &&
            txt != "yes" &&
            txt != "knew" &&
            txt != "hot" &&
            txt != "ofc" &&
            txt != "get" &&
            txt != "are" &&
            txt != "gamer" &&
            txt != "yea" &&
            txt != "okay"
        );
    }

    client.on("ready", () => {
        logger.out(`Logged in as ${client.user.tag}!`);
    });

    client.on("message", async (msg) => {
        let cmdResponse = await botCommands.execute(msg.content, msg.author.id);
        if (cmdResponse.res != "" || cmdResponse.embed != undefined) {
            logger.out(msg.author.tag + " ran :" + msg.content);
            let opts = {};
            if (cmdResponse.embed) {
                opts.embed = cmdResponse.embed;
            }
            msg.channel.send(cmdResponse.res, opts);
        }
        if (config.discord.listenChannels.includes(msg.channel.id)) {
            // sanitize
            let firstWord = msg.content.split(" ")[0];
            if (!msg.author.bot && isValidIGN(firstWord)) {
                let acclist = require("../../acclist.json");
                let category =
                    acclist[msg.content.split(" ")[1]] != undefined
                        ? msg.content.split(" ")[1]
                        : "others";
                logger.out(firstWord);
                await addAccounts(category, [firstWord]);
            }
        }
    });

    client.login(config.discord.token);
};
