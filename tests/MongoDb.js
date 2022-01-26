const Logger = require("hyarcade-logger");
const connector = require("hyarcade-requests/MongoConnector");

/**
 *
 */
async function main() {
  const c = new connector("mongodb://127.0.0.1:27017");
  await c.connect();

  const lb = await c.getLeaderboard("partyGames.wins", false, false, 10, false);
  console.dir(lb);

  await c.destroy();
}

main()
  .then(Logger.log)
  .catch(Logger.err);