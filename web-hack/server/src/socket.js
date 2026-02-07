import Message from "./models/message.model.js";
import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
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

    // 2. New Chat Message
    socket.on("chat-message", async (data) => {
      try {
        const newMessage = new Message({
          user: data.user,
          text: data.text,
          image: data.image,
          timestamp: data.timestamp,
        });

        const savedMsg = await newMessage.save();
        
        // We must re-fetch or populate the saved message to get user details
        const fullMsg = await populateMessage(Message.findById(savedMsg._id));
        
        io.emit("chat-message", fullMsg);
      } catch (err) {
        console.error("Save failed:", err);
        io.emit("chat-message", data); 
      }
    });

    // 3. Listen for Replies (🛰️ Updated with Population)
    socket.on("message-reply", async ({ messageId, userId, text, image }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          {
            $push: {
              replies: {
                user: userId,
                text: text || "",
                image: image || null,
                timestamp: new Date()
              }
            }
          },
          { new: true }
        );

        if (!updatedMessage) return;

        // Populate everything so the frontend thread shows usernames
        const fullUpdatedMsg = await populateMessage(Message.findById(messageId));
        
        io.emit("message-updated", fullUpdatedMsg); 
      } catch (err) {
        console.error("Error saving reply:", err);
      }
    });

    // 4. Listen for Reactions (Updated with Population)
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
        
        // Populate after saving to ensure reactions show user info if needed
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