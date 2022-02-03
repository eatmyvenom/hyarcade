const MongoConnector = require("hyarcade-requests/MongoConnector");
const cfg = require("hyarcade-config").fromJSON();

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {MongoConnector} connector
 */
module.exports = async (req, res, connector) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  if (req.method == "GET") {
    const action = url.searchParams.get("action");
    const uuid = url.searchParams.get("uuid");
    const id = url.searchParams.get("id");

    if (req.headers.authorization == cfg.dbPass) {
      if (action == "ln") {
        await connector.linkDiscord(id, uuid);
      } else {
        await connector.unlinkDiscord(uuid);
        await connector.unlinkDiscord(id);
      }
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ success: true }));
      res.end();
    } else {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 403;
      res.write(JSON.stringify({ error: "MISSING AUTH" }));
    }
  } else {
    res.statusCode = 404;
    res.end();
  }
};