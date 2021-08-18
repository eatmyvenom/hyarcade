const {
  MessageEmbed
} = require("discord.js");
const Account = require("hyarcade-requests/types/Account");
const Command = require("../../classes/Command");
const {
  getFromDB
} = require("../BotUtils");
const BotUtils = require("../BotUtils");
const InteractionUtils = require("../interactions/InteractionUtils");
const CommandResponse = require("../Utils/CommandResponse");
const {
  ERROR_UNLINKED
} = require("../Utils/Embeds/StaticEmbeds");

/**
 * @param {Account} acc
 * @returns {string}
 */
function getGames (acc) {
  let games = [{
    name: "Party games",
    wins: acc.partyGames.wins
  },
  {
    name: "HITW",
    wins: acc.holeInTheWall.wins
  },
  {
    name: "Farm hunt",
    wins: acc.farmhunt.wins
  },
  {
    name: "Hypixel says",
    wins: acc.hypixelSays.wins
  },
  {
    name: "Mini walls",
    wins: acc.miniWalls.wins
  },
  {
    name: "Football",
    wins: acc.football.wins
  },
  {
    name: "Ender spleef",
    wins: acc.enderSpleef.wins
  },
  {
    name: "Dragon wars",
    wins: acc.dragonWars.wins
  },
  {
    name: "Bounty hunters",
    wins: acc.bountyHunters.wins
  },
  {
    name: "Blocking dead",
    wins: acc.blockingDead.wins
  },
  {
    name: "Throw out",
    wins: acc.throwOut.wins
  },
  {
    name: "Hide and seek",
    wins: acc.hideAndSeek.wins
  },
  {
    name: "Zombies",
    wins: acc.zombies.wins_zombies
  },
  {
    name: "Galaxy wars",
    wins: acc.galaxyWars.wins
  },
  {
    name: "Pixel painters",
    wins: acc.pixelPainters.wins
  },
  {
    name: "Seasonal",
    wins: acc.seasonalWins.total
  },
  ];

  games = games.sort((a, b) => {
    if(b.wins == undefined) {
      return -1;
    }

    if(a.wins == undefined) {
      return 1;
    }

    return b.wins - a.wins;
  });

  let str = "";
  let i = 0;

  for(const g of games) {
    if(g.wins != 0 && g.wins != undefined) {
      str += `${i += 1}) **${g.name}** (${g.wins})\n`;
    }
  }

  return str;

}

/**
 * @param {Account} acc1
 * @param {Account} acc2
 * @returns {Account}
 */
function getTimedAccount (acc1, acc2) {
  acc1.partyGames.wins = (acc1?.partyGames?.wins ?? 0) - (acc2?.partyGames?.wins ?? 0);
  acc1.holeInTheWall.wins = (acc1?.holeInTheWall?.wins ?? 0) - (acc2?.holeInTheWall?.wins ?? 0);
  acc1.farmhunt.wins = (acc1?.farmhunt?.wins ?? 0) - (acc2?.farmhunt?.wins ?? 0);
  acc1.hypixelSays.wins = (acc1?.hypixelSays.wins ?? 0) - (acc2?.hypixelSays.wins ?? 0);
  acc1.miniWalls.wins = (acc1?.miniWalls?.wins ?? 0) - (acc2?.miniWalls?.wins ?? 0);
  acc1.football.wins = (acc1?.football?.wins ?? 0) - (acc2?.football?.wins ?? 0);
  acc1.enderSpleef.wins = (acc1?.enderSpleef?.wins ?? 0) - (acc2?.enderSpleef?.wins ?? 0);
  acc1.dragonWars.wins = (acc1.dragonWars?.wins ?? 0) - (acc2?.dragonWars?.wins ?? 0);
  acc1.bountyHunters.wins = (acc1.bountyHunters?.wins ?? 0) - (acc2?.bountyHunters?.wins ?? 0);
  acc1.blockingDead.wins = (acc1.blockingDead?.wins ?? 0) - (acc2?.blockingDead?.wins ?? 0);
  acc1.throwOut.wins = (acc1.throwOut?.wins ?? 0) - (acc2?.throwOut?.wins ?? 0);
  acc1.hideAndSeek.wins = (acc1?.hideAndSeek?.wins ?? 0) - (acc2?.hideAndSeek?.wins ?? 0);
  acc1.zombies.wins_zombies = (acc1.zombies?.wins_zombies ?? 0) - (acc2?.zombies?.wins_zombies ?? 0);
  acc1.galaxyWars.wins = (acc1?.galaxyWars?.wins ?? 0) - (acc2?.galaxyWars?.wins ?? 0);
  acc1.pixelPainters.wins = (acc1?.pixelPainters?.wins ?? 0) - (acc2?.pixelPainters?.wins ?? 0);
  acc1.seasonalWins.total = (acc1?.seasonalWins?.total ?? 0) - (acc2?.seasonalWins?.total ?? 0);

  return acc1;
}

module.exports = new Command("top-games", ["*"], async (args, rawMsg, interaction) => {
  const plr = args[0];
  const timetype = args[1];
  let acc;
  if(interaction == undefined) {
    acc = await BotUtils.resolveAccount(plr, rawMsg, args.length != 2);
  } else {
    acc = await InteractionUtils.resolveAccount(interaction);
    if(acc == undefined) return new CommandResponse("", ERROR_UNLINKED);
  }

  if(timetype == "d") {
    const daily = await getFromDB("dayaccounts");
    const dayAcc = await daily.find((a) => a?.uuid == acc.uuid);
    acc = getTimedAccount(acc, dayAcc);
  } else if(timetype == "w") {
    const weekly = await getFromDB("weeklyaccounts");
    const dayAcc = await weekly.find((a) => a?.uuid == acc.uuid);
    acc = getTimedAccount(acc, dayAcc);
  } else if(timetype == "m") {
    const monthly = await getFromDB("monthlyaccounts");
    const dayAcc = await monthly.find((a) => a?.uuid == acc.uuid);
    acc = getTimedAccount(acc, dayAcc);
  }

  const embed = new MessageEmbed()
    .setTitle(`${acc.name} top games won`)
    .setDescription(getGames(acc))
    .setColor(0x44a3e7);
  return {
    res: "",
    embed
  };
});
