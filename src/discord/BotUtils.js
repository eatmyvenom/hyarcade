const { MessageEmbed, WebhookClient } = require("discord.js");
const cfg = require("../Config").fromJSON();
const listUtils = require("../listUtils");
const utils = require("../utils");
const webhook = require("../webhook");

function stringify(str) {
    return "" + str;
}
module.exports = class BotUtils {
    static logHook;
    static errHook;
    static client;
    static msgCopyHook;

    static async resolveAccount(string, rawMessage) {
        string = stringify(string);
        let acclist = await utils.readJSON("./accounts.json");
        let disclist = await utils.readJSON("./disclist.json");
        let acc;
        if (string.length == 18) {
            acc = acclist.find((a) => a.discord == string);
        }

        if (acc == undefined && string.length > 16) {
            acc = acclist.find(
                (a) => a.uuid.toLowerCase() == string.toLowerCase()
            );
        } else if (acc == undefined && string.length <= 16) {
            acc = acclist.find(
                (a) => a.name.toLowerCase() == string.toLowerCase()
            );
        }

        if (string.length > 0 && acc == undefined) {
            let discusers = await rawMessage.guild.members.fetch({
                query: string,
                limit: 1,
            });
            if (discusers.size > 0) {
                let usr = await discusers.first();
                let id = usr.id;
                let uuid = disclist[id];
                acc = acclist.find((a) => a.uuid == uuid);
            }
        }

        if (acc == undefined) {
            if (rawMessage.mentions.users.size > 0) {
                let discid = "" + rawMessage.mentions.users.first();
                let uuid = disclist[discid];
                acc = acclist.find(
                    (a) =>
                        stringify(a.uuid).toLowerCase() ==
                        uuid.toLowerCase()
                );
            }
        }

        if (acc == undefined) {
            let discid = rawMessage.author.id;
            let uuid = disclist[discid];
            acc = acclist.find(
                (a) =>
                    stringify(a.uuid).toLowerCase() == uuid.toLowerCase()
            );
        }

        return acc;
    }

    static getWebhookObj(embed) {
        let embeds;
        if (embed == undefined) {
            embeds = [];
        } else {
            embeds = [embed];
        }
        return {
            username: "Arcade Bot",
            avatarURL:
                "https://cdn.discordapp.com/avatars/818719828352696320/bb430aeea67244e5c2c8ab56dad79194.webp",
            embeds: embeds,
        };
    }

    static async getPGDailyEmbed() {
        return await webhook.genPGEmbed();
    }

    static emptyField(inline) {
        return {
            name: "\u200B",
            value: "\u200B",
            inline: inline,
        };
    }

    static async getStats(acc, game) {
        let iconURL = "https://crafatar.com/avatars/" + acc.uuid + "?overlay";
        let thumbURL =
            "https://crafatar.com/renders/body/" + acc.uuid + "?overlay";
        let playerURL =
            "http://eatmyvenom.me/share/partygames/player.html?q=" + acc.name;

        let lvl = Math.round(acc.level * 100) / 100;

        let fields = [];

        switch (game.toLowerCase()) {
            case "party":
            case "partygames":
            case "pg": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Party games wins",
                    value: acc.wins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                break;
            }

            case "fh":
            case "farm":
            case "fmhnt":
            case "farmhunt":
            case "frmhnt": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Farm hunt wins",
                    value: acc.farmhuntWins,
                    inline: true,
                });
                fields.push({
                    name: "Farm hunt poop",
                    value: acc.farmhuntShit,
                    inline: true,
                });
                break;
            }

            case "hs":
            case "hys":
            case "hypixel":
            case "says":
            case "hysays": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Hypixel says wins",
                    value: acc.hypixelSaysWins,
                    inline: true,
                });
                fields.push({
                    name: "Hypixel says Rounds",
                    value: acc.extras.hypixelSaysRounds,
                    inline: true,
                });
                break;
            }

            case "hitw":
            case "hit":
            case "hole":
            case "pain": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "HITW wins",
                    value: acc.hitwWins,
                    inline: true,
                });
                fields.push({
                    name: "HITW qualifiers",
                    value: acc.hitwQual,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "HITW finals",
                    value: acc.hitwFinal,
                    inline: true,
                });
                fields.push({
                    name: "HITW walls",
                    value: acc.hitwRounds,
                    inline: true,
                });
                break;
            }

            case "mw":
            case "miw":
            case "mini":
            case "mwall":
            case "wall":
            case "pvp":
            case "miniwalls": {
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Mini walls wins",
                    value: acc.miniWallsWins,
                    inline: true,
                });
                fields.push({
                    name: "Mini walls kit",
                    value: acc.miniWalls.kit,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Mini walls kills",
                    value: acc.miniWalls.kills,
                    inline: true,
                });
                fields.push({
                    name: "Mini walls arrows shot",
                    value: acc.miniWalls.arrowsShot,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Mini walls arrows hit",
                    value: acc.miniWalls.arrowsHit,
                    inline: true,
                });
                fields.push({
                    name: "Mini walls final kills",
                    value: acc.miniWalls.finalKills,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Mini walls wither kills",
                    value: acc.miniWalls.witherKills,
                    inline: true,
                });
                fields.push({
                    name: "Mini walls wither damage",
                    value: acc.miniWalls.witherDamage,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Mini walls deaths",
                    value: acc.miniWalls.deaths,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                break;
            }

            case "sc":
            case "fb":
            case "foot":
            case "ballin":
            case "fuck":
            case "shit":
            case "football": {
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Football wins",
                    value: acc.footballWins,
                    inline: true,
                });
                fields.push({
                    name: "Football goals",
                    value: acc.extras.footballGoals,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Football power kicks",
                    value: acc.extras.footballPKicks,
                    inline: true,
                });
                fields.push({
                    name: "Football kicks",
                    value: acc.extras.footballKicks,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                // <br>
                break;
            }

            case "es":
            case "spleeg":
            case "ender":
            case "enderman":
            case "trash":
            case "enderspleef": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Ender spleef wins",
                    value: acc.enderSpleefWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                break;
            }

            case "to":
            case "throw":
            case "toss":
            case "sumo2":
            case "throwout": {
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Throw out wins",
                    value: acc.throwOutWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Throw out kills",
                    value: acc.extras.throwOutKills,
                    inline: true,
                });
                fields.push({
                    name: "Throw out deaths",
                    value: acc.extras.throwOutDeaths,
                    inline: true,
                });
                break;
            }

            case "gw":
            case "sw":
            case "galaxy":
            case "galaxywars": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Galaxy wars wins",
                    value: acc.galaxyWarsWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Galaxy wars kills",
                    value: acc.extras.galaxyWarsKills,
                    inline: true,
                });
                fields.push({
                    name: "Galaxy wars deaths",
                    value: acc.extras.galaxyWarsDeaths,
                    inline: true,
                });
                break;
            }

            case "dw":
            case "dragon":
            case "dragonwars": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Dragon wars wins",
                    value: acc.dragonWarsWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Dragon wars kills",
                    value: acc.extras.dragonWarsKills,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                break;
            }

            case "bh":
            case "bnt":
            case "one":
            case "bounty":
            case "oneinthequiver":
            case "bountyhunters": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Bounty hunters wins",
                    value: acc.bountyHuntersWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Bounty hunters kills",
                    value: acc.extras.bountyHuntersKills,
                    inline: true,
                });
                fields.push({
                    name: "Bounty hunters deaths",
                    value: acc.extras.bountyHuntersDeaths,
                    inline: true,
                });
                break;
            }

            case "bd":
            case "do":
            case "dayone":
            case "blocking":
            case "blockingdead": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Blocking dead wins",
                    value: acc.blockingDeadWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Blocking dead kills",
                    value: acc.extras.blockingDeadKills,
                    inline: true,
                });
                fields.push({
                    name: "Blocking dead headshots",
                    value: acc.extras.blockingDeadHeadshots,
                    inline: true,
                });
                break;
            }

            case "has":
            case "hide":
            case "h&s":
            case "hns":
            case "probotkeptspammingthisshit":
            case "hideandseek":
            case "hidenseek":
            case "hideseek": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Hide and seek wins",
                    value: acc.hideAndSeekWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push(BotUtils.emptyField(true));
                // <br>
                fields.push({
                    name: "Hide and seek seeker wins",
                    value: acc.extras.HNSSeekerWins,
                    inline: true,
                });
                fields.push({
                    name: "Hide and seek hider wins",
                    value: acc.extras.HNSHiderWins,
                    inline: true,
                });
                break;
            }

            case "z":
            case "zs":
            case "zbs":
            case "zomb":
            case "zbies":
            case "zombies": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Zombies wins",
                    value: acc.zombiesWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                break;
            }

            case "ctw":
            case "ctwool":
            case "capkills":
            case "capture":
            case "capwool":
            case "ctwwool":
            case "ctwwoolcaptured":
            case "ctwkills": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Ctw kills",
                    value: acc.ctwKills,
                    inline: true,
                });
                fields.push({
                    name: "Ctw wool captured",
                    value: acc.ctwWoolCaptured,
                    inline: true,
                });
                break;
            }

            case "pp":
            case "draw":
            case "pixpaint":
            case "pixelpaint":
            case "pixelpainters":
            case "drawmything":
            case "drawtheirthing":
            case "drawing": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Pixel painters wins",
                    value: acc.pixelPaintersWins,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                break;
            }

            case "sim":
            case "simulator":
            case "seasonal":
            case "season":
            case "sea": {
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Easter sim wins",
                    value: acc.seasonalWins.easter,
                    inline: true,
                });
                fields.push({
                    name: "Scuba sim wins",
                    value: acc.seasonalWins.scuba,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Holloween sim wins",
                    value: acc.seasonalWins.halloween,
                    inline: true,
                });
                fields.push({
                    name: "Grinch sim wins",
                    value: acc.seasonalWins.grinch,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
                fields.push({
                    name: "Total sim wins",
                    value: acc.seasonalWins.total,
                    inline: true,
                });
                fields.push(BotUtils.emptyField(true));
            }
        }

        fields.push(BotUtils.emptyField(true));
        let rank = ("" + acc.rank)
            .replace(/_/g, "")
            .replace(/PLUS/g, "+")
            .replace(/undefined/g, "non");
        rank = rank == "" ? "Non" : rank;

        let embed = new MessageEmbed()
            .setAuthor(acc.name, iconURL, playerURL)
            .setTitle("Stats")
            .setThumbnail(thumbURL)
            .setColor(0x44a3e7)
            .addField("All wins", acc.anyWins, true)
            .addField("Arcade wins", acc.arcadeWins, true)
            .addFields(fields)
            .addField("Level", lvl, true)
            .addField("Rank", rank, true)
            .addFields([BotUtils.emptyField(true)])
            .addField("UUID", acc.uuid, false);

        return { res: "", embed: embed };
    }

    static async logIgns(msg) {
        let ignClient = new WebhookClient(
            cfg.loggingHooks.ignHook.id,
            cfg.loggingHooks.ignHook.token
        );
        let logs = [];
        for (let c of cfg.discord.listenChannels) {
            logs.push({ id: c, hook: ignClient });
        }
        let channelID = msg.channel.id;

        for (let logger of logs) {
            if (channelID == logger.id) {
                await BotUtils.logcopy(msg, logger.hook);
            }
        }
        ignClient.destroy();
    }

    static async logcopy(msg, hook) {
        let pfp = msg.author.avatarURL();
        let name = "unknown";
        if (msg.member) {
            name = msg.member.displayName;
        }

        await hook.send(msg.content, { username: name, avatarURL: pfp });
        await hook.send(msg.url, { username: name, avatarURL: pfp });
    }

    static getBlacklistRes() {
        let embed = new MessageEmbed()
            .setTitle("You are blacklisted")
            .setDescription(
                "This means you can not use the bots commands, all attempts will be ignored and you will instead be sent this message in dm's. This action will not expire over time. Should you wish to become unblacklisted then talk to EatMyVenom."
            )
            .setColor(0xff0000);

        return embed;
    }
};
