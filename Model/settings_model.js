const mongoose = require("mongoose");
const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    notificationSettings: {
      emailNotification: { type: Boolean, default: false, enum: [true, false] }, // get notify in your email account
      reminder: { type: Boolean, default: false, enum: [true, false] }, // get notification reminder
      listing: { type: Boolean, default: false, enum: [true, false] }, // get notify when new house is listed
      doNotDistrub: { type: Boolean, default: false, enum: [true, false] }, // turn off notification
      notificationLockScreen: {
        type: Boolean,
        default: false,
        enum: [true, false],
      }, // show notification on lock screen
      statusbarNotification: {
        type: Boolean,
        default: false,
        enum: [true, false],
      }, // sjow notification on status bar
    },
    privacyAndSecurity: {
      securityLock: { type: Boolean, default: false, enum: [true, false] },
      faceIdOrFingerPrint: {
        type: Boolean,
        default: false,
        enum: [true, false],
      },
      darkMode: { type: Boolean, default: false, enum: [true, false] },
    },
  },
  {
    timestamps: true,
  }
);
const data = mongoose.model("settings", settingsSchema);
module.exports = data;
