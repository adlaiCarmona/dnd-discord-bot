const { Events } = require("discord.js");

module.exports = {
  name: Events.GuildCreate,
  once: true,
  async execute(client, guild) {
    console.log(`Bot joined new guild...\nSetting cache for new guild`);

    // TODO: Test this works correctly - cache erases when reseting
    await client.bot.set(guild.id, {
      current: null,
    });
  },
};
