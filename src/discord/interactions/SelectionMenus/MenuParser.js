const {
  SelectMenuInteraction
} = require("discord.js");
const BotUtils = require("../../BotUtils");
const ButtonResponse = require("../Buttons/ButtonResponse");
const InteractionUtils = require("../InteractionUtils");
const MenuGenerator = require("./MenuGenerator");

/**
 * 
 * @param {SelectMenuInteraction} interaction 
 * @returns {ButtonResponse}
 */
module.exports = async function MenuParser (interaction) {
  const data = interaction.customId.split(":");
  const commandType = data[0];
  switch(commandType) {
  case "s": {
    return await statsHandler(data[1], interaction.values[0]);
  }
  }
};

/**
 * @param {string} accUUID
 * @param {string} game
 * @returns {ButtonResponse}
 */
async function statsHandler (accUUID, game) {
  const accData = await InteractionUtils.accFromUUID(accUUID);
  const statsRes = await BotUtils.getStats(accData, game);
  const {
    embed
  } = statsRes;

  const mnu = await MenuGenerator.statsMenu(accUUID);
  return new ButtonResponse("", [embed], mnu);
}
