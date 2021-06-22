const cfg = require("../Config").fromJSON();
const Runtime = require("../Runtime");
const { addAccounts } = require("../listUtils");
const utils = require("../utils");
const { isValidIGN, logger } = require("../utils");
const botCommands = require("./botCommands");
const BotUtils = require("./BotUtils");
const Account = require("../classes/account");
const mojangRequest = require("../request/mojangRequest");
const MiniWallsCommands = require("./MiniWallsCommands");
const { errHypixelMismatch, errIgnNull, linkSuccess } = require("./Embeds");

const longMsgStr = "**WARNING** Attempted to send a message greater than 2000 characters in length!";

async function logError(msg, e) {
    await BotUtils.errHook.send("Error from - " + msg.content.replace(/`/g, "\\`"));
    await BotUtils.errHook.send(e.toString());
    logger.err("Error from - " + msg.content);
    logger.err(e.toString());
}

async function logCmd(msg) {
    await BotUtils.logCommand(msg.content.split(" ")[0], msg.content.split(" ").slice(1), msg.author.id, msg.url);
    logger.out(`${msg.author.tag} ran : \`${msg.content}\``);
}

async function sendAsHook(hook, cmdResponse) {
    try {
        let obj = BotUtils.getWebhookObj(cmdResponse.embed);
        if (cmdResponse.res != "") {
            obj.content = cmdResponse.res;
        }
        if (cmdResponse.img != undefined) {
            obj.files = [cmdResponse.img];
        }
        await hook.send(obj);
        return true;
    } catch (e) {
        logger.err(e.toString());
        await BotUtils.errHook.send(e.toString());
        return false;
    }
}

function randomBtw() {
    let randomVal = Math.round(Math.random() * 15);
    let str =
        "By the way, I have slash commands you can run right now which are alot better in the backend than the normal way of running commands! Try em out some time.";
    logger.out(randomVal);
    if (randomVal == 0) {
        return str;
    }
    if (randomVal == 1) {
        return "I have slash commands you can use, currently the normal commands are being phased out. Please try the slash commands instead.";
    }
    return "";
}

async function miniWallsVerify(msg) {
    if (msg.author.id == "156952208045375488") {
        return;
    }
    let tag = msg.author.tag;
    let id = msg.author.id;
    let ign = msg.content.trim();
    if (await isBlacklisted(id)) return;
    let uuid = await mojangRequest.getUUID(ign);
    if (uuid == undefined) {
        logger.warn("Someone tried to verify as an account that doesn't exist!")
        await msg.channel.send({ embeds: [errIgnNull] });
        return;
    }

    if (Runtime.fromJSON().apiDown) {
        logger.warn("Someone tried to verify while API is down!");
        return { res: "", embed: embeds.apiDed };
    }

    let acc = new Account(ign, 0, uuid);
    await acc.updateData();
    let dbAcc = BotUtils.resolveAccount(uuid, msg, false);
    if (dbAcc.guildID == "608066958ea8c9abb0610f4d" || BotUtils.fileCache.hackers.includes(uuid)) {
        logger.warn("Hacker tried to verify!");
        return;
    }
    if (acc.hypixelDiscord.toLowerCase() == tag.toLowerCase()) {
        await addAccounts("others", [uuid]);
        let disclist = BotUtils.fileCache.disclist;
        disclist[id] = uuid;
        await utils.writeJSON("./disclist.json", disclist);
        logger.out(`${tag} was autoverified in miniwalls as ${ign}`);
        await msg.member.roles.remove("850033543425949736");
        await msg.member.roles.add("789721304722178069");
        await msg.member.setNickname(acc.name);
        await msg.channel.send({ embeds: [linkSuccess] });
    } else {
        await msg.channel.send({ embeds: [errHypixelMismatch] });
    }
}

async function attemptSend(msg, cmdResponse, opts) {
    let runtime = Runtime.fromJSON();
    let hooks = await msg.channel.fetchWebhooks();
    logger.info("Attempting to send response as webhook");
    if (!(hooks.size > 0 && sendAsHook(hooks.first(), cmdResponse))) {
        logger.info("No webhook availiable. Sending normally");
        if (runtime.bot != "backup") {
            opts.reply = { messageReference: msg.id };
            if (cmdResponse.res != "") {
                opts.content = cmdResponse.res;
            }
            if (cmdResponse.embed != undefined) {
                opts.embeds = [cmdResponse.embed];
            }
            if (cmdResponse.img != undefined) {
                opts.files = [cmdResponse.img];
            }
            await msg.channel.send(opts);
        }
    }
}

async function addIGNs(msg) {
    logger.info("IGN channel message detected, automatically adding to database.")
    if (cfg.discord.listenChannels.includes(msg.channel.id)) {
        // sanitize
        let firstWord = msg.content.split(" ")[0];
        if (!msg.author.bot && isValidIGN(firstWord)) {
            let acclist = await utils.readJSON("acclist.json");
            let category = acclist[msg.content.split(" ")[1]] != undefined ? msg.content.split(" ")[1] : "others";
            logger.out(firstWord);
            BotUtils.logHook.send('Attempting to add "`' + firstWord + '`" to database.');
            await addAccounts(category, [firstWord]);
        }
    }
}

async function sanitizeCmdOpt(cmdResponse) {
    if (cmdResponse.res.length > 2000) {
        cmdResponse.res = cmdResponse.res.slice(0, 2000);
        if (cmdResponse.res.slice(0, 3) == "```") {
            cmdResponse.res = cmdResponse.res.slice(0, 1994) + "```";
        }
        await BotUtils.errHook.send(longMsgStr);
        await msg.channel.send(longMsgStr);
        logger.err(longMsgStr);
    }
    return cmdResponse;
}

async function getCmdRes(msg) {
    let cmdResponse;
    try {
        cmdResponse = await botCommands.execute(msg, msg.author.id);
    } catch (e) {
        await logError(msg, e);
    }

    return cmdResponse;
}

async function getMWCmdRes(msg) {
    let cmdResponse;
    try {
        cmdResponse = await MiniWallsCommands.execute(msg, msg.author.id);
    } catch (e) {
        await logError(msg, e);
    }

    return cmdResponse;
}

async function isBlacklisted(id) {
    let blacklist = await utils.readJSON("blacklist.json");
    return blacklist.includes(id);
}

async function mwMode(msg) {
    let cmdResponse = await getMWCmdRes(msg);
    let isValidResponse =
        cmdResponse != undefined &&
        cmdResponse.res != undefined &&
        (cmdResponse.res != "" || cmdResponse.embed != undefined || cmdResponse.img != undefined);
    if (isValidResponse) {
        if (await isBlacklisted(msg.author.id)) {
            let dmchannel = await msg.author.createDM();
            await dmchannel.send(BotUtils.getBlacklistRes());
            return;
        }
        let opts = {};
        if (cmdResponse.embed) {
            opts.embed = cmdResponse.embed;
        }

        await sanitizeCmdOpt(cmdResponse);

        await attemptSend(msg, cmdResponse, opts);
        await logCmd(msg);
    }
}

module.exports = async function messageHandler(msg) {
    if (msg.author.bot) return;
    if (msg.webhookID) return;
    if (msg.guild.id == "808077828842455090") {
        logger.warn("Ignored guild message detected!")
        return;
    };
    if (BotUtils.botMode == "mw") {
        if (msg.guild.id == "789718245015289886") {
            await mwMode(msg);
            return;
        } else {
            return;
        }
    }
    if (msg.channel.id == "791122377333407784") await miniWallsVerify(msg);

    let cmdResponse = await getCmdRes(msg);
    let isValidResponse =
        cmdResponse != undefined &&
        cmdResponse.res != undefined &&
        (cmdResponse.res != "" || cmdResponse.embed != undefined || cmdResponse.img != undefined);

    if (isValidResponse) {
        if (await isBlacklisted(msg.author.id)) {
            let dmchannel = await msg.author.createDM();
            await dmchannel.send(BotUtils.getBlacklistRes());
            return;
        }
        let opts = {};
        if (cmdResponse.embed) {
            opts.embed = cmdResponse.embed;
        }

        await sanitizeCmdOpt(cmdResponse);

        await attemptSend(msg, cmdResponse, opts);
        await addIGNs(msg);
        await logCmd(msg);
    }

    await BotUtils.logIgns(msg);
};
