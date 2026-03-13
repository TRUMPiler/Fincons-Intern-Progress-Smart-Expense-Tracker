import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  description: {
    type: String
  },

  type: {
    type: String,
    enum: ["income", "expense"],
    required: true
  },

  date: {
    type: Date,
    required: true
  },
  isDelete:{
    type:Boolean,
    default:false
  },
  deletedAt:
  {
    type:Date,
    required:false
  }
},
{
  timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;