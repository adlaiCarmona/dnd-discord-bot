const chalk = require("chalk");

module.exports = {
  name: "disconnected",
  execute() {
    console.log(chalk.dim("[Database Status]: Disconnected."));
  },
};
