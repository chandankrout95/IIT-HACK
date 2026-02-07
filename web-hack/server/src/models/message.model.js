import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
  },
  { _id: false } // reactions don’t need their own _id
);

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the sender
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    image: {
      type: String, // Cloudinary URL
    },
    reactions: [reactionSchema], // array of reaction objects
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
