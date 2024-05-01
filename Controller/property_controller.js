const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/appError");
const { successMessage } = require("../functions/utility_functions");
const { propertySchema } = require("../utils/joi_validator");
const catchAsync = require("../utils/catchAsync");
// model
const Property = require("../Model/property_model");
const favouriteProperty_model = require("../Model/favouriteProperty_model");
const user_model = require("../Model/user_model");
// method POST
// route /api/v1/property/
// @desciption the register request verified here with otp
// privacy only user(customer or agent) can do this
const addProperty = catchAsync(async (req, res, next) => {
  const { error, value } = propertySchema.validate(req.body);
  if (error) {
    throw new AppError(
      error.details.map((detail) => detail.message),
      400
    );
  }
  const property = await Property.create({ userId: req.user, ...value });
  successMessage(
    StatusCodes.CREATED,
    res,
    "Property created successfully",
    property
  );
});

// method PUT
// route /api/v1/property/
// @desciption update property
// privacy only owner user(customer or agent) can do this
const updateProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findOneAndUpdate(
    {
      _id: req.query.id,
      userId: req.user,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!property) {
    throw new AppError("Property not found", StatusCodes.NOT_FOUND);
  }
  successMessage(
    StatusCodes.ACCEPTED,
    res,
    "Property updated successfully",
    property
  );
});

// method DELETE
// route /api/v1/property/
// @desciption delete property
// privacy only owner user(customer or agent) can do this
const deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findByIdAndDelete({
    _id: req.query.id,
    userId: req.user,
  });
  if (!property) {
    throw new AppError("Property not found", StatusCodes.NOT_FOUND);
  }
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "Property deleted successfully"
  );
});

// method DELETE
// route /api/v1/property/addOrRemoveFavourite
// @desciption add Or Remove property from favourite
// privacy only owner user(customer or agent) can do this
const addOrRemoveFavourite = catchAsync(async (req, res, next) => {
  const { propertyId } = req.query;
  if (!propertyId) {
    throw new AppError(
      "propertyId is required in query",
      StatusCodes.BAD_REQUEST
    );
  }
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(
      "not propery with this propertyId",
      StatusCodes.BAD_REQUEST
    );
  }
  const favouriteProperty = await favouriteProperty_model.findOne({
    userId: req.user,
    propertyId,
  });
  if (favouriteProperty) {
    await favouriteProperty_model.findByIdAndDelete(favouriteProperty._id);
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "removed from favourite",
      null
    );
  } else {
    await favouriteProperty_model.create({
      propertyId: propertyId,
      userId: req.user,
    });
    return successMessage(StatusCodes.ACCEPTED, res, "Add in favourites", null);
  }
});

// method GET
// route /api/v1/property/nearest
// @desciption get nearest properties
// privacy only owner user(customer or agent) can do this

// Function to extract latitude and longitude from location object
const extractCoordinates = (location) => {
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    throw new AppError("Invalid location object", StatusCodes.BAD_REQUEST);
  }
  const [lon, lat] = location.coordinates;
  return { lat, lon };
};

// Function to find properties nearest to user's location
const findNearestProperties = async (req, lat, lon) => {
  try {
    const nearestProperties = await Property.find({
      location: {
        $near: {
          $maxDistance: 10000000000, // Set to Earth's circumference in meters (approximately)
          $geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
        },
      },
      userId: { $ne: req.user }, // Exclude records where userId is equal to req.user
    });

    return nearestProperties;
  } catch (error) {
    console.log(error.message);
    throw new AppError(
      "Error finding nearest properties",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// Controller function to get nearest properties
const getNearestProperties = catchAsync(async (req, res, next) => {
  const user = await user_model.findById(req.user); // Assuming you have a User model
  if (!user || !user.location) {
    throw new AppError(
      "User or user location not found",
      StatusCodes.NOT_FOUND
    );
  }
  const { lat, lon } = extractCoordinates(user.location);
  const nearestProperties = await findNearestProperties(req, lat, lon);

  return successMessage(
    StatusCodes.OK,
    res,
    "Nearest properties retrieved successfully",
    nearestProperties
  );
});

module.exports = {
  addProperty,
  updateProperty,
  deleteProperty,
  addOrRemoveFavourite,
  getNearestProperties,
};
