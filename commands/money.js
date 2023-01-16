const { SlashCommandBuilder } = require("discord.js");
const Character = require("../schemas/character");
const Campaign = require("../schemas/campaign");
const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("money")
    .setDescription("Manages money")
    .addSubcommand(
      (
        subcommand // TODO: refactor subcommand, peek shouldn't need more args than target
      ) =>
        subcommand
          .setName("character")
          .setDescription("Who's money to manage")
          .addStringOption((option) =>
            option
              .setName("target")
              .setDescription("The target to manage money")
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
            option.setName("cp").setDescription("Copper Pieces")
          )
          .addIntegerOption((option) =>
            option.setName("sp").setDescription("Silver Pieces")
          )
          .addIntegerOption((option) =>
            option.setName("ep").setDescription("Electrum Pieces")
          )
          .addIntegerOption((option) =>
            option.setName("gp").setDescription("Gold Pieces")
          )
          .addIntegerOption((option) =>
            option.setName("pp").setDescription("Platinum Pieces")
          )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("global") // i.e. bag of holding
        .setDescription("Manage community money")
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
          option.setName("cp").setDescription("Copper Pieces")
        )
        .addIntegerOption((option) =>
          option.setName("sp").setDescription("Silver Pieces")
        )
        .addIntegerOption((option) =>
          option.setName("ep").setDescription("Electrum Pieces")
        )
        .addIntegerOption((option) =>
          option.setName("gp").setDescription("Gold Pieces")
        )
        .addIntegerOption((option) =>
          option.setName("pp").setDescription("Platinum Pieces")
        )
    ),
  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const target = interaction.options.getString("target") ?? "global"; // TODO: should be global or 'bag-of-holding' || 'bagOholding' (ie bag of holding)
    const operation = interaction.options.getString("operation");
    const cp = interaction.options.getInteger("cp") ?? 0;
    const sp = interaction.options.getInteger("sp") ?? 0;
    const ep = interaction.options.getInteger("ep") ?? 0;
    const gp = interaction.options.getInteger("gp") ?? 0;
    const pp = interaction.options.getInteger("pp") ?? 0;
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? true; // TODO: should default be ephemeral or not?

    console.log(
      chalk.blue(
        `[Discord Command] /money ${subcommand} ${target} ${operation} ${cp} ${sp} ${ep} ${gp} ${pp} ${ephemeral}`
      )
    );

    let response = ":tools:  Under Construction...";

    const campaignId = await client.bot.get(guildId)?.current;

    if (!campaignId) {
      return await interaction.reply({
        content:
          "No selected campaign... Try setting one with the command:\n/campaign set <name of campaign> <dm of campaign>",
        ephemeral: true,
      });
    }

    //TODO: refactor this; this is duplicated from inventory.js => can be put in another file and imported?
    let character;
    let money;
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
          ephemeral: true,
        });
      }
      console.log(
        chalk.bgMagenta(`Debug: character = ${JSON.stringify(character)}`)
      );
      money = character.money;
    } else {
      const fetchedCampaign = await Campaign.findById(campaignId);
      money = fetchedCampaign.money;
      console.log(
        chalk.bgMagenta(`Debug: campaign = ${JSON.stringify(fetchedCampaign)}`)
      );
    }
    console.log(chalk.bgMagenta(`Debug: money = ${JSON.stringify(money)}`));

    if (!money) {
      console.log(chalk.bgRedBright("CHECK: money is null"));
      return await interaction.reply({
        content: ":interrobang: Invalid character",
        ephemeral: ephemeral,
      });
    }

    switch (operation) {
      case "add":
        // Incrementing existing item in target's money
        money.cp += cp;
        money.sp += sp;
        money.ep += ep;
        money.gp += gp;
        money.pp += pp;

        if (subcommand == "global") {
          await Campaign.findByIdAndUpdate(campaignId, {
            money: money,
          });
        } else {
          await Character.findByIdAndUpdate(character._id, {
            money: money,
          });
          console.log(`new money: ${JSON.stringify(money)}`);
        }
        response = `:white_check_mark: Money added successfully`;
        break;
      case "remove":
        // TODO: refactor money calculation; add logic to convert coins
        if (
          cp > money.cp ||
          sp > money.sp ||
          ep > money.ep ||
          gp > money.gp ||
          pp > money.pp
        ) {
          response = `:interrobang: Target doesn't have enough **money** to remove`;
          break;
        }
        // Decrementing existing item in target's money
        money.cp -= cp;
        money.sp -= sp;
        money.ep -= ep;
        money.gp -= gp;
        money.pp -= pp;

        if (subcommand == "global") {
          await Campaign.findByIdAndUpdate(campaignId, {
            money: money,
          });
        } else {
          await Character.findByIdAndUpdate(character._id, {
            money: money,
          });
          console.log(`new money: ${JSON.stringify(money)}`);
        }
        response = `:wastebasket: Removed ${Object.keys(money)
          .map((key) => `${key}: ${money[key]}`)
          .join(", ")} to ${target}'s money successfully`;
        break;
      case "peek":
        response = `${target}'s Money:\n${Object.keys(money)
          .map((key) => `\u2022 ${key}: ${money[key]}`)
          .join("\n")}`;

        break;
      case "transfer":
        console.log(
          "TODO: make another command for transfering items or money"
        );
        break;
      default:
        console.log("Error: Money operation not found");
        break;
    }

    return await interaction.reply({
      content: response,
      ephemeral: ephemeral,
    });
  },
};
