import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);

export default Log;