const Logger = require("hyarcade-logger");
const Database = require("hyarcade-requests/Database");
const LocalWorker = require("../datagen/LocalWorker");

const cfg = require("hyarcade-config").fromJSON();

/**
 *
 */
async function main() {
  Logger.name = "Local-Manager";
  const keys = cfg.hypixel.batchKeys;
  const interfaces = cfg.hypixel.localInterfaces;
  const len = Math.min(keys.length, interfaces.length);

  let ping = await Database.ping();
  while (ping) {
    const workers = [];
    for (let i = 0; i < len; i++) {
      const key = keys[i];
      const netIP = interfaces[i];
      const batchRes = await Database.internal({ getBatch: true });

      workers.push(LocalWorker(batchRes, key, netIP));
    }

    await Promise.all(workers);
    Logger.log("Group finished");
    ping = await Database.ping();
  }
}

module.exports = main;