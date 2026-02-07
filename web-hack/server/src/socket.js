import Message from "./models/message.model.js";
import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }, // adjust for production
  });

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // Send existing messages to new user
    try {
      const messages = await Message.find().sort({ timestamp: 1 });
      socket.emit("chat-history", messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }

    // Listen for new messages
   // Correct
socket.on("chat-message", async (data) => {
  try {
    // Validate
    if (!data || typeof data.text !== "string") {
      console.error("Invalid message data:", data);
      return;
    }

    const message = new Message({
      user: data.user,
      text: data.text,
      image: data.image || null,
      timestamp: data.timestamp || Date.now(),
    });

    await message.save();
    io.emit("chat-message", message);
  } catch (err) {
    console.error("Error saving message:", err);
  }
});



    // Listen for reactions
socket.on("message-react", async ({ messageId, emoji, userId }) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) return;

    message.reactions = message.reactions || [];

    // Find existing reaction by this user
    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // User clicked the same emoji again -> remove reaction
        message.reactions.splice(existingIndex, 1);
      } else {
        // Replace with new emoji
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();
    io.emit("message-updated", message); // broadcast updated message
  } catch (err) {
    console.error("Error reacting to message:", err);
  }
});



    // Listen for message deletion
    socket.on("delete-message", async ({ messageId, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        // Only allow sender to delete
        if (message.user.toString() !== userId) return;

        await Message.findByIdAndDelete(messageId);
        io.emit("message-deleted", messageId); // notify all clients
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
