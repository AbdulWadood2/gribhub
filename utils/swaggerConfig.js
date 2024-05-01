// swaggerConfig.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Cribhub",
      version: "1.0.0",
      description: "API documentation for Cribhub",
    },
  },
  apis: ["./Route/*.js"], // Path to your route files
};
/**
 * @swagger
 * tags:
 *   - name: Admin
 *   - name: Admin/account
 *   - name: Admin/termConditions
 *   - name: Customer or Agent/account
 *   - name: Customer or Agent/paymentMethod
 *   - name: Customer or Agent/support
 *   - name: Customer or Agent/property
 *   - name: Customer or Agent/termConditions
 *   - name: Customer or Agent/chat
 *   - name: Customer or Agent/review
 */
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
