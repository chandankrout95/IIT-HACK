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
  { _id: false }
);

// 🛰️ Define the structure for Asteroid Telemetry
const asteroidDataSchema = new mongoose.Schema({
  neoReferenceId: { type: String, required: true },
  data: {
    id: String,
    name: String,
    position: [Number], // Stores the Array(3) coordinates
    visualSize: Number,
    realSizeMeters: String,
    is_potentially_hazardous_asteroid: Boolean,
    close_approach_data: [mongoose.Schema.Types.Mixed], // Flexible for NASA nested objects
  },
  addedAt: { type: Date },
}, { _id: false });

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    image: {
      type: String,
      default: null,
    },
    // 🛸 Allow asteroids in replies
    asteroidData: asteroidDataSchema,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    image: {
      type: String,
      default: null,
    },
    // 🛰️ Attached Asteroid Telemetry
    asteroidData: asteroidDataSchema,
    reactions: [reactionSchema],
    replies: [replySchema], 
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