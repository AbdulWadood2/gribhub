const mongoose = require("mongoose");
const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    accountNumber: { type: Number, default: null },
    accountName: { type: String, default: null },
    bankName: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);
const data = mongoose.model("paymentMethod", paymentMethodSchema);
module.exports = data;
