/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
// catch async
const catchAsync = require("../utils/catchAsync");
// jwt
const JWT = require("jsonwebtoken");
// app error
const AppError = require("./appError");
/* models */
const {
  generateRandomString,
  successMessage,
  setCookie,
} = require("../functions/utility_functions");

const signRefreshToken = (uniqueId) => {
  return JWT.sign({ uniqueId }, process.env.JWT_SEC);
};
const signAccessToken = (id, uniqueId) => {
  return JWT.sign({ id, uniqueId }, process.env.JWT_SEC, {
    expiresIn: process.env.expirydateAccessToken,
  });
};
const generateAccessTokenRefreshToken = (userId) => {
  const uniqueId = generateRandomString(10);
  const refreshToken = signRefreshToken(uniqueId);
  const accessToken = signAccessToken(userId, uniqueId);
  return { refreshToken, accessToken };
};
// Verify token and admin
const verifyToken = (model) => async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;
    if (!token) {
      return next(new AppError("you are not login", StatusCodes.BAD_REQUEST));
    }
    const payload = JWT.verify(token, process.env.JWT_SEC);
    let user;
    for (let item of model) {
      user = await item.findById(payload.id);
      if (user) {
        break;
      }
    }
    if (!user) {
      return next(new AppError("Access Denied!", StatusCodes.UNAUTHORIZED));
    }
    const payloadunique = JWT.verify(
      req.cookies.refreshToken,
      process.env.JWT_SEC
    ).uniqueId;
    if (payloadunique !== payload.uniqueId) {
      return next(new AppError("Invalid Token", StatusCodes.UNAUTHORIZED));
    }
    try {
      const verified = JWT.verify(token, process.env.JWT_SEC);
      req.user = verified.id;
      next();
    } catch (error) {
      return next(new AppError("Invalid Token", StatusCodes.UNAUTHORIZED));
    }
  } catch (error) {
    return next(new AppError(error, StatusCodes.UNAUTHORIZED));
  }
};
// refreshToken
const refreshToken = (model) =>
  catchAsync(async (req, res, next) => {
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new AppError("you are not login", StatusCodes.BAD_REQUEST));
    }

    // Retrieve the user from the database based on the refresh token
    let user = await model.findOne({ refreshToken: refreshToken });
    if (!user) {
      throw new Error("you are not login");
    }
    try {
      let payload = JWT.verify(refreshToken, process.env.JWT_SEC);
      const newAccessToken = signAccessToken(user._id, payload.uniqueId);
      await setCookie(newAccessToken, refreshToken, res);
    } catch (error) {
      // return next(new AppError("Invalid Token", StatusCodes.UNAUTHORIZED));
      user = await model.findById(user._id).lean();
      user = await model.updateOne(
        { _id: user._id },
        { $pull: { refreshToken: refreshToken } }
      );
      let { accessToken, refreshToken: refresh } =
        generateAccessTokenRefreshToken(user._id);
      await setCookie(accessToken, refresh, res);
    }
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "refresh token run successfully"
    );
  });

module.exports = {
  generateAccessTokenRefreshToken,
  verifyToken,
  refreshToken,
};
