const { SlashCommandBuilder } = require("discord.js");
const Campaign = require("../schemas/campaign");
const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("campaign")
    .setDescription("Manages Campaigns")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("crud")
        .setDescription("Create, Read, Update or Delete Campaigns.")
        .addStringOption((option) =>
          option
            .setName("operation")
            .setDescription("What to do...")
            .setRequired(true)
            .addChoices(
              { name: "add", value: "add" },
              { name: "remove", value: "remove" },
              { name: "info", value: "info" },
              { name: "set", value: "set" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The campaign to manage")
            .setMaxLength(100)
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("dm")
            .setDescription("The dm of the campaign")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("The character to manage")
            .setMaxLength(250)
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
        .setDescription("Display all campaigns in this Server.")
        .addBooleanOption((option) =>
          option
            .setName("ephemeral")
            .setDescription("Whether or not the reply should be ephemeral")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("current")
        .setDescription("Display the campaigns in this Server.")
        .addBooleanOption((option) =>
          option
            .setName("ephemeral")
            .setDescription("Whether or not the reply should be ephemeral")
        )
    ),
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    const name = interaction.options.getString("name") ?? "";
    const description = interaction.options.getString("description") ?? "";
    const operation = interaction.options.getString("operation") ?? ""; // TODO: this is a patch since i added a subCommand and the other subcommand doesnt get operation
    const dm = interaction.options.getUser("dm") ?? "";
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? true; // TODO: should default be ephemeral or not?

    console.log(
      chalk.blue(
        `[Discord Command] /campaign ${subcommand} ${operation} ${name}`
      )
    );

    console.log(`guild id = ${guildId}`);

    // not in cache
    if (!(await client.bot.has(guildId)))
      await client.bot.set(guildId, {
        current: null,
      });
    const cached = await client.bot.get(guildId);
    console.log(`cached = ${JSON.stringify(cached)}`);

    let response = ":tools:  Under Construction...";
    const searchFor =
      subcommand == "current"
        ? { _id: cached.current ?? mongoose.Types.ObjectId(0) }
        : { name: name, guildId: guildId };
    let campaign = await Campaign.findOne(searchFor);
    console.log(`DEBUG: searching for: ${JSON.stringify(searchFor)}`);
    console.log(`DEBUG: campaign found: ${JSON.stringify(campaign)}`);

    switch (operation) {
      case "add":
        if (campaign) {
          response = ":interrobang: There is already a campaign with that name";
        } else {
          newCampaign = new Campaign({
            _id: mongoose.Types.ObjectId(),
            guildId: guildId,
            name: name,
            description: description,
            dm: dm,
          });
          console.log(newCampaign);
          newCampaign.save().catch(console.error);
          response = `:white_check_mark: Campaign ${name} created successfully`;
        }
        break;
      case "remove":
        if (!campaign) {
          response = `:interrobang:  There is no campaign with the name: ${name}`;
        } else {
          if (campaign._id == cached.current)
            await client.bot.set(guildId, { current: null });
          await Campaign.deleteOne(campaign);
          response = `:wastebasket: Campaign ${name} deleted successfully`;
        }
        break;
      case "info":
        if (!campaign) {
          response = `:interrobang:  There is no campaign with the name: ${name}`;
        } else {
          response = `Campaign:\nname:${campaign.name}\n`;
        }
        break;
      case "set":
        if (!campaign) {
          response = `:interrobang:  There is no campaign with the name: ${name}`;
        } else {
          await client.bot.set(guildId, { current: campaign._id });
          console.log(
            chalk.yellow(`New current in guild ${guildId} => ${campaign._id}`)
          );

          response = `Campaign set successfully`;
        }
        break;
      default:
        if (subcommand === "list") {
          let campaigns = await Campaign.find({
            guildId: guildId,
          });
          console.log(campaigns);
          response =
            campaigns.length == 0
              ? ":melting_face:  Currently there are no Campaigns in this Server"
              : `Campaigns:\n${campaigns
                  .map((c) => `\u2022 ${c.name}`)
                  .join("\n")}`;
        } else if (subcommand === "current") {
          response = campaign
            ? `Current Campaign is: **${campaign.name}**`
            : "No Campaign is Set in the Server";
        } else console.log(chalk.bgRed("Error: Campaign operation not found"));
        break;
    }

    return await interaction.reply({
      content: response,
      ephemeral: ephemeral,
    });
  },
};
