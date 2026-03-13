import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  month: {
    type: Number,
    required: true
  },

  year: {
    type: Number,
    required: true
  },

  limit: {
    type: Number,
    required: true
  }
},
{
  timestamps: true
});

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;