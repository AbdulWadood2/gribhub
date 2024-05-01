// status codes
const { StatusCodes } = require("http-status-codes");
// app error
const AppError = require("../utils/appError");
// model
const supportMessage_model = require("../Model/supportMessage_model");
// utility functions
const { successMessage } = require("../functions/utility_functions");
// joi validator
const { supportMessageSchema } = require("../utils/joi_validator");
const catchAsync = require("../utils/catchAsync");
const { AdminReply } = require("../utils/emails");
// method POST
// route /api/v1/support/supportMessage
// @desciption the register request verified here with otp
// privacy only user(customer or agent) can do this
const sendSupportMessage = catchAsync(async (req, res, next) => {
  const { error, value } = supportMessageSchema.validate(req.body);
  if (error) {
    throw new AppError(
      error.details.map((detail) => detail.message),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
  const supportMessageSend = await supportMessage_model.create({
    userId: req.user,
    ...value,
  });
  await successMessage(
    StatusCodes.ACCEPTED,
    res,
    "support message sent",
    supportMessageSend
  );
});

// method PUT
// route /api/v1/support/supportMessage
// @desciption edit the support message into resolved
// privacy only admin can do this
const resolveIssue = catchAsync(async (req, res, next) => {
  const { _id } = req.query;
  const message = await supportMessage_model.findById(_id);
  if (!message) {
    throw new AppError("message not found", StatusCodes.BAD_REQUEST);
  }
  if (message.resolved) {
    throw new AppError("it is already resolved", StatusCodes.BAD_REQUEST);
  }
  message.resolved = true;
  await message.save();
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "issue resolved successfully",
    message
  );
});

// method GET
// route /api/v1/support/supportMessage
// @desciption  get required support messages
// privacy only admin can do this
const getSupportUserMessagesFlexible = catchAsync(async (req, res, next) => {
  const { resolved, page = 1, limit } = req.query;
  let query = { resolved };

  let totalMessages;
  if (limit) {
    const skip = (page - 1) * limit;
    query = supportMessage_model.find(query).skip(skip).limit(limit);
    totalMessages = await supportMessage_model.countDocuments(query);
  } else {
    query = supportMessage_model.find(query);
    totalMessages = await supportMessage_model.countDocuments(query);
  }

  const messages = await query;

  const totalPages = limit ? Math.ceil(totalMessages / limit) : 1;

  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    limit
      ? `Page ${page} of ${totalPages} ${
          resolved ? "" : "un"
        }resolved support messages`
      : `All ${resolved ? "" : "un"}resolved support messages`,
    {
      messages,
      currentPage: limit ? page : 1,
      totalPages: limit ? totalPages : 1,
      totalMessages,
    }
  );
});
// method POST
// route /api/v1/support/sendReplyAdmin
// @desciption  reply sent to user(customer or agent) by admin
// privacy only admin can do this
const replySupport = catchAsync(async (req, res, next) => {
  const { email, message } = req.body;
  await new AdminReply(email, message).sendMessage();
  return successMessage(StatusCodes.ACCEPTED, res, "reply sent to email", null);
});

module.exports = {
  sendSupportMessage,
  resolveIssue,
  getSupportUserMessagesFlexible,
  replySupport,
};
