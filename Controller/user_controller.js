// status codes
const { StatusCodes } = require("http-status-codes");
// app error
const AppError = require("../utils/appError");
// for password encrypt decrypt
const CryptoJS = require("crypto-js");
// model
const user_model = require("../Model/user_model");
const settings_model = require("../Model/settings_model");
// utility functions
const {
  successMessage,
  generateRandomNumber,
  sendVerificationEmail,
  generateEncryptedOtp,
  validateOtpMatch,
  validateOtpExpiration,
  decryptAndValidateOtp,
  userPasswordCheck,
  setCookie,
} = require("../functions/utility_functions");
// joi validator
const {
  userSchemaValidation,
  userUpdateSchema,
  settingsUpdateSchema,
} = require("../utils/joi_validator");
const {
  generateAccessTokenRefreshToken,
} = require("../utils/verifyToken_util");
const catchAsync = require("../utils/catchAsync");
const { Email } = require("../utils/emails");
// method POST
// route /api/v1/user/register
// @desciption the register request create here with otp
// privacy only only user(customer or agent) can do this
const register = catchAsync(async (req, res, next) => {
  const { error, value } = userSchemaValidation.validate(req.body);
  if (error) {
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  let createdUser;
  const userExist = await user_model.findOne({ email: value.email });
  if (userExist && userExist.verified) {
    throw new AppError("this account already exists", 400);
  }
  const sixDigitNumber = generateRandomNumber(4);
  const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes expiration
  let encryptPassword = CryptoJS.AES.encrypt(
    value.password,
    process.env.CRYPTO_SEC
  ).toString();
  value.password = encryptPassword;
  // if location is not present we will make it null this will help us when we find levels for user(agent or customer)
  if (!value.location) {
    value.location = null;
  }
  if (!userExist) {
    createdUser = await user_model.create(value);
  } else if (userExist.verified) {
    throw new AppError("You are already registered", StatusCodes.BAD_REQUEST);
  } else {
    createdUser = await user_model.findByIdAndUpdate(userExist._id, value);
  }

  await sendVerificationEmail(value.email, sixDigitNumber);

  const encryptedOtp = generateEncryptedOtp(
    sixDigitNumber,
    expirationTime,
    value.email
  );

  successMessage(StatusCodes.ACCEPTED, res, null, { encryptedOtp });
});
// method POST
// route /api/v1/user/verifyUser
// @desciption the register request verified here with otp
// privacy only only user(customer or agent) can do this
const verifyUser = catchAsync(async (req, res, next) => {
  const { encryptedOtp, otp } = req.body;
  validateRequestParams(encryptedOtp, otp);

  const {
    otp: otpFromEncryptData,
    expirationTime,
    email,
  } = decryptAndValidateOtp(encryptedOtp);
  const user = await user_model.findOne({ email }).select("-password");
  validateUser(user);

  validateOtpMatch(otpFromEncryptData, otp);

  validateOtpExpiration(expirationTime);

  await updateUserVerificationStatus(user);
  const { refreshToken, accessToken } = generateAccessTokenRefreshToken(
    user.id
  );
  user.refreshToken.push(refreshToken);
  await user.save();
  await setCookie(accessToken, refreshToken, res);
  let { refreshToken: refresh, ...rest } = JSON.parse(JSON.stringify(user));
  // create setting model with null values
  await settings_model.create({ userId: rest._id });
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "Account verified successfully",
    rest
  );
});
const validateRequestParams = (encryptedOtp, otp) => {
  if (!encryptedOtp || !otp) {
    throw new AppError(
      "Both encryptedOtp and otp are required in req.body",
      StatusCodes.BAD_REQUEST
    );
  }
};
const validateUser = (user) => {
  if (!user) {
    throw new AppError("User not found for this otp", StatusCodes.BAD_REQUEST);
  }
  if (user.verified) {
    throw new AppError("User is already verified", StatusCodes.BAD_REQUEST);
  }
};
const updateUserVerificationStatus = async (user) => {
  user.verified = true;
  await user.save();
};
// method POST
// route /api/v1/user/login
// @desciption login the user(customer or agent)
// privacy only only user(customer or agent) can do this
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await user_model.findOne({ email });
  checksForUserValidation(user);
  userPasswordCheck(user, password);
  const {
    password: pass,
    refreshToken: refresh,
    ...filteredUserFields
  } = JSON.parse(JSON.stringify(user));
  const { refreshToken, accessToken } = generateAccessTokenRefreshToken(
    user.id
  );
  user.refreshToken.push(refreshToken);
  await user.save();
  await setCookie(accessToken, refreshToken, res);
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "login success",
    filteredUserFields
  );
});
const checksForUserValidation = (user) => {
  if (!user) {
    throw new AppError("you are not signup", StatusCodes.BAD_REQUEST);
  }
  if (!user.active) {
    throw new AppError("you are blocked by admin", StatusCodes.BAD_REQUEST);
  }
  if (!user.verified) {
    throw new AppError("you are not signup", StatusCodes.BAD_REQUEST);
  }
};

// method PUT
// route /api/v1/user/updateUser
// @desciption update the user(customer or agent) profile
// privacy only only user(customer or agent) can do this
const updateProfile = catchAsync(async (req, res) => {
  const id = req.user;
  const { error, value } = userUpdateSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw new AppError(
      error.details.map((detail) => detail.message),
      StatusCodes.BAD_REQUEST
    );
  }
  if (value.password) {
    value.password = CryptoJS.AES.encrypt(
      value.password,
      process.env.CRYPTO_SEC
    ).toString();
  }
  const updatedUser = await user_model
    .findByIdAndUpdate(
      id,
      { ...value },
      {
        new: true,
      }
    )
    .select("-refreshToken -password");

  if (!updatedUser) {
    throw new AppError("user not found", StatusCodes.BAD_REQUEST);
  }
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "user updated successfully",
    updatedUser
  );
});

// method POST
// route /api/v1/user/logout
// @desciption logout user
// privacy only only user(customer or agent) can do this
const logoutUser = catchAsync(async (req, res) => {
  let refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new AppError("you are not login", StatusCodes.BAD_REQUEST));
  }
  const buyer = await user_model.findOne({ refreshToken });
  if (!buyer) {
    return next(new AppError("you are not login", StatusCodes.BAD_REQUEST));
  }

  await user_model.updateOne(
    { refreshToken: refreshToken },
    { $pull: { refreshToken: refreshToken } }
  );

  // Clear both refreshToken and accessToken cookies
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return successMessage(StatusCodes.ACCEPTED, res, "logout successfully", null);
});

// method POST
// route /api/v1/user/sendForgetOtp
// @desciption send otp to email
// privacy only only user(customer or agent) can do this
const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  const user = await user_model.findOne({ email });
  if (!user) {
    return next(
      new AppError("not admin with this email", StatusCodes.NOT_FOUND)
    );
  }
  const sixDigitNumber = generateRandomNumber(4);
  const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes expiration
  await new Email({ email, name: "" }, sixDigitNumber).sendVerificationCode();
  let otp = CryptoJS.AES.encrypt(
    JSON.stringify({
      code: sixDigitNumber,
      expirationTime: expirationTime,
    }),
    process.env.CRYPTO_SEC
  ).toString();
  user.forgetPassword = encodeURIComponent(otp);
  await user.save();
  return successMessage(StatusCodes.ACCEPTED, res, null, {
    email,
    encryptOtp: encodeURIComponent(otp),
  });
});
// method POST
// route /api/v1/user/otpChangePassword
// @desciption change password with otp
// privacy only admin can do this
const otpChangePassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const userIS = await user_model.findOne({ email });
  if (!userIS) {
    return next(
      new AppError("not admin with this email", StatusCodes.BAD_REQUEST)
    );
  }
  if (!userIS.forgetPassword) {
    return next(
      new AppError(
        "you are not able to change password because of not otp",
        StatusCodes.NOT_FOUND
      )
    );
  }
  const errors = [];

  if (!email) {
    errors.push("Email is required.");
  }

  if (!otp) {
    errors.push("Verification code is required.");
  }

  if (errors.length > 0) {
    return next(new AppError(errors, StatusCodes.BAD_REQUEST));
  }

  // Decrypt the encrypted options and compare with the user-entered code
  const decrypted = CryptoJS.AES.decrypt(
    decodeURIComponent(userIS.forgetPassword),
    process.env.CRYPTO_SEC
  ).toString(CryptoJS.enc.Utf8);

  let otpData;
  try {
    otpData = JSON.parse(decrypted);
  } catch (error) {
    return next(
      new AppError("Invalid encrypted options format.", StatusCodes.BAD_REQUEST)
    );
  }
  const { code, expirationTime } = otpData;

  if (code != otp) {
    return next(
      new AppError("Invalid verification code.", StatusCodes.UNAUTHORIZED)
    );
  }

  // Check if the OTP has expired
  const currentTime = new Date().getTime();
  if (currentTime > expirationTime) {
    return next(
      new AppError("Verification code has expired.", StatusCodes.UNAUTHORIZED)
    );
  }
  // Update the user's password
  userIS.password = CryptoJS.AES.encrypt(
    newPassword,
    process.env.CRYPTO_SEC
  ).toString();
  userIS.forgetPassword = null;
  await userIS.save();
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "Password reset successfully.",
    null
  );
});

// method GET
// route /api/v1/user/currentLevel
// @desciption get level of user(customer or agent)
// privacy only only user(customer or agent) can do this
const getLevel = catchAsync(async (req, res, next) => {
  const user = await user_model.findById(req.user);
  const levels = {
    level1: false,
    level2: false,
    level3: false,
    level4: false,
  };
  if (user.email && user.phoneNumber) {
    levels.level1 = true;
  }
  if (
    user.name &&
    user.address &&
    user.gender &&
    user.address &&
    user.nextOfKinName &&
    user.nextOfKinAddress &&
    user.nextOfKinPhoneNumber
  ) {
    levels.level2 = true;
  }
  if (
    user.occupation &&
    user.companyName &&
    user.companyAddress &&
    user.supervisorOrManagerName &&
    user.supervisorOrManagerPhoneNumber &&
    user.proofOfOwnerShipDoc[0]
  ) {
    levels.level3 = true;
  }
  if (user.proofOfOwnerShipDoc[0] && user.propertyPictures[0]) {
    levels.level4 = true;
  }
  return successMessage(StatusCodes.ACCEPTED, res, "fetched levels", levels);
});

// method GET
// route /api/v1/user/settings
// @desciption get settings for user(customer or agent)
// privacy only only user(customer or agent) can do this
const getSettings = catchAsync(async (req, res, next) => {
  const settings = await settings_model.findOne({ userId: req.user });
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "settings are fetched",
    settings
  );
});

// method PUT
// route /api/v1/user/settings
// @desciption edit settings for user(customer or agent)
// privacy only only user(customer or agent) can do this
const editSettings = catchAsync(async (req, res, next) => {
  const userId = req.user;
  const { error, value } = settingsUpdateSchema.validate(req.body);
  if (error) {
    throw new AppError(
      error.details.map((detail) => detail.message),
      StatusCodes.BAD_REQUEST
    );
  }

  const settings = await settings_model.findOne({ userId });
  if (!settings) {
    throw new AppError("Settings not found", StatusCodes.NOT_FOUND);
  }

  // Update the settings
  settings.notificationSettings = value.notificationSettings;
  settings.privacyAndSecurity = value.privacyAndSecurity;

  // Save the updated settings
  await settings.save();

  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "Settings updated successfully",
    settings
  );
});

module.exports = {
  register,
  verifyUser,
  login,
  updateProfile,
  logoutUser,
  forgetPassword,
  otpChangePassword,
  getLevel,
  getSettings,
  editSettings,
};
