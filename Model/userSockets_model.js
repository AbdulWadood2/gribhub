const mongoose = require("mongoose");
const userSockets = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    socketId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const data = mongoose.model("userSocket", userSockets);
module.exports = data;
