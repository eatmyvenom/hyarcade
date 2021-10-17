const { MessageButton } = require("discord.js");
const {
  MessageActionRow,
  MessageSelectMenu
} = require("discord.js");

module.exports = class MenuGenerator {
  static statsMenu (uuid, time, game) {
    const row = new MessageActionRow();
    const menu = new MessageSelectMenu()
      .setMaxValues(1)
      .setMinValues(1)
      .setCustomId(`s:${uuid}:${time}:${game}:menu`)
      .setPlaceholder("Select game to see stats from")
      .addOptions([{
        label: "Overall Arcade",
        value: "arc",
        description: "Overall stats about arcade games"
      },
      {
        label: "Blocking dead",
        value: "bd",
        description: "Hypixel arcade blocking dead stats"
      },
      {
        label: "Bounty hunters",
        value: "bh",
        description: "Hypixel arcade bounty hunters stats"
      },
      {
        label: "Capture the wool",
        value: "ctw",
        description: "Hypixel arcade capture the wool stats"
      },
      {
        label: "Dragon wars",
        value: "dw",
        description: "Hypixel arcade dragon wars stats"
      },
      {
        label: "Ender spleef",
        value: "es",
        description: "Hypixel arcade ender spleef stats"
      },
      {
        label: "Farm hunt",
        value: "fh",
        description: "Hypixel arcade farm hunt stats"
      },
      {
        label: "Football",
        value: "fb",
        description: "Hypixel arcade football stats"
      },
      {
        label: "Galaxy wars",
        value: "gw",
        description: "Hypixel arcade galaxy wars stats"
      },
      {
        label: "Hide and seek",
        value: "hns",
        description: "Hypixel arcade hide and seek stats"
      },
      {
        label: "Hole in the wall",
        value: "hitw",
        description: "Hypixel arcade hole in the wall stats"
      },
      {
        label: "Hypixel says",
        value: "hs",
        description: "Hypixel arcade hypixel says stats"
      },
      {
        label: "Mini walls",
        value: "mw",
        description: "Hypixel arcade mini walls stats"
      },
      {
        label: "Party games",
        value: "pg",
        description: "Hypixel arcade party games stats"
      },
      {
        label: "Pixel painters",
        value: "pp",
        description: "Hypixel arcade pixel painters stats"
      },
      {
        label: "Seasonal games",
        value: "sim",
        description: "Stats for all of the hypixel seasonal games"
      },
      {
        label: "Throw out",
        value: "to",
        description: "Hypixel arcade throw out stats"
      },
      {
        label: "Zombies",
        value: "z",
        description: "Hypixel arcade zombies stats"
      },
      ]);

    row.addComponents(menu);

    const row2 = new MessageActionRow();

    const lifetime = new MessageButton().setCustomId(`s:${uuid}:lifetime:${game}:b`)
      .setLabel("Lifetime")
      .setStyle("SUCCESS")
      .setDisabled(time == "lifetime");

    const day = new MessageButton().setCustomId(`s:${uuid}:day:${game}:b`)
      .setLabel("Daily")
      .setStyle("SECONDARY")
      .setDisabled(time == "day");

    const weekly = new MessageButton().setCustomId(`s:${uuid}:weekly:${game}:b`)
      .setLabel("Weekly")
      .setStyle("SECONDARY")
      .setDisabled(time == "weekly");

    const monthly = new MessageButton().setCustomId(`s:${uuid}:monthly:${game}:b`)
      .setLabel("Monthly")
      .setStyle("SECONDARY")
      .setDisabled(time == "monthly");

    row2.addComponents(lifetime, day, weekly, monthly);

    return [row2, row];
  }

  static partyGamesMenu (uuid) {
    const row = new MessageActionRow();
    const menu = new MessageSelectMenu()
      .setMaxValues(1)
      .setMinValues(1)
      .setCustomId(`pg:${uuid}:menu`)
      .setPlaceholder("Select a party game")
      .addOptions([{
        label: "Overall",
        value: "Party Games",
      },
      {
        label: "Animal Slaughter",
        value: "Animal Slaughter",
      },
      {
        label: "Anvil Spleef",
        value: "Anvil Spleef",
      },
      {
        label: "Bombardment",
        value: "Bombardment",
      },
      {
        label: "Chicken Rings",
        value: "Chicken Rings",
      },
      {
        label: "Dive",
        value: "Dive",
      },
      {
        label: "High Ground",
        value: "High Ground",
      },
      {
        label: "Hoe Hoe Hoe",
        value: "Hoe Hoe Hoe",
      },
      {
        label: "Jigsaw Rush",
        value: "Jigsaw Rush",
      },
      {
        label: "Parkour",
        value: "Parkour",
      },
      {
        label: "Lab Escape",
        value: "Lab Escape",
      },
      {
        label: "Lawn Moower",
        value: "Lawn Moower",
      },
      {
        label: "Minecart Racing",
        value: "Minecart Racing",
      },
      {
        label: "RPG-16",
        value: "RPG-16",
      },
      {
        label: "Spider Maze",
        value: "Spider Maze",
      },
      {
        label: "Avalanche",
        value: "Avalanche",
      },
      {
        label: "Misc Pigs",
        value: "Misc Pigs",
      },
      {
        label: "Trampolinio",
        value: "Trampolinio",
      },
      {
        label: "Workshop",
        value: "Workshop",
      },
      {
        label: "Shooting Range",
        value: "Shooting Range",
      },
      {
        label: "Frozen Floor",
        value: "Frozen Floor",
      },
      {
        label: "Cannon Painting",
        value: "Cannon Painting",
      },
      {
        label: "Fire Leapers",
        value: "Fire Leapers",
      },
      {
        label: "Super Sheep",
        value: "Super Sheep",
      }
      ]);

    row.addComponents(menu);
    return row;
  }
};
