// status codes
const { StatusCodes } = require("http-status-codes");
// app error
const AppError = require("../utils/appError");
// model
const admin_model = require("../Model/admin_model");
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
const { Email } = require("../utils/emails");
// method POST
// route /api/v1/admin/login
// @desciption the register request verified here with otp
// privacy only only user can do this
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await admin_model.findOne({ email });
  if (!admin) {
    return next(
      new AppError("not admin with this email", StatusCodes.BAD_REQUEST)
    );
  }
  userPasswordCheck(admin, password);
  const {
    password: pass,
    refreshToken: refresh,
    ...filteredAdminFields
  } = JSON.parse(JSON.stringify(admin));
  const { refreshToken, accessToken } = generateAccessTokenRefreshToken(
    admin._id
  );
  admin.refreshToken.push(refreshToken);
  await admin.save();
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 10);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: futureDate,
  });
  return successMessage(
    StatusCodes.ACCEPTED,
    res,
    "login success",
    filteredAdminFields
  );
});

// method POST
// route /api/v1/admin/logout
// @desciption logout admin
// privacy only admin can do this
const logoutAdmin = catchAsync(async (req, res) => {
  let refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new AppError("you are not login", StatusCodes.BAD_REQUEST));
  }
  const buyer = await admin_model.findOne({ refreshToken });
  if (!buyer) {
    return next(new AppError("you are not login", StatusCodes.BAD_REQUEST));
  }

  await admin_model.updateOne(
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
// route /api/v1/admin/sendForgetOtp
// @desciption send otp to email
// privacy only admin can do this
const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  const user = await admin_model.findOne({ email });
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
// route /api/v1/admin/otpChangePassword
// @desciption change password with otp
// privacy only admin can do this
const otpChangePassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const userIS = await admin_model.findOne({ email });
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

module.exports = {
  login,
  logoutAdmin,
  forgetPassword,
  otpChangePassword,
};
