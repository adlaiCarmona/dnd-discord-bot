const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  // Added client to parameters to use cache in commands
  async execute(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    // It is identified as a command of this bot but there is no such command. Try running deploy-commands.js
    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.\nProbable cause is changed name of command and didn't re-deploy commands.`
      );
      await interaction.reply({
        content: ":ghost:  There is no such command in this server!",
        ephemeral: true,
      });
      return;
    }

    try {
      // Pass client for cache use
      await command.execute(client, interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
