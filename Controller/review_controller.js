// status codes
const { StatusCodes } = require("http-status-codes");
// app error
const AppError = require("../utils/appError");
// model
const review_model = require("../Model/review_model");
const property_model = require("../Model/property_model");
// password encryption
const CryptoJS = require("crypto-js");
// utility functions
const {
  successMessage,
  userPasswordCheck,
  generateRandomNumber,
} = require("../functions/utility_functions");
// catch async
const catchAsync = require("../utils/catchAsync");
const {
  generateAccessTokenRefreshToken,
} = require("../utils/verifyToken_util");

// method POST
// route /api/v1/review/
// @desciption add review
// privacy only user(customer or agent) can do this
const addReview = catchAsync(async (req, res, next) => {
  const { propertyId, comment, rating } = req.body;
  const property = await property_model.findById(propertyId);
  if (!property) {
    throw new AppError("property not found", 400);
  }
  console.log(req.user);
  const newReview = await review_model.create({
    userId: req.user,
    propertyId,
    comment,
    rating,
  });
  return successMessage(202, res, "review added successfully", newReview);
});

module.exports = { addReview };
