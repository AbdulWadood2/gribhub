// express
const express = require("express");
// express router
const ROUTE = express.Router();
// controller
const {
  login,
  logoutAdmin,
  forgetPassword,
  otpChangePassword,
} = require("../Controller/admin_controller.js");
// authentication
const { verifyToken, refreshToken } = require("../utils/verifyToken_util.js");
// utilty functions
const { otpValidation } = require("../functions/utility_functions.js");
// model
const admin_model = require("../Model/admin_model.js");

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Login to the admin panel
 *     description: Endpoint to login as an admin user.
 *     tags:
 *       - Admin/account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Admin email
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       '202':
 *         description: Login successful
 */
ROUTE.route("/login").post(login);
/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     summary: Logout admin.
 *     description: Logout the authenticated admin by clearing the refresh token and access token cookies.
 *     tags:
 *       - Admin/account
 *     responses:
 *       '202':
 *         description: Admin logged out successfully.
 */
ROUTE.route("/logout").post(verifyToken([admin_model]), logoutAdmin);
/**
 * Send OTP to email for resetting admin password.
 * @swagger
 * /api/v1/admin/sendForgetOtp:
 *   post:
 *     summary: Send OTP for password reset
 *     description: Endpoint for sending a one-time password (OTP) to the email associated with an admin account for resetting the password.
 *     tags:
 *       - Admin/account
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
 * /api/v1/admin/validate-otp:
 *   post:
 *     summary: Validate OTP entered by the user.
 *     description: |
 *       Validates the OTP (One-Time Password) entered by the user by decrypting the encrypted options
 *       and comparing the OTP with the decrypted code. Checks if the OTP has expired.
 *     tags:
 *       - Admin/account
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
 * /api/v1/admin/otpChangePassword:
 *   post:
 *     summary: Change password with OTP for admin users.
 *     description: |
 *       Change the password for an admin user using OTP (One-Time Password).
 *       Validates the OTP and checks its expiration time before updating the password.
 *       Requires the user's email, OTP, encrypted options containing OTP data,
 *       and the new password to be set.
 *     tags:
 *       - Admin/account
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
 * /api/v1/admin/refreshToken:
 *   get:
 *     summary: refresh Token api for admin.
 *     description:
 *       refresh Token api for admin
 *     tags:
 *       - Admin/account
 *     responses:
 *       '202':
 *         description: refreshToken success
 */
ROUTE.route("/refreshToken").get(refreshToken(admin_model));

module.exports = ROUTE;
