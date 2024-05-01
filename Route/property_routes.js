const express = require("express");
// models
const user_model = require("../Model/user_model.js");
// controller
const {
  addProperty,
  updateProperty,
  deleteProperty,
  addOrRemoveFavourite,
  getNearestProperties,
} = require("../Controller/property_controller.js");
const { verifyToken } = require("../utils/verifyToken_util.js");
const ROUTE = express.Router();
/**
 * Add a new property.
 * @swagger
 * /api/v1/property/:
 *   post:
 *     summary: Add a new property
 *     description: Endpoint to add a new property. Only users (customers or agents) can perform this action.
 *     tags:
 *       - Customer or Agent/property
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyTitle:
 *                 type: string
 *                 description: The title of the property.
 *                 example: "Luxurious Apartment"
 *               propertyCategory:
 *                 type: string
 *                 description: The category of the property.
 *                 example: "Apartment"
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: The coordinates of the property (longitude and latitude).
 *                     example: [40.7128, -74.0060]
 *                 description: The location of the property.
 *               photosVideos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The URLs of photos or videos related to the property.
 *                 example: ["https://example.com/photo1.jpg", "https://example.com/video1.mp4"]
 *               rentPrice:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     description: The rent amount.
 *                     example: 1500
 *                   currency:
 *                     type: string
 *                     description: The currency used for rent (e.g., "$", "£").
 *                     example: "$"
 *                   category:
 *                     type: string
 *                     description: The rent payment category (e.g., "Monthly", "Annually").
 *                     example: "Monthly"
 *                 description: The rent price details of the property.
 *               propertyFeatures:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: The title of the feature.
 *                       example: "Swimming Pool"
 *                     quantities:
 *                       type: number
 *                       description: The quantity of the feature.
 *                       example: 1
 *                 description: The features of the property.
 *               environment_facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The environmental facilities provided by the property.
 *                 example: ["Gym", "Parking"]
 *     responses:
 *       '201':
 *         description: Property created successfully
 */
ROUTE.post("/", verifyToken([user_model]), addProperty);
/**
 * Update a property.
 * @swagger
 * /api/v1/property/:
 *   put:
 *     summary: Update a property
 *     description: Endpoint to update a property. Only the owner user (customer or agent) can perform this action.
 *     tags:
 *       - Customer or Agent/property
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the property to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyTitle:
 *                 type: string
 *                 description: The title of the property.
 *                 example: "Luxurious Apartment"
 *               propertyCategory:
 *                 type: string
 *                 description: The category of the property.
 *                 example: "Apartment"
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: The coordinates of the property (longitude and latitude).
 *                     example: [40.7128, -74.0060]
 *                 description: The location of the property.
 *               photosVideos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The URLs of photos or videos related to the property.
 *                 example: ["https://example.com/photo1.jpg", "https://example.com/video1.mp4"]
 *               rentPrice:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     description: The rent amount.
 *                     example: 1500
 *                   currency:
 *                     type: string
 *                     description: The currency used for rent (e.g., "$", "£").
 *                     example: "$"
 *                   category:
 *                     type: string
 *                     description: The rent payment category (e.g., "Monthly", "Annually").
 *                     example: "Monthly"
 *                 description: The rent price details of the property.
 *               propertyFeatures:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: The title of the feature.
 *                       example: "Swimming Pool"
 *                     quantities:
 *                       type: number
 *                       description: The quantity of the feature.
 *                       example: 1
 *                 description: The features of the property.
 *               environment_facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The environmental facilities provided by the property.
 *                 example: ["Gym", "Parking"]
 *     responses:
 *       '202':
 *         description: Property updated successfully
 */
ROUTE.put("/", verifyToken([user_model]), updateProperty);
/**
 * Delete a property.
 * @swagger
 * /api/v1/property/:
 *   delete:
 *     summary: Delete a property
 *     description: Endpoint to delete a property. Only the owner user (customer or agent) can perform this action.
 *     tags:
 *       - Customer or Agent/property
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the property to delete.
 *     responses:
 *       '202':
 *         description: Property deleted successfully
 */
ROUTE.delete("/", verifyToken([user_model]), deleteProperty);
/**
 * @swagger
 * /api/v1/property/addOrRemoveFavourite:
 *   post:
 *     summary: Add or remove property from favorites
 *     description: Allows users (either customers or agents) to add or remove a property from their list of favorites.
 *     tags:
 *       - Customer or Agent/property
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property to add or remove from favorites.
 *     responses:
 *       '202':
 *         description: Property added to or removed from favorites successfully.
 *       '400':
 *         description: Bad request. Either propertyId is missing or not valid.
 *       '404':
 *         description: Property with the provided ID not found.
 *       '500':
 *         description: Internal server error.
 */
ROUTE.post(
  "/addOrRemoveFavourite",
  verifyToken([user_model]),
  addOrRemoveFavourite
);
/**
 * Retrieves properties nearest to the user's location.
 *
 * @swagger
 * /api/v1/property/nearest:
 *   get:
 *     summary: Get nearest properties
 *     description: Retrieves properties nearest to the user's location.
 *     tags:
 *       - Customer or Agent/property
 *     responses:
 *       '200':
 *         description: Nearest properties retrieved successfully.
 *       '404':
 *         description: User or user location not found.
 */
ROUTE.get("/nearest", verifyToken([user_model]), getNearestProperties);

module.exports = ROUTE;
