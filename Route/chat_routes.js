const express = require("express");
// models
const admin_model = require("../Model/admin_model.js");
const user_model = require("../Model/user_model.js");
// controller
const { addChat, getChatRoom } = require("../Controller/chat_controller.js");
const { verifyToken } = require("../utils/verifyToken_util.js");
const ROUTE = express.Router();
/**
 * @swagger
 * /api/v1/chat/:
 *   post:
 *     summary: Create a chat of any type
 *     description: Endpoint to create a chat of any type (text, audio, video, document)
 *     tags:
 *       - Customer or Agent/chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID of the receiver
 *                 example: 60e9e2977a462c2234d896af
 *               messageType:
 *                 type: string
 *                 enum: [text, audio, video, document]
 *                 description: Type of message
 *                 example: text
 *               messageContent:
 *                 type: string
 *                 description: Content of the message
 *                 example: Hello, how are you?
 *     responses:
 *       '200':
 *         description: Chat successfully created
 */
ROUTE.route("/").post(verifyToken([user_model]), addChat);
/**
 * @swagger
 * /api/v1/chat/:
 *   get:
 *     summary: Get all chat rooms
 *     description: Endpoint to get the chat between user and other user
 *     tags:
 *       - Customer or Agent/chat
 *     parameters:
 *       - in: query
 *         name: receiverId
 *         required: true
 *         description: ID of the receiver user
 *         schema:
 *           type: string
 *     responses:
 *       '202':
 *         description: Chat rooms successfully fetched
 */
ROUTE.route("/").get(verifyToken([user_model]), getChatRoom);

module.exports = ROUTE;
