const express = require("express");
// models
const user_model = require("../Model/user_model.js");
// controller
const {
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
} = require("../Controller/user_controller.js");
const { verifyToken, refreshToken } = require("../utils/verifyToken_util.js");
const { otpValidation } = require("../functions/utility_functions.js");
const ROUTE = express.Router();
/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     description: Endpoint to register a new user.
 *     tags:
 *        - Customer or Agent/account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [123.456, 456.789] # Example values for coordinates
 *     responses:
 *       '202':
 *         description: register request is sent to users email or verification email sent
 */
ROUTE.route("/register").post(register);
/**
 * @swagger
 * /api/v1/user/verifyUser:
 *   post:
 *     summary: Verify user account
 *     description: Endpoint to verify user account using OTP.
 *     tags:
 *        - Customer or Agent/account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               encryptedOtp:
 *                 type: string
 *                 description: Encrypted OTP received via email
 *               otp:
 *                 type: number
 *                 description: Plain OTP entered by the user
 *     responses:
 *       '202':
 *         description: Account verified successfully
 */
ROUTE.route("/verifyUser").post(verifyUser);
/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Login
 *     description: Login with email and password.
 *     tags:
 *        - Customer or Agent/account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       '202':
 *         description: Login successful
 */
ROUTE.route("/login").post(login);
/**
 * Updates the profile of a user.
 *
 * @swagger
 * /api/v1/user/updateProfile:
 *   put:
 *     summary: Update user profile
 *     description: Update the profile of a user.
 *     tags:
 *       - Customer or Agent/account
 *     requestBody:
 *       description: User object containing the fields to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string   # Changed type to string since phone numbers can contain non-numeric characters
 *               profileImage:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [123.456, 456.789] # Example values for coordinates
 *               socialMediaLinks:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: string
 *                     nullable: true
 *                     default: null
 *                     description: Link for X social media platform.
 *                   instagram:
 *                     type: string
 *                     nullable: true
 *                     default: null
 *                     description: Link for Instagram.
 *                   facebook:
 *                     type: string
 *                     nullable: true
 *                     default: null
 *                     description: Link for Facebook.
 *                   threads:
 *                     type: string
 *                     nullable: true
 *                     default: null
 *                     description: Link for Thread social media platform.
 *               address:
 *                 type: string
 *                 description: Address of the user.
 *               gender:
 *                 type: string
 *                 description: Gender of the user.
 *               preferableId:
 *                 type: string
 *                 description: Preferable ID of the user.
 *               nextOfKinName:
 *                 type: string
 *                 description: Name of the user's next of kin.
 *               nextOfKinAddress:
 *                 type: string
 *                 description: Address of the user's next of kin.
 *               nextOfKinPhoneNumber:
 *                 type: string
 *                 description: Phone number of the user's next of kin.
 *               occupation:
 *                 type: string
 *                 description: Occupation of the user.
 *               companyName:
 *                 type: string
 *                 description: Name of the user's company.
 *               companyAddress:
 *                 type: string
 *                 description: Address of the user's company.
 *               supervisorOrManagerName:
 *                 type: string
 *                 description: Name of the user's supervisor or manager.
 *               supervisorOrManagerPhoneNumber:
 *                 type: string
 *                 description: Phone number of the user's supervisor or manager.
 *               proofOfOwnerShipDoc:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of strings representing proof of ownership documents.
 *               propertyPictures:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of strings representing property pictures.
 *     responses:
 *       '202':
 *         description: User profile updated successfully.
 */
ROUTE.route("/updateProfile").put(verifyToken([user_model]), updateProfile);
/**
 * @swagger
 * /api/v1/user/logout:
 *   post:
 *     summary: Logout user.
 *     description: Logout the authenticated user (customer or agent) by clearing the refresh token and access token cookies.
 *     tags:
 *       - Customer or Agent/account
 *     responses:
 *       '202':
 *         description: User logged out successfully.
 */
ROUTE.route("/logout").post(verifyToken([user_model]), logoutUser);
/**
 * Send OTP to email for resetting admin password.
 * @swagger
 * /api/v1/user/sendForgetOtp:
 *   post:
 *     summary: Send OTP for password reset
 *     description: Endpoint for sending a one-time password (OTP) to the email associated with an admin account for resetting the password.
 *     tags:
 *       - Customer or Agent/account
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email address of the admin account.
 *     responses:
 *       '202':
 *         description: OTP sent successfully.
 */
ROUTE.route("/sendForgetOtp").post(forgetPassword);
/**
 * Middleware function to validate the OTP (One-Time Password) entered by the user.
 * @swagger
 * /api/v1/user/validate-otp:
 *   post:
 *     summary: Validate OTP entered by the user.
 *     description: |
 *       Validates the OTP (One-Time Password) entered by the user by decrypting the encrypted options
 *       and comparing the OTP with the decrypted code. Checks if the OTP has expired.
 *     tags:
 *       - Customer or Agent/account
 *     parameters:
 *       - in: query
 *         name: otp
 *         description: The OTP entered by the user.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: encryptOtp
 *         description: The encrypted options containing the OTP data.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '202':
 *         description: Correct OTP. Returns a success message.
 */
ROUTE.route("/validate-otp").post(otpValidation);
/**
 * Change password with OTP for admin.
 * @swagger
 * /api/v1/user/otpChangePassword:
 *   post:
 *     summary: Change password with OTP for admin users.
 *     description: |
 *       Change the password for an admin user using OTP (One-Time Password).
 *       Validates the OTP and checks its expiration time before updating the password.
 *       Requires the user's email, OTP, encrypted options containing OTP data,
 *       and the new password to be set.
 *     tags:
 *       - Customer or Agent/account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the admin user.
 *               otp:
 *                 type: string
 *                 description: The OTP entered by the admin user.
 *               newPassword:
 *                 type: string
 *                 description: The new password to be set.
 *     responses:
 *       '202':
 *         description: Password reset successfully. Returns a success message.
 */
ROUTE.route("/otpChangePassword").post(otpChangePassword);
/**
 * Change password with OTP for admin.
 * @swagger
 * /api/v1/user/refreshToken:
 *   get:
 *     summary: refresh Token api for user.
 *     description:
 *       refresh Token api for admin
 *     tags:
 *       - Customer or Agent/account
 *     responses:
 *       '202':
 *         description: refreshToken success
 */
ROUTE.route("/refreshToken").get(refreshToken(user_model));
/**
 * Fetches the level of the user (customer or agent).
 *
 * @swagger
 * /api/v1/user/currentLevel:
 *   get:
 *     summary: Get level of user (customer or agent)
 *     description: Retrieves the level of the current user (customer or agent).
 *     tags:
 *       - Customer or Agent/account
 *     responses:
 *       '202':
 *         description: Levels fetched successfully.
 */
ROUTE.route("/currentLevel").get(verifyToken([user_model]), getLevel);
/**
 * Retrieves settings for the user (customer or agent).
 *
 * @swagger
 * /api/v1/user/settings:
 *   get:
 *     summary: Get settings for user (customer or agent)
 *     description: Retrieves the settings associated with the current user (customer or agent).
 *     tags:
 *       - Customer or Agent/account
 *     responses:
 *       '202':
 *         description: Settings fetched successfully.
 */
ROUTE.route("/settings").get(verifyToken([user_model]), getSettings);
/**
 * Edit settings for the user (customer or agent).
 *
 * @swagger
 * /api/v1/user/settings:
 *   put:
 *     summary: Edit settings for user (customer or agent)
 *     description: Edit the settings associated with the current user (customer or agent).
 *     tags:
 *       - Customer or Agent/account
 *     requestBody:
 *       description: Updated settings object containing notificationSettings and privacyAndSecurity.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationSettings:
 *                 type: object
 *                 properties:
 *                   emailNotification:
 *                     type: boolean
 *                   reminder:
 *                     type: boolean
 *                   listing:
 *                     type: boolean
 *                   doNotDistrub:
 *                     type: boolean
 *                   notificationLockScreen:
 *                     type: boolean
 *                   statusbarNotification:
 *                     type: boolean
 *               privacyAndSecurity:
 *                 type: object
 *                 properties:
 *                   securityLock:
 *                     type: boolean
 *                   faceIdOrFingerPrint:
 *                     type: boolean
 *                   darkMode:
 *                     type: boolean
 *     responses:
 *       '202':
 *         description: Settings updated successfully.
 */
ROUTE.route("/settings").put(verifyToken([user_model]), editSettings);

module.exports = ROUTE;
