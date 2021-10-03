const logger = require("hyarcade-logger");
const utils = require("../utils");
const cfg = require("../Config").fromJSON();
const force = utils.fileExists("force") || cfg.alwaysForce;
const Runtime = require("../Runtime");
const fs = require("fs-extra");
const Account = require("hyarcade-requests/types/Account");
const HyarcadeWorkerRequest = require("../request/HyarcadeWorkerRequest");
const process = require("process");
const { sleep } = require("../utils");
const AccountArray = require("hyarcade-requests/types/AccountArray");

class Response {
  key = {};
  data = [];
}

/**
 * 
 * @param {object[]} guildlist the raw guild list
 * @param {string} uuid the players uuid
 * @returns {object} The guild of the specified player
 */
function getGuild (guildlist, uuid) {
  for(const guild of guildlist) {
    if(guild.memberUUIDs.includes((`${uuid}`).toLowerCase())) {
      return guild;
    }
  }
}

/**
 * @param {object} object
 * @param {string} value
 * @returns {any} The value in the object 
 */
function getKeyByValue (object, value) {
  return Object.keys(object).find((key) => object[key] == value);
}

/**
 * 
 * @param {Account[]} accounts 
 * @returns {Promise<Account[]>}
 */
async function fakeStats (accounts) {
  try {
    const fakeFile = await utils.readJSON("fakeStats.json");

    for (const acc of accounts) {
      if(Object.keys(fakeFile).includes(acc.uuid)) {
        logger.log(`Setting data for ${acc.name}`);
        Object.assign(acc, fakeFile[acc.uuid]);
      }
    }

    return accounts;
  } catch (e) {
    logger.err("Fake stats file unaccessable");
    return accounts;
  }
}

/**
 * 
 * @param {Account[]} accounts
 * @returns {Promise<Account[]>}
 */
async function discordIDs (accounts) {
  const disclist = await utils.readJSON("disclist.json");

  for (const acc of accounts) {
    acc.discord = getKeyByValue(disclist, acc.uuid);
  }

  return accounts;
}

/**
 * 
 * @param {Account[]} accounts 
 * @returns {Promise<Account[]>}
 */
async function guilds (accounts) {
  const guildlist = await utils.readJSON("guild.json");

  for (const acc of accounts) {
    const guild = getGuild(guildlist, acc.uuid);
    if(guild) {
      acc.guildID = guild.uuid;
      acc.guild = guild.name;
      acc.guildTag = guild.tag;
      acc.guildTagColor = guild.color;
    }
  }

  return accounts;
}

/**
 * 
 * @param {Account[]} accounts 
 * @returns {Promise<Account[]>}
 */
async function hackerlist (accounts) {
  const hackerlist = await fs.readFile("data/hackerlist");

  for (const acc of accounts) {
    acc.hacker = hackerlist.includes(acc.uuid);
  }

  return accounts;
}

/**
 * 
 * @param {string[]} uuids 
 * @returns {Response}
 */
async function requestData (uuids) {
  try {
    return await HyarcadeWorkerRequest(uuids);
  } catch (e) {
    return await requestData(uuids);
  }
}

/**
 * 
 * @param {*} accs 
 * @param {*} currentBatch 
 * @param {*} updatedAccs 
 * @param {*} segmentedAccs 
 * @param {*} perSegment 
 */
async function updateSegment (accs, currentBatch, updatedAccs, segmentedAccs, perSegment) {
  if(accs == undefined) {
    return;
  }
  const uuidArr = [];

  for (const acc of accs) {
    uuidArr.push(acc.uuid);
  }

  logger.debug(`Getting batch ${currentBatch} of ${segmentedAccs.length} from webworker!`);
  const workerData = await requestData(uuidArr);

  if(workerData.key.remaining < perSegment + 5) {
    logger.info(`Nearing rate limit sleeping for ${workerData.key.reset * 1000}ms`);
    await sleep(workerData.key.reset * 1000);
  }

  for (const acc of accs) {
    logger.log(`Setting data for ${acc.uuid}`);
    const accData = workerData.data[acc.uuid];
    if(accData?.success == false) {
      logger.err(`Account data retrevial unsuccessful for ${acc.uuid}`);
      logger.err(JSON.stringify(accData, null, 2));
      process.exit(344);
    }
    acc.setHypixel(accData);
    updatedAccs.push(acc);
  }
}

/**
 * 
 * @param {Array} a 
 * @param {Function} key 
 * @returns {Array}
 */
function uniqBy (a, key) {
  const seen = {};
  return a.filter((item) => {
    const k = key(item);
    // eslint-disable-next-line no-prototype-builtins
    return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  });
}

/**
 * Update the player data for all players in the list
 *
 * @param {Account[]} accounts
 * @returns {Promise<Account[]>}
 */
async function fastUpdate (accounts) {
  await fs.writeFile("starttime", (`${Date.now()}`));

  const perSegment = cfg.segmentSize;

  const oldAccs = AccountArray(await utils.readDB("accounts"));
  
  let importantAccounts = [];
  const ignoreAccounts = [];

  for (const acc of accounts) {
    const oldAcc = oldAccs.find((a) => a.uuid == acc.uuid);
    if(isImportant(oldAcc)) {
      importantAccounts.push(acc);
    } else {
      ignoreAccounts.push(oldAcc);
    }
  }

  importantAccounts = importantAccounts.concat(oldAccs.sort((a, b) => a.updateTime - b.updateTime).slice(0, perSegment));

  const segmentedAccs = importantAccounts.reduce((resultArray, item, index) => { 
    const segmentIndex = Math.floor(index / perSegment);

    if(!resultArray[segmentIndex]) {
      resultArray[segmentIndex] = [];
    }

    resultArray[segmentIndex].push(item);

    return resultArray;
  }, []);

  let updatedAccs = [];

  for(let i = 0;i < segmentedAccs.length; i += 1) {
    await Promise.all([
      updateSegment(segmentedAccs[i], i, updatedAccs, segmentedAccs, perSegment),
      updateSegment(segmentedAccs[i += 1], i, updatedAccs, segmentedAccs, perSegment),
      updateSegment(segmentedAccs[i += 1], i, updatedAccs, segmentedAccs, perSegment),
    ]);
  }

  const runtime = Runtime.fromJSON();
  runtime.needRoleupdate = true;
  await runtime.save();

  updatedAccs = updatedAccs.concat(ignoreAccounts);

  await updatedAccs.sort(utils.winsSorter);
  
  updatedAccs = uniqBy(updatedAccs, (a) => a.uuid);
  updatedAccs = await fakeStats(updatedAccs);
  updatedAccs = await discordIDs(updatedAccs);
  updatedAccs = await guilds(updatedAccs);
  updatedAccs = await hackerlist(updatedAccs);

  return updatedAccs;
}

/**
 * Update the player data for all players in the list
 *
 * @param {Account[]} accounts
 * @returns {Promise<Account[]>}
 */
module.exports = async function updateAccounts (accounts) {

  if(cfg.clusters[cfg.cluster].flags.includes("useWorkers")) {
    return await fastUpdate(accounts);
  }

  let accs = accounts.sort(utils.winsSorter);
  await fs.writeFile("starttime", (`${Date.now()}`));

  const oldAccs = await utils.readDB("accounts");

  let i;
  let j;
  let temparray;

  const chunk = 120;
  for(i = 0, j = accs.length; i < j; i += chunk) {
    temparray = accs.slice(i, i + chunk);
    await updateAccountsInArr(temparray, oldAccs);
  }

  if(utils.fileExists("data/accounts.json.part")) {
    const addedAccounts = await utils.readJSON("accounts.json.part");
    await fs.rm("data/accounts.json.part");
    accs = accs.concat(addedAccounts);
  }

  if(utils.fileExists("data/accounts.json.full")) {
    const fullList = await utils.readJSON("accounts.json.full");
    await fs.rm("data/accounts.json.full");
    for(let i = 0; i < accs.length; i += 1) {
      const acc = accs[i];
      const newAcc = fullList.find((a) => a.uuid == acc.uuid);
      if(newAcc != undefined && newAcc.updateTime > acc.updateTime) {
        logger.info(`Setting ${newAcc.name}'s data from outside source!`);
        acc.setData(newAcc);
      }
    }
  }

  const runtime = Runtime.fromJSON();
  runtime.needRoleupdate = true;
  await runtime.save();

  if(force && utils.fileExists("force")) {
    await fs.rm("force");
  }

  await accs.sort(utils.winsSorter);
  return accs;
};

/**
 * @param {Account[]} accounts
 * @param {Account[]} oldAccs
 * @returns {Promise}
 */
async function updateAccountsInArr (accounts, oldAccs) {
  return await Promise.all(
    accounts.map(async (account) => {
      const oldAcc = oldAccs.find((a) => a.uuid == account.uuid);
      if(isImportant(oldAcc)) {
        logger.out(`Updating ${oldAcc?.name}'s data`);
        await account.updateData();
      } else {
        logger.info(`Ignoring ${oldAcc?.name} for this refresh`);
        account.setData(oldAcc);
      }
    })
  );
}

/**
 * 
 * @param {Account} oldAcc 
 * @returns {boolean}
 */
function isImportant (oldAcc) {

  if(oldAcc == undefined) {
    return true;
  }

  if(force) {
    return true;
  }

  // Make sure they have a relavent amount of arcade games wins
  const isArcadePlayer = oldAcc.arcadeWins >= 500;

  // Make sure their arcade wins are not inflated due to football
  const fbAboveInflationLimit = (oldAcc?.football?.wins ?? 0) >= 8000;
  const fbBelowInflationLimit = (oldAcc?.football?.wins ?? 0) <= 250;

  const notFbInflated = fbBelowInflationLimit || fbAboveInflationLimit;

  // Make sure their arcade wins are not inflated due to mini walls
  const mwAboveInflationLimit = (oldAcc?.miniWalls?.wins ?? 0) >= 750;
  const mwBelowInflationLimit = (oldAcc?.miniWalls?.wins ?? 0) <= 100;

  const notMwInflated = mwBelowInflationLimit || mwAboveInflationLimit;

  // Make sure their arcade wins are not inflated due to hide and seek
  const hnsAboveInflationLimit = (oldAcc?.hideAndSeek?.wins ?? 0) >= 1000;
  const hnsBelowInflationLimit = (oldAcc?.hideAndSeek?.wins ?? 0) <= 200;

  const nothnsInflated = hnsBelowInflationLimit || hnsAboveInflationLimit;

  // Linked players should update more often since they will check their own stats
  const isLinked = !!oldAcc.discord;

  // Ignore people who have not played within the last 3 days
  const hasPlayedRecently = Date.now() - oldAcc.lastLogout < 259200000;

  const hasImportantStats = isArcadePlayer && notFbInflated && notMwInflated && nothnsInflated;

  const meetsRequirements = (isLinked || hasImportantStats) && hasPlayedRecently;

  return meetsRequirements;
}
