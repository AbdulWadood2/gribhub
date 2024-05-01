const express = require("express");
// models
const admin_model = require("../Model/admin_model.js");
const user_model = require("../Model/user_model.js");
// controller
const {
  createOrUpdate,
  getTermCondition,
} = require("../Controller/termConditions_controller.js");
const { verifyToken } = require("../utils/verifyToken_util.js");
const ROUTE = express.Router();

/**
 * @swagger
 * /api/v1/termCondition:
 *   post:
 *     summary: Create or update term conditions
 *     description: This API endpoint is used to both create and update term conditions.
 *     tags:
 *       - Admin/termConditions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               terms:
 *                 type: string
 *               useAndlicense:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Term condition created/updated successfully
 */
ROUTE.route("/").post(verifyToken([admin_model]), createOrUpdate);
/**
 * @swagger
 * /api/v1/termCondition:
 *   get:
 *     summary: for get the termConditions
 *     description: all roles can do this but with token
 *     tags:
 *       - Admin/termConditions
 *       - Customer or Agent/termConditions
 *     responses:
 *       '201':
 *         description: Term condition get successfully
 */
ROUTE.route("/").get(verifyToken([admin_model, user_model]), getTermCondition);

module.exports = ROUTE;
