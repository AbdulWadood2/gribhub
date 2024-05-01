const termConditions_model = require("../Model/termConditions_model");
const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const { successMessage } = require("../functions/utility_functions");

// method POST
// route /api/v1/termCondition
// @desciption this api is both create and update the termConditions
// privacy only admin can do this
const createOrUpdate = catchAsync(async (req, res, next) => {
  const { terms, useAndlicense } = req.body;

  // Check if term condition already exists
  let termCondition = await termConditions_model.findOne();

  // If term condition does not exist, create a new one
  if (!termCondition) {
    termCondition = new termConditions_model({
      terms,
      useAndlicense,
    });
  } else {
    // If term condition exists, update it
    termCondition.terms = terms;
    termCondition.useAndlicense = useAndlicense;
  }

  // Save the term condition
  await termCondition.save();

  // Use successMessage utility function to send success response
  successMessage(
    StatusCodes.CREATED,
    res,
    "Term condition created/updated successfully",
    termCondition
  );
});

// method GET
// route /api/v1/termCondition
// @desciption for get the termConditions
// privacy all roles can do this but with token
const getTermCondition = catchAsync(async (req, res, next) => {
  const termCondition = await termConditions_model.findOne();
  return successMessage(202, res, null, termCondition);
});

module.exports = {
  createOrUpdate,
  getTermCondition,
};
