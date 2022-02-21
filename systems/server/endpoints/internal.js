/* eslint-disable unicorn/no-lonely-if */
const Logger = require("hyarcade-logger");
const MongoConnector = require("hyarcade-requests/MongoConnector");
const cfg = require("hyarcade-config").fromJSON();

// eslint-disable-next-line prefer-arrow-callback
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/**
 * @param {string} str
 * @returns {string}
 */
function safeEval(str) {
  return new AsyncFunction("c", `"use strict";return (${str})`);
}

let nextLevel = 0;
let currentUUIDs = [];

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {MongoConnector} connector
 */
module.exports = async (req, res, connector) => {
  if (req.method == "GET") {
    res.statusCode = 404;
    res.end();
  } else if (req.method == "POST") {
    let data = "";
    let json = {};

    const key = cfg.database.keys[req.headers.key];
    const fullAuth = req.headers.authorization == cfg.database.pass;
    const keyValid = key != undefined && key.perms.includes("internal");

    if (fullAuth || keyValid) {
      req.on("data", d => (data += d));
      req.on("end", async () => {
        res.setHeader("Content-Type", "application/json");
        json = JSON.parse(data);

        if ((fullAuth || key.perms.includes("important")) && json.fetchImportant) {
          res.write(JSON.stringify(connector.getImportantAccounts(json.fetchImportant)));
        }

        if ((fullAuth || key.perms.includes("eval")) && json.mongoEval) {
          Logger.warn("Evaluating raw JS.");
          const fun = safeEval(json.mongoEval);
          const result = await fun(connector);

          res.write(JSON.stringify({ result }));
        }

        if ((fullAuth || key.perms.includes("statsEdit")) && json.useCommand) {
          await connector.useCommand(json.useCommand.name, json.useCommand.type);
          res.write(JSON.stringify({ success: true }));
        }

        if ((fullAuth || key.perms.includes("forceUpdate")) && json.forceUpdate) {
          nextLevel = json.forceUpdate;
          res.write(JSON.stringify({ success: true }));
        }

        if ((fullAuth || key.perms.includes("batch")) && json.getBatch) {
          if (currentUUIDs.length === 0) {
            currentUUIDs = await connector.getImportantAccounts(nextLevel);
            nextLevel = 0;
          }

          const batch = currentUUIDs.splice(0, Math.min(cfg.hypixel.segmentSize, currentUUIDs.length));
          res.write(JSON.stringify(batch));
        }

        res.end();
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
  }
};