const { SlashCommandBuilder } = require("discord.js");
const Character = require("../schemas/character");
const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("character")
    .setDescription("Manages Characters")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("crud")
        .setDescription("Create, Read, Update or Delete Characters.")
        .addStringOption((option) =>
          option
            .setName("operation")
            .setDescription("What to do...")
            .setMaxLength(100)
            .setRequired(true)
            .addChoices(
              { name: "add", value: "add" },
              { name: "remove", value: "remove" },
              { name: "info", value: "info" },
              { name: "list", value: "list" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The character to manage")
            .setMaxLength(100)
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("ephemeral")
            .setDescription("Whether or not the reply should be ephemeral")
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("Display all the Characters of current Campaign.")
    ),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;

    const name = interaction.options.getString("name");
    const operation = interaction.options.getString("operation") ?? "list";
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? true; // TODO: should default be ephemeral or not?

    console.log(
      chalk.blue(`[Discord Command] /character ${operation} ${name}`)
    );

    const campaignId = await client.bot.get(guildId).current;

    let response = ":tools:  Under Construction...";
    let character = await Character.findOne({
      name: name,
      campaignId: campaignId,
    });

    console.log(character);

    switch (operation) {
      case "add":
        if (character) {
          response =
            ":interrobang: There is already a character with that name";
        } else {
          let newCharacter = new Character({
            _id: mongoose.Types.ObjectId(),
            name: name,
            campaignId: campaignId,
          });
          console.log(newCharacter);
          newCharacter.save().catch(console.error);
          response = `:white_check_mark: Character ${name} created successfully`;
        }
        break;
      case "remove":
        if (!character) {
          response = ":interrobang:  There is no character with that name";
        } else {
          await Character.deleteOne(character);
          response = `:wastebasket: Character ${name} deleted successfully`;
        }
        break;
      case "info":
        response = character
          ? `Character:\nname:${character.name}\n`
          : ":interrobang:  That character doesn't exist in this Campaign.";
        break;
      case "list":
        let characters = await Character.find({
          campaignId: campaignId,
        });
        console.log(characters);
        response =
          characters.length == 0
            ? ":melting_face:  Currently there are no Characters in this Campaign"
            : `Characters:\n${characters
                .map((c) => `\u2022 ${c.name}`)
                .join("\n")}`;
        break;
      default:
        console.log("Error: Character operation not found");
        break;
    }

    return await interaction.reply({
      content: response,
      ephemeral: ephemeral,
    });
  },
};
