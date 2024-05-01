// express
const express = require("express");
// express router
const ROUTE = express.Router();
// controller
const { addReview } = require("../Controller/review_controller.js");
// authentication
const { verifyToken, refreshToken } = require("../utils/verifyToken_util.js");
// utilty functions
const { otpValidation } = require("../functions/utility_functions.js");
// model
const user_model = require("../Model/user_model.js");

/**
 * Endpoint to add a review for a property.
 * @swagger
 * /api/v1/review/:
 *   post:
 *     summary: Add Review
 *     description: Add a review for a property.
 *     tags:
 *       - Customer or Agent/review
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: Review object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: ID of the property to review
 *               comment:
 *                 type: string
 *                 description: Comment for the review
 *               rating:
 *                 type: integer
 *                 description: Rating for the property (1-5)
 *     responses:
 *       202:
 *         description: Review added successfully
 */
ROUTE.route("/").post(verifyToken([user_model]), addReview);

module.exports = ROUTE;
