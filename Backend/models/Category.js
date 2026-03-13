import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  isDefault: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;