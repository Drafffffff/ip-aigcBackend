const fs = require("fs");
function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

module.exports = {
  readJsonFile,
};
