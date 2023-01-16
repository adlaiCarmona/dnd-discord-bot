const { SlashCommandBuilder } = require("discord.js");
const Character = require("../schemas/character");
const Campaign = require("../schemas/campaign");
const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Manage current inventory")
    .addSubcommand(
      (
        subcommand // TODO: refactor subcommand, peek shouldn't need more args than target
      ) =>
        subcommand
          .setName("character")
          .setDescription("Who's inventory to manage")
          .addStringOption((option) =>
            option
              .setName("target")
              .setDescription("The target to manage inventory")
              .setMaxLength(100)
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("operation")
              .setDescription("What to do")
              .setMaxLength(100)
              .setRequired(true)
              .addChoices(
                { name: "add", value: "add" },
                { name: "remove", value: "remove" },
                { name: "peek", value: "peek" }
              )
          )
          .addIntegerOption((option) =>
            option
              .setName("amount")
              .setDescription("The number of items")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("item")
              .setDescription("The item to operate in inventory")
              .setMaxLength(100)
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("description")
              .setDescription("The item of the item")
              .setMaxLength(250)
          )
          .addIntegerOption((option) =>
            option
              .setName("weight")
              .setDescription("The weight of a singular item")
          )
          .addBooleanOption((option) =>
            option
              .setName("ephemeral")
              .setDescription("Whether or not the reply should be ephemeral")
          )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("global") // i.e. bag of holding
        .setDescription("Manage community inventory")
        .addStringOption((option) =>
          option
            .setName("operation")
            .setDescription("What to do")
            .setMaxLength(100)
            .setRequired(true)
            .addChoices(
              { name: "add", value: "add" },
              { name: "remove", value: "remove" },
              { name: "peek", value: "peek" }
            )
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The number of items")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The item to operate in inventory")
            .setMaxLength(100)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("The item of the item")
            .setMaxLength(250)
        )
        .addIntegerOption((option) =>
          option
            .setName("weight")
            .setDescription("The weight of a singular item")
        )
        .addBooleanOption((option) =>
          option
            .setName("ephemeral")
            .setDescription("Whether or not the reply should be ephemeral")
        )
    ),
  async execute(client, interaction) {
    // TODO: delete all Debug console logs
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getString("target") ?? "global";
    const operation = interaction.options.getString("operation");
    const amount = interaction.options.getInteger("amount");
    const item = interaction.options.getString("item");
    const description =
      interaction.options.getString("description") ?? "No description";
    const weight = interaction.options.getInteger("weight") ?? 0;
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? true;
    const guildId = interaction.guild.id;

    console.log(
      chalk.blue(
        `[Discord Command] /inventory ${subcommand} ${target} ${operation} ${amount} ${item} ${description} ${weight} ${ephemeral}`
      )
    );

    let response = ":tools:  Under Construction...";

    const campaign = await client.bot.get(guildId);
    const campaignId = campaign?.current;

    if (!campaignId) {
      return await interaction.reply({
        content:
          "No selected campaign... Try setting one with the command:\n/campaign set <name of campaign> <dm of campaign>",
        ephemeral: true,
      });
    }

    let character;
    let inventory;
    if (subcommand == "character") {
      character = await Character.findOne({
        name: target,
        campaignId: campaignId,
      });
      if (!character) {
        console.log(
          chalk.bgRedBright("CHECK: character.findOne returned null")
        );
        return await interaction.reply({
          content: ":interrobang: Invalid character",
          ephemeral: ephemeral,
        });
      }
      console.log(
        chalk.bgMagenta(`Debug: character = ${JSON.stringify(character)}`)
      );
      inventory = character.inventory;
    } else {
      const fetchedCampaign = await Campaign.findById(campaignId);
      inventory = fetchedCampaign.inventory;
      console.log(
        chalk.bgMagenta(`Debug: campaign = ${JSON.stringify(fetchedCampaign)}`)
      );
    }
    console.log(
      chalk.bgMagenta(`Debug: inventory = ${JSON.stringify(inventory)}`)
    );

    if (!inventory) {
      console.log(chalk.bgRedBright("CHECK: inventory is null"));
      return await interaction.reply({
        content: ":interrobang: Invalid character",
        ephemeral: ephemeral,
      });
    }

    switch (operation) {
      case "add":
        index = inventory.findIndex((i) => i.name == item); // TODO: search by item id

        if (index == -1) {
          // New item in target's inventory
          inventory.push({
            name: item,
            description: description,
            amount: amount,
            weight: weight,
          });
        } else {
          // Incrementing existing item in target's inventory
          inventory[index].amount += amount;
        }
        if (subcommand == "global") {
          await Campaign.findByIdAndUpdate(campaignId, {
            inventory: inventory,
          });
        } else {
          await Character.findByIdAndUpdate(character._id, {
            inventory: inventory,
          });
          console.log(`new inventory: ${JSON.stringify(inventory)}`);
        }
        response = `:white_check_mark: Item ${item} added successfully`;
        break;
      case "remove":
        index = inventory.findIndex((i) => i.name == item); // TODO: search by item id

        console.log(
          chalk.bgCyanBright(`Debug: index of item in inventory: ${index}`)
        );

        if (index == -1) {
          response = `:interrobang: Target doesn't have in invetory item **${item}**`;
          break;
        }
        if (amount > inventory[index].amount) {
          response = `:interrobang: Target doesn't have enough **${item}** to remove`;
          break;
        }
        // Decrementing existing item in target's inventory
        inventory[index].amount -= amount;

        if (subcommand == "global") {
          await Campaign.findByIdAndUpdate(campaignId, {
            inventory: inventory,
          });
        } else {
          await Character.findByIdAndUpdate(character._id, {
            inventory: inventory,
          });
          console.log(`new inventory: ${JSON.stringify(inventory)}`);
        }
        response = `:wastebasket: Removed ${amount} ${item} to ${target}'s inventory successfully`;
        break;
      case "peek":
        response =
          inventory.length == 0
            ? `${target}'s Inventory is empty`
            : `${target}'s Inventory:\n${inventory
                .map(
                  (i) =>
                    `\u2022 ${i.amount} ${i.name}: ${i.description} | ${i.weight} lbs`
                )
                .join("\n")}`;

        break;
      case "transfer":
        console.log(
          "TODO: make another command for transfering items or money"
        );
        break;
      default:
        console.log("Error: Inventory operation not found");
        break;
    }

    return await interaction.reply({
      content: response,
      ephemeral: ephemeral,
    });
  },
};
