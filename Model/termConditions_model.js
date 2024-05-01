const mongoose = require("mongoose");
const termConditiosSchema = new mongoose.Schema(
  {
    terms: { type: String, default: null },
    useAndlicense: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);
const data = mongoose.model("termConditions", termConditiosSchema);
module.exports = data;
