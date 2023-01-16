const { Schema, model } = require("mongoose");

const campaignSchema = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  dm: String,
  inventory: [
    {
      itemId: String,
      name: String,
      description: String,
      amount: Number,
      weight: { type: Number, default: 0 },
    },
  ],
  money: {
    cp: { type: Number, default: 0 },
    sp: { type: Number, default: 0 },
    ep: { type: Number, default: 0 },
    gp: { type: Number, default: 0 },
    pp: { type: Number, default: 0 },
  },
});

module.exports = model("Campaign", campaignSchema, "campaigns");
