const { string } = require("joi");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: [{ type: String }],
    phoneNumber: { type: Number, default: null },
    profileImage: { type: String, default: null },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    dateOfBirth: { type: String, default: null },
    location: {
      type: {
        type: String,
        enum: ["Point"], // GeoJSON type
        default: "Point",
      },
      coordinates: {
        type: [Number], // Array of numbers for longitude and latitude
      },
    },
    socialMediaLinks: {
      x: { type: String, default: null },
      instagram: { type: String, default: null },
      facebook: { type: String, default: null },
      threads: { type: String, default: null },
    },
    forgetPassword: { type: String, default: null },
    address: { type: String, default: null },
    gender: { type: String, default: null },
    preferableId: { type: String, default: null },
    nextOfKinName: { type: String, default: null },
    nextOfKinAddress: { type: String, default: null },
    nextOfKinPhoneNumber: { type: String, default: null },
    occupation: { type: String, default: null },
    companyName: { type: String, default: null },
    companyAddress: { type: String, default: null },
    supervisorOrManagerName: { type: String, default: null },
    supervisorOrManagerPhoneNumber: { type: String, default: null },
    supervisorOrManagerPhoneNumber: { type: String, default: null },
    proofOfOwnerShipDoc: [{ type: String }],
    propertyPictures: [{ type: String }],
  },
  {
    timestamps: true,
  }
);
userSchema.index({ location: "2dsphere" });
const data = mongoose.model("user", userSchema);
module.exports = data;
