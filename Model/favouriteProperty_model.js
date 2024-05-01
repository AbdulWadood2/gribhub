const mongoose = require("mongoose");
const favouritePropertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const data = mongoose.model("favouriteProperty", favouritePropertySchema);
module.exports = data;
