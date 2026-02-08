import Message from "./models/message.model.js";
import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { 
      // ✅ Allow Render URL in production, localhost in development
      origin: process.env.NODE_ENV === "production" 
        ? true 
        : ["http://localhost:5173", "http://localhost:5000"],
      methods: ["GET", "POST"],
      credentials: true 
    },
  });

  // Helper function to keep population consistent across all events
  const populateMessage = (query) => {
    return query
      .populate("user", "username profilePic")        // Populate message sender
      .populate("reactions.user", "username")         // Populate people who reacted
      .populate("replies.user", "username profilePic"); // Populate reply authors
  };

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // 1. Fetch Chat History (Populated)
    try {
      const messages = await populateMessage(Message.find()).sort({ timestamp: 1 });
      socket.emit("chat-history", messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }

    // 2. New Chat Message (🛰️ Updated to handle asteroidData)
    socket.on("chat-message", async (data) => {
      try {
        const newMessage = new Message({
          user: data.user,
          text: data.text,
          image: data.image,
          asteroidData: data.asteroidData, // 🛸 Added: Save attached telemetry
          timestamp: data.timestamp || new Date(),
        });

        const savedMsg = await newMessage.save();
        
        // Re-fetch with population
        const fullMsg = await populateMessage(Message.findById(savedMsg._id));
        io.emit("chat-message", fullMsg);
      } catch (err) {
        console.error("Save failed:", err);
        // Fallback to avoid breaking the UI, though data will be unpopulated
        io.emit("chat-message", data); 
      }
    });

    // 3. Listen for Replies (🛰️ Updated with asteroidData)
    socket.on("message-reply", async ({ messageId, userId, text, image, asteroidData }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          {
            $push: {
              replies: {
                user: userId,
                text: text || "",
                image: image || null,
                asteroidData: asteroidData || null, // 🛸 Added: Save telemetry in replies
                timestamp: new Date()
              }
            }
          },
          { new: true }
        );

        if (!updatedMessage) return;

        const fullUpdatedMsg = await populateMessage(Message.findById(messageId));
        io.emit("message-updated", fullUpdatedMsg); 
      } catch (err) {
        console.error("Error saving reply:", err);
      }
    });

    // 4. Listen for Reactions
    socket.on("message-react", async ({ messageId, emoji, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        message.reactions = message.reactions || [];
        const existingIndex = message.reactions.findIndex(
          (r) => r.user.toString() === userId
        );

        if (existingIndex > -1) {
          if (message.reactions[existingIndex].emoji === emoji) {
            message.reactions.splice(existingIndex, 1);
          } else {
            message.reactions[existingIndex].emoji = emoji;
          }
        } else {
          message.reactions.push({ user: userId, emoji });
        }

        await message.save();
        
        const fullUpdatedMsg = await populateMessage(Message.findById(messageId));
        io.emit("message-updated", fullUpdatedMsg);
      } catch (err) {
        console.error("Error reacting:", err);
      }
    });

    // 5. Delete Message
    socket.on("delete-message", async ({ messageId, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.user.toString() !== userId) return;

        await Message.findByIdAndDelete(messageId);
        io.emit("message-deleted", messageId);
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};