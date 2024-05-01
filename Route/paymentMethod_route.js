const express = require("express");
// models
const user_model = require("../Model/user_model.js");
// controller
const {
  addOrEditPaymentMethod,
  getPaymentMethodForUserOnly,
} = require("../Controller/paymentMethod_controller.js");
const { verifyToken } = require("../utils/verifyToken_util.js");
// express router
const ROUTE = express.Router();
/**
 * Update or create the payment method.
 *
 * @swagger
 * /api/v1/paymentMethod:
 *   post:
 *     summary: Update or create the payment method
 *     description: Update or create the payment method. Only authenticated users (customer or agent) can perform this action.
 *     tags:
 *       - Customer or Agent/paymentMethod
 *     requestBody:
 *       description: Payment method object to be updated or created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: number
 *               accountName:
 *                 type: string
 *               bankName:
 *                 type: string
 *     responses:
 *       '202':
 *         description: Payment method updated or created successfully
 */
ROUTE.route("/").post(verifyToken([user_model]), addOrEditPaymentMethod);
/**
 * @swagger
 * /api/v1/paymentMethod:
 *   get:
 *     summary: Get payment method for user (customer or agent).
 *     description: Retrieve the payment method associated with the authenticated user (customer or agent).
 *     tags:
 *       - Customer or Agent/paymentMethod
 *     responses:
 *       '202':
 *         description: Successful operation. Returns the user's payment method.
 */
ROUTE.route("/").get(verifyToken([user_model]), getPaymentMethodForUserOnly);

module.exports = ROUTE;
