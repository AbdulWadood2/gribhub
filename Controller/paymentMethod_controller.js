// status codes
const { StatusCodes } = require("http-status-codes");
// app error
const AppError = require("../utils/appError");
// error handler
const catchAsync = require("../utils/catchAsync");
// utility functions
const { successMessage } = require("../functions/utility_functions");
// model
const paymentMethod_model = require("../Model/paymentMethod_model");
const { paymentMethodSchema } = require("../utils/joi_validator");
// method POST
// route /api/v1/paymentMethod
// @desciption update or create the payment Method
// privacy only only user(customer or agent) can do this
const addOrEditPaymentMethod = catchAsync(async (req, res, next) => {
  const { error, value } = paymentMethodSchema.validate(req.body);
  if (error) {
    throw new AppError(error.message, StatusCodes.BAD_REQUEST);
  }
  const paymentMethodCreated = await paymentMethod_model.findOneAndUpdate(
    { userId: req.user },
    {
      ...value,
    },
    {
      new: true,
    }
  );
  if (!paymentMethodCreated) {
    const newPaymentMethod = await paymentMethod_model.create({
      userId: req.user,
      ...value,
    });
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "payment created successfully",
      newPaymentMethod
    );
  }
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "payment updated successfully",
    paymentMethodCreated
  );
});
// method GET
// route /api/v1/paymentMethod
// @desciption get payment method payment Method
// privacy only only user(customer or agent) can do this
const getPaymentMethodForUserOnly = catchAsync(async (req, res, next) => {
  const myPaymentMethod = await paymentMethod_model.findOne({
    userId: req.user,
  });
  if (!myPaymentMethod) {
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "payment Method not added",
      myPaymentMethod
    );
  }
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "payment Method get successfully",
    myPaymentMethod
  );
});

module.exports = { addOrEditPaymentMethod, getPaymentMethodForUserOnly };
