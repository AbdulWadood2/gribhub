// status codes
const { StatusCodes } = require("http-status-codes");
// app error
const AppError = require("../utils/appError");
// model
const chat_model = require("../Model/chat_model");
const user_model = require("../Model/user_model");
// utility functions
const { successMessage } = require("../functions/utility_functions");
// joi validator
const { messageValidationSchema } = require("../utils/joi_validator");
const {} = require("../utils/verifyToken_util");
const catchAsync = require("../utils/catchAsync");
// mongoose
const mongoose = require("mongoose");

// method POST
// route /api/v1/chat/
// @desciption create chat of any type
// privacy only user(Customer or Agent) can do this
const addChat = catchAsync(async (req, res, next) => {
  const senderId = req.user;
  req.body.senderId = senderId;
  const { error, value } = messageValidationSchema.validate(req.body);
  if (error) {
    throw new AppError(
      error.details.map((detail) => detail.message),
      StatusCodes.BAD_REQUEST
    );
  }
  const receiverIs = await user_model.findById(value.receiverId);
  if (!receiverIs) {
    throw new AppError("not receiver with this id", StatusCodes.BAD_REQUEST);
  }
  if (value.senderId == value.receiverId) {
    throw new AppError(
      "send and receive must be different",
      StatusCodes.BAD_REQUEST
    );
  }
  const newChat = await chat_model.create(value);
  return successMessage(202, res, "the chat was sent", newChat);
});
// method get
// route /api/v1/chat/
// @desciption get all chat room
// privacy only user(Customer or Agent) can do this
const getChatRoom = catchAsync(async (req, res, next) => {
  const senderId = req.user;
  const { receiverId } = req.query;

  // Validate senderId and receiverId as MongoDB ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new AppError("Invalid receiverId it must be ObjectId", 400);
  }

  // Find chat records based on senderId and receiverId, sorted by time created
  const chatRecords = await chat_model
    .find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }, // Include reverse combination as well
      ],
    })
    .sort({ createdAt: 1 });

  return successMessage(202, res, "chat room fetched", chatRecords);
});

module.exports = { addChat, getChatRoom };
