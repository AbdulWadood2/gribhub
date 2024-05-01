// use nodemailer for send email
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/appError");
const { Email } = require("../utils/emails");
// this package for encryption
const CryptoJS = require("crypto-js");
// for send simply success responses
let successMessage = (statusCode, res, message, data) => {
  return res.status(statusCode).json({
    status: "success",
    data,
    message,
  });
};
// this will give us the random string by our length
let generateRandomString = (length) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};
// I make it specially for send otp of any range flexible
const generateRandomNumber = (max) => {
  const min = Math.pow(10, max - 1);
  const maxExclusive = Math.pow(10, max);
  return Math.floor(Math.random() * (maxExclusive - min)) + min;
};
// send email for varification otp
const sendVerificationEmail = async (email, verificationCode) => {
  await new Email({ email, name: "" }, verificationCode).sendVerificationCode();
};
// for generate encrypted otp
const generateEncryptedOtp = (otp, expirationTime, email) => {
  const encryptedOtp = CryptoJS.AES.encrypt(
    JSON.stringify({ otp, expirationTime, email }),
    process.env.CRYPTO_SEC
  ).toString();
  return encryptedOtp;
};
// validate otp match
const validateOtpMatch = (otpFromEncryptData, otp) => {
  if (otpFromEncryptData !== otp) {
    throw new AppError("Invalid verification code", StatusCodes.BAD_REQUEST);
  }
};
// validate expiration test
const validateOtpExpiration = (expirationTime) => {
  if (new Date().getTime() > expirationTime) {
    throw new AppError(
      "Verification code has expired",
      StatusCodes.BAD_REQUEST
    );
  }
};
// decryptAndValidateOtp
const decryptAndValidateOtp = (encryptedOtp) => {
  try {
    const decrypted = decryptEncryptedOtp(encryptedOtp);
    const otpData = JSON.parse(decrypted);
    const { otp, expirationTime, email } = otpData;
    return { otp, expirationTime, email };
  } catch (error) {
    throw new AppError(
      "Invalid encrypted options format",
      StatusCodes.BAD_REQUEST
    );
  }
};
// decryptEncryptedOtp
const decryptEncryptedOtp = (encryptedOtp) => {
  try {
    return CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedOtp),
      process.env.CRYPTO_SEC
    ).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new AppError(
      "Invalid encrypted options format",
      StatusCodes.BAD_REQUEST
    );
  }
};
// userPasswordCheck
const userPasswordCheck = (user, password) => {
  const hashedPassword = CryptoJS.AES.decrypt(
    user.password,
    process.env.CRYPTO_SEC
  );
  const realPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
  if (password !== realPassword) {
    throw new AppError("password is incorrect", StatusCodes.BAD_REQUEST);
  }
};
// setCookie
const setCookie = async (accessToken, refreshToken, res) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 100);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: futureDate,
  });
};
// otp validation
const otpValidation = async (req, res, next) => {
  try {
    const { otp, encryptOtp } = req.query;
    // Decrypt the encrypted options and compare with the user-entered code
    const decrypted = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptOtp),
      process.env.CRYPTO_SEC
    ).toString(CryptoJS.enc.Utf8);
    let otpData;
    try {
      otpData = JSON.parse(decrypted);
    } catch (error) {
      return next(
        new AppError(
          "Invalid encrypted options format.",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const { code, expirationTime } = otpData;
    // Check if the OTP has expired
    const currentTime = new Date().getTime();
    if (currentTime > expirationTime) {
      return next(
        new AppError("Verification code has expired.", StatusCodes.BAD_REQUEST)
      );
    }

    if (code != otp) {
      return next(
        new AppError("Invalid verification code.", StatusCodes.BAD_REQUEST)
      );
    }

    return successMessage(StatusCodes.ACCEPTED, res, "Correct OTP", null);
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  successMessage,
  generateRandomString,
  generateRandomNumber,
  sendVerificationEmail,
  generateEncryptedOtp,
  validateOtpMatch,
  validateOtpExpiration,
  decryptAndValidateOtp,
  userPasswordCheck,
  setCookie,
  otpValidation
};
