import Command from "@hyarcade/structures/Discord/Command.js";
import CommandResponse from "@hyarcade/structures/Discord/CommandResponse.js";
import { client } from "../BotRuntime.js";

export default new Command("setpresence", ["%trusted%"], async args => {
  const txt = args.join(" ");
  await client.user.setPresence({ activities: [{ name: txt, type: "PLAYING" }], status: "online" });

  return new CommandResponse("Presence updated!");
});
