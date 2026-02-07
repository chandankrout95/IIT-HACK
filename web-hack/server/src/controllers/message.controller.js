import Message from "../models/message.model.js";
import User from "../models/user.model.js"; // Ensure this matches your export

/**
 * @desc    Get all chat messages with full metadata
 * @route   GET /api/v1/message/get-all
 * @access  Private
 */
export const getAllChats = async (req, res) => {
  try {
    // 🛰️ Retrieve all messages and sort by timestamp
    const messages = await Message.find()
      .sort({ timestamp: 1 })
      // 1. Populate the main message sender using FIXED field names
      .populate("user", "fullName profilePhoto role") 
      // 2. Populate authors of every reply in the thread
      .populate({
        path: "replies.user",
        select: "fullName profilePhoto role",
      })
      // 3. Populate users who added reactions
      .populate({
        path: "reactions.user",
        select: "fullName",
      });

    // Handle case where messages is empty
    if (!messages || messages.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("GET_CHATS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Uplink failed: Could not retrieve chat history.",
      error: error.message,
    });
  }
};