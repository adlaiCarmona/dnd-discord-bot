const { SlashCommandBuilder } = require("discord.js");
const Character = require("../schemas/character");
const Campaign = require("../schemas/campaign");
const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remember")
    .setDescription("Manages reminders")
    .addStringOption((option) =>
      option
        .setName("target")
        .setDescription("The target to manage inventory")
        // Ensure the text will fit in an embed description, if the user chooses that option
        .setMaxLength(100)
    )
    .addBooleanOption((option) =>
      option
        .setName("ephemeral")
        .setDescription("Whether or not the reply should be ephemeral")
    ),
  async execute(client, interaction) {
    // TODO: implement npc command
    // needs calendar or count days -> add this to campaign
    return interaction.reply(":tools:  Under Construction...");
  },
};
