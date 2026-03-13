import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  message: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["budget_exceeded", "overspending"]
  },

  isRead: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;