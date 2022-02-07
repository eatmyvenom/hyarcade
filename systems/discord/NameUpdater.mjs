import logger from "hyarcade-logger";
import { createRequire } from "node:module";
import BotRuntime from "./BotRuntime.js";
const require = createRequire(import.meta.url);

const { Client } = require("discord.js");

/**
 * @param {Client} client
 */
export default async function NameUpdater(client) {
  logger.info("Updating usernames in mini walls discord");
  const accs = await BotRuntime.getFromDB("accounts", ["uuid", "name", "hypixelDiscord"]);
  const list = await BotRuntime.getFromDB("discordList");
  const disclist = {};

  for (const link of list) {
    disclist[link.discordID] = link.uuid;
  }

  const mwServer = await client.guilds.fetch("789718245015289886");
  const mwMembers = await mwServer.members.fetch();

  for (const m of mwMembers) {
    const uuid = disclist[m.id];
    if (uuid != undefined) {
      const acc = accs.find(a => a.uuid == uuid);
      if (acc != undefined && acc.name != undefined && acc.name != "INVALID-NAME" && acc.name != m.displayName) {
        try {
          await m.setNickname(acc.name);
        } catch (error) {
          logger.err(error.stack);
        }
      }
    }
  }

  logger.info("Names updated!");
}
