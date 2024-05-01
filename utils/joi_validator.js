const Joi = require("joi");

// user signUp
const userSchemaValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }),
});
// user update
const userUpdateSchema = Joi.object({
  name: Joi.string(),
  password: Joi.string(),
  phoneNumber: Joi.number().integer(),
  profileImage: Joi.string().allow(null),
  dateOfBirth: Joi.string(),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }),
  socialMediaLinks: Joi.object({
    x: Joi.string().allow(null).default(null),
    instagram: Joi.string().allow(null).default(null),
    facebook: Joi.string().allow(null).default(null),
    threads: Joi.string().allow(null).default(null),
  }).default(null),
  address: Joi.string().allow(null),
  gender: Joi.string().allow(null),
  preferableId: Joi.string().allow(null),
  nextOfKinName: Joi.string().allow(null),
  nextOfKinAddress: Joi.string().allow(null),
  nextOfKinPhoneNumber: Joi.string().allow(null),
  occupation: Joi.string().allow(null),
  companyName: Joi.string().allow(null),
  companyAddress: Joi.string().allow(null),
  supervisorOrManagerName: Joi.string().allow(null),
  supervisorOrManagerPhoneNumber: Joi.string().allow(null),
  proofOfOwnerShipDoc: Joi.array().items(Joi.string()),
  propertyPictures: Joi.array().items(Joi.string()),
});
// payment method
const paymentMethodSchema = Joi.object({
  accountNumber: Joi.number().allow(null).default(null),
  accountName: Joi.string().allow(null).default(null),
  bankName: Joi.string().allow(null).default(null),
});
// support message schema
const supportMessageSchema = Joi.object({
  email: Joi.string().email().required(),
  message: Joi.string().required(),
});
// Property Schema
const propertySchema = Joi.object({
  propertyTitle: Joi.string().required(),
  propertyCategory: Joi.string().required(),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
  photosVideos: Joi.array().items(Joi.string()).required(),
  rentPrice: Joi.object({
    amount: Joi.number().required(),
    currency: Joi.string().valid("$", "£", "₦", "₹").required(),
    category: Joi.string().valid("Monthly", "Annually").required(),
  }).required(),
  propertyFeatures: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        quantities: Joi.number().required(),
      })
    )
    .required(),
  environment_facilities: Joi.array().items(Joi.string()).required(),
});
// Joi validation schema for editing settings
const settingsUpdateSchema = Joi.object({
  notificationSettings: Joi.object({
    emailNotification: Joi.boolean().default(false),
    reminder: Joi.boolean().default(false),
    listing: Joi.boolean().default(false),
    doNotDistrub: Joi.boolean().default(false),
    notificationLockScreen: Joi.boolean().default(false),
    statusbarNotification: Joi.boolean().default(false),
  }).default({}),
  privacyAndSecurity: Joi.object({
    securityLock: Joi.boolean().default(false),
    faceIdOrFingerPrint: Joi.boolean().default(false),
    darkMode: Joi.boolean().default(false),
  }).default({}),
});

// Define Joi schema for message validation
const messageValidationSchema = Joi.object({
  senderId: Joi.string().required(),
  receiverId: Joi.string().required(),
  messageType: Joi.string()
    .valid("text", "audio", "video", "document")
    .required(),
  messageContent: Joi.string().required(),
});

module.exports = {
  userSchemaValidation,
  userUpdateSchema,
  paymentMethodSchema,
  supportMessageSchema,
  propertySchema,
  settingsUpdateSchema,
  messageValidationSchema,
};
