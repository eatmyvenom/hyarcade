const TimSort = require("timsort");
const FileCache = require("../../utils/files/FileCache");

/**
 * @param {string} str
 * @returns {number}
 */
function numberify (str) {
  const cleanStr = str ?? 0;
  return Number(cleanStr);
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {FileCache} fileCache 
 */
module.exports = async (req, res, fileCache) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const lbprop = url.searchParams.get("path");
  const category = url.searchParams.get("category");
  const timePeriod = url.searchParams.get("time");
  if(req.method == "GET") {
    res.setHeader("Content-Type", "application/json");
    let {
      accounts
    } = fileCache;

    if(timePeriod == undefined) {
      if(category == null) {
        TimSort.sort(accounts, (b, a) => numberify(a?.[lbprop] ?? 0) - numberify(b?.[lbprop] ?? 0));
      } else {
        TimSort.sort(accounts, (b, a) => numberify(a?.[category]?.[lbprop] ?? 0) - numberify(b?.[category]?.[lbprop] ?? 0));
      }
    } else {
      const newAcclist = [];
      const oldCopy = JSON.parse(JSON.stringify(fileCache[`${timePeriod}accounts`]));
      for(const a of oldCopy) {
        const n = fileCache.accounts.find((u) => u.uuid == a.uuid);
        if(category == null) {
          a[lbprop] = numberify(n[lbprop] - a[lbprop]);
          a.name = n.name;
          newAcclist.push(a);
        } else {
          if(a[category] != undefined) {
            a[category][lbprop] = numberify(n[category]?.[lbprop]) - numberify(a[category]?.[lbprop]);
            a.name = n.name;
            newAcclist.push(a);
          } else {
            a[category] = {};
            a[category][lbprop] = numberify(n[category]?.[lbprop]) - numberify(a[category]?.[lbprop]);
            a.name = n.name;
            newAcclist.push(a);
          }
        }
      }
      accounts = newAcclist;
      if(category == null) {
        TimSort.sort(accounts, (b, a) => numberify(a?.[lbprop] ?? 0) - numberify(b?.[lbprop] ?? 0));
      } else {
        TimSort.sort(accounts, (b, a) => numberify(a?.[category]?.[lbprop] ?? 0) - numberify(b?.[category]?.[lbprop] ?? 0));
      }
    }

    accounts = accounts.slice(0, Math.min(accounts.length, 300));

    res.write(JSON.stringify(accounts));
    res.end();
  } else {
    res.statusCode = 404;
    res.end();
  }
};
