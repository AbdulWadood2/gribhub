const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    listingType: {
      type: String,
      enum: ["Rent"],
      required: true,
      default: "Rent",
    },
    propertyCategory: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"], // GeoJSON type
        default: "Point",
      },
      coordinates: {
        type: [Number], // Array of numbers for longitude and latitude
        required: true,
      },
    },
    photosVideos: [{ type: String, required: true }],
    rentPrice: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
        enum: ["$", "£", "₦", "₹"],
      },
      category: {
        type: String,
        required: true,
        enum: ["Monthly", "Annually"],
      },
    },
    propertyFeatures: [
      {
        title: { type: String, required: true },
        quantities: { type: Number, required: true },
      },
    ],
    environment_facilities: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
);
propertySchema.index({ location: "2dsphere" });
const data = mongoose.model("property", propertySchema);
module.exports = data;
