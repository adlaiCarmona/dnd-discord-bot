const { SlashCommandBuilder } = require("discord.js");
const Character = require("../schemas/character");
const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("npc")
    .setDescription("Manages NPC")
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
    // use same schema as character?
    return interaction.reply(":tools:  Under Construction...");
  },
};
