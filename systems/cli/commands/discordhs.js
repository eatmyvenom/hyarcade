const webhook = require("@hyarcade/events/webhook");

/**
 *
 */
async function main() {
  await webhook.sendHSEmbed();
}

module.exports = main;
