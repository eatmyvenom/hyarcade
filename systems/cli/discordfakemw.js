const webhook = require("../events/webhook");

/**
 *
 */
async function main() {
  await webhook.sendFakeMiwLB();
}

module.exports = main;
