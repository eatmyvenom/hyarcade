import Database from "hyarcade-requests/Database";
import Command from "hyarcade-structures/Discord/Command.js";
import CommandResponse from "hyarcade-structures/Discord/CommandResponse.js";
import { createRequire } from "node:module";
import { inspect } from "node:util";
import BotRuntime from "../BotRuntime.js";

const require = createRequire(import.meta.url);

/**
 * @param {string} str
 * @returns {string}
 */
function safeEval(str) {
  return new Function("c", "r", "br", "m", "db", `"use strict";return (${str})`);
}

export default new Command("eval", ["156952208045375488"], async (args, rawMsg) => {
  const c = BotRuntime.client;
  const f = safeEval(args.join(" "));

  let evaled = f(c, require, BotRuntime, rawMsg, Database);

  if (typeof evaled != "string") {
    evaled = inspect(evaled, true);
  }

  const res = `\`\`\`\nResponse:\n${evaled}\n\`\`\``;
  return new CommandResponse(res);
});
