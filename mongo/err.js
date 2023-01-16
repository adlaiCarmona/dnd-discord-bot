const chalk = require("chalk");

module.exports = {
  name: "err",
  execute() {
    console.log(chalk.red("[Database Status]: Error."));
  },
};
