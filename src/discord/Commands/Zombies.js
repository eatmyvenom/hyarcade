const { MessageEmbed } = require("discord.js");
const Command = require("../../classes/Command");
const BotUtils = require("../BotUtils");
const InteractionUtils = require("../interactions/InteractionUtils");

function numberify(n) {
    let r = Intl.NumberFormat("en").format(Number(n));
    r = r == NaN ? (r = "N/A") : r;
    return r;
}

module.exports = new Command("zombies", ["*"], async (args, rawMsg, interaction) => {
    let plr = args[0];
    let acc;
    if (interaction == undefined) {
        acc = await BotUtils.resolveAccount(plr, rawMsg, args.length != 2);
    } else {
        acc = await InteractionUtils.resolveAccount(interaction);
    }

    let embed = new MessageEmbed()
        .setTitle(acc.name + " zombies stats")
        .addField("Stats", 
            `**Wins** - ${numberify(acc.zombies?.wins_zombies ?? 0)}\n` +
            `**Rounds** - ${numberify(acc.zombies?.total_rounds_survived_zombies ?? 0)}\n` +
            `**Kills** - ${numberify(acc.zombies?.zombie_kills_zombies ?? 0)}\n` +
            `**Knocks** - ${numberify(acc.zombies?.times_knocked_down_zombies ?? 0)}\n` +
            `**Deaths** - ${numberify(acc.zombies?.deaths_zombies ?? 0)}\n`,
        true)
        .addField("Info", 
            `**Doors opened** - ${numberify(acc.zombies?.doors_opened_zombies ?? 0)}\n` +
            `**Best round** - ${numberify(acc.zombies?.best_round_zombies ?? 0)}\n` +
            `**Revives** - ${numberify(acc.zombies?.players_revived_zombies ?? 0)}\n`,
        true)
        .addField("Ratios", 
            `**Wins/Losses** - ${numberify((acc.zombies?.wins_zombies ?? 0) / (acc.zombies?.deaths_zombies ?? 0))}\n` +
            `**Kills/Rounds** - ${numberify((acc.zombies?.zombie_kills_zombies ?? 0) / (acc.zombies?.total_rounds_survived_zombies ?? 0))}\n` +
            `**Accuracy** - ${numberify((acc.zombies?.bullets_shot_zombies ?? 0) / (acc.zombies?.bullets_hit_zombies ?? 0))}\n` +
            `**Headshot ratio** - ${numberify((acc.zombies?.headshots_zombies ?? 0) / (acc.zombies?.bullets_hit_zombies ?? 0))}\n`,
        true)
        .setThumbnail("https://crafatar.com/renders/head/" + acc.uuid + "?overlay")
        .setColor(0x44a3e7);
    return { res: "", embed: embed };
});