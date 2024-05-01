const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    email: { type: String, required: true },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
const data = mongoose.model("supportMessage", adminSchema);
module.exports = data;
