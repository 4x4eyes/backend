const seed = require("./seed.js");
const db = require("../connection.js");
const data = require("../data/dev-data");

const runSeed = () => {
  return seed(data).then(() => db.end());
};

runSeed();
