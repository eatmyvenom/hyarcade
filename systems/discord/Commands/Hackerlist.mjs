import Database from "hyarcade-requests/Database.js";
import Command from "hyarcade-structures/Discord/Command.js";
import BotRuntime from "../BotRuntime.js";
import { ERROR_ARGS_LENGTH } from "../Utils/Embeds/DynamicEmbeds.js";

export default new Command("hackerlist", ["%trusted%"], async args => {
  const operation = args[0] ?? "ls";

  if (operation == undefined) {
    return {
      res: "",
      embed: ERROR_ARGS_LENGTH(1),
    };
  }

  let res;

  switch (operation) {
    case "+":
    case "add":
    case "plus": {
      await Database.addHacker(args[1]);
      res = {
        res: "UUID added!",
      };
      break;
    }

    case "-":
    case "rm":
    case "remove": {
      await Database.delHacker(args[1]);
      res = {
        res: "UUID removed!",
      };
      break;
    }

    case "-l":
    case "ls":
    case "list":
    case "show": {
      /** @type {string[]} */
      let hackers = await BotRuntime.getFromDB("hackerList");
      res = {
        res: `\`\`\`\n${hackers.join("\n")}\`\`\``,
      };
      break;
    }
  }

  return res;
});
