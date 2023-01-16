const { Schema, model } = require("mongoose");

const characterSchema = new Schema({
  _id: Schema.Types.ObjectId,
  campaignId: { type: String, required: true },
  name: { type: String, required: true },
  race: String,
  nationality: String,
  background: String,
  alignment: String,
  classes: [{ class: String, level: Number }],
  stats: {
    strength: Number,
    dexterity: Number,
    constitution: Number,
    intelligence: Number,
    wisdom: Number,
    charisma: Number,
  },
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

module.exports = model("Character", characterSchema, "characters");
