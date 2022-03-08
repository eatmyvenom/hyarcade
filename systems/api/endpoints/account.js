const { URL } = require("url");
const cfg = require("hyarcade-config").fromJSON();
const Logger = require("hyarcade-logger");
const { Account } = require("hyarcade-structures");
const AccountResolver = require("../AccountResolver");
const MongoConnector = require("hyarcade-requests/MongoConnector");
const MergeJSON = require("hyarcade-utils/MergeJSON");

let fakeData;

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {MongoConnector} connector
 */
module.exports = async (req, res, connector) => {
  if (fakeData == undefined) {
    fakeData = await connector.fakePlayers.find().toArray();
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  if (req.method == "GET") {
    res.setHeader("Content-Type", "application/json");
    let resolvedAccount = await AccountResolver(connector, url);

    if (resolvedAccount?.name == "INVALID-NAME" || resolvedAccount?.name == undefined || resolvedAccount == undefined) {
      Logger.warn(`${url.searchParams} could not resolve to anything`);
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          error: "ACC_UNDEFINED",
        }),
      );
      return;
    }

    const time = url.searchParams.get("time");
    let response = {};

    if (time != undefined && time != "lifetime") {
      response.acc = resolvedAccount;
      const snapshotAccount = await connector.getTimedAccount(resolvedAccount.uuid, time);
      response.timed = snapshotAccount;
    } else {
      response = resolvedAccount;
    }

    res.write(JSON.stringify(response));
    res.end();
  } else if (req.method == "POST") {
    let data = "";
    let json = {};

    const key = cfg.database.keys[req.headers.key];
    const fullAuth = req.headers.authorization == cfg.database.pass;
    const keyValid = key != undefined && key.perms.includes("push");

    if (fullAuth || keyValid) {
      req.on("data", d => (data += d));
      req.on("end", async () => {
        json = JSON.parse(data);
        let newAcc = Account.from(json);

        const fakeAcc = fakeData.find(a => a.uuid == newAcc.uuid);
        if (fakeAcc != undefined) {
          Logger.info(`Overwriting data for ${newAcc.name}`);
          newAcc = MergeJSON(newAcc, fakeAcc);
        }

        connector
          .updateAccount(newAcc)
          .then(() => {})
          .catch(error => Logger.err(error.stack));

        res.end();
      });
    } else {
      Logger.warn("Someone tried to post without correct AUTH");
      res.statusCode = 403;
      res.end();
    }
  } else {
    res.statusCode = 404;
    res.end();
  }
};