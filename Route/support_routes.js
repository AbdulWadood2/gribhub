const express = require("express");
// models
const user_model = require("../Model/user_model.js");
const admin_model = require("../Model/admin_model.js");
// controller
const {
  sendSupportMessage,
  resolveIssue,
  getSupportUserMessagesFlexible,
  replySupport,
} = require("../Controller/support_controller.js");
const { verifyToken } = require("../utils/verifyToken_util.js");
const ROUTE = express.Router();
/**
 * @swagger
 * /api/v1/support/supportMessage:
 *   post:
 *     summary: Send support message.
 *     description: Register a support message with OTP verification.
 *     tags:
 *       - Customer or Agent/support
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       '202':
 *         description: Support message sent successfully.
 */
ROUTE.route("/supportMessage").post(
  verifyToken([user_model]),
  sendSupportMessage
);
/**
 * @swagger
 * /api/v1/support/supportMessage:
 *   put:
 *     summary: Resolve support message.
 *     description: Edit the support message to mark it as resolved.
 *     tags:
 *        - Customer or Agent/support
 *     parameters:
 *       - in: query
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the support message to be resolved.
 *     responses:
 *       '202':
 *         description: Support message resolved successfully.
 */
ROUTE.route("/supportMessage").put(verifyToken([user_model]), resolveIssue);
/**
 * @swagger
 * /api/v1/support/supportMessage:
 *   get:
 *     summary: Get required support messages
 *     description: Retrieves support messages based on the provided parameters.
 *     tags:
 *       - Customer or Agent/support
 *     parameters:
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: Indicates whether the support messages are resolved or not.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination (default is 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The maximum number of messages per page (optional).
 *     responses:
 *       '202':
 *         description: Successful operation
 */
ROUTE.route("/supportMessage").get(
  verifyToken([user_model]),
  getSupportUserMessagesFlexible
);
/**
 * Send a reply to a user (customer or agent) by admin.
 * @swagger
 * /api/v1/support/sendReplyAdmin:
 *   post:
 *     summary: Send reply to user by admin
 *     description: Endpoint for an admin to send a reply to a user (customer or agent).
 *     tags:
 *       - Customer or Agent/support
 *     requestBody:
 *       description: Email and message for the reply.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user to send the reply to.
 *               message:
 *                 type: string
 *                 description: Message to be sent as a reply.
 *     responses:
 *       '202':
 *         description: Reply sent successfully.
 */
ROUTE.route("/sendReplyAdmin").post(verifyToken([admin_model]), replySupport);

module.exports = ROUTE;
