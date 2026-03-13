import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
{
  content: {
    type: String,
    required: true
  },

  role: {
   type:String,
   required:true
  },
  isStart: {
    type: Boolean,
    default: true
  },
   userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
    isDeleted: {
        type:Boolean,
        default:false
  }
},
{
  timestamps: true
});

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;