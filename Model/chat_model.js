const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "audio", "video", "document"],
      required: true,
    },
    messageContent: { type: String, required: true }, // For text messages
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("chat", messageSchema);

module.exports = Message;
