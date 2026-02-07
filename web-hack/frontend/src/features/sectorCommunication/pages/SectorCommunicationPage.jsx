import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import socket from "../../../socket/socket";
import MessageFeed from "../components/MessageFeed";
import MessageInput from "../components/MessageInput";
import { setChatHistory, addMessage, updateMessage, removeMessage } from "../../../redux/slices/chatSlice";

const SectorCommunicationPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { messages } = useSelector((store) => store.chat);

  useEffect(() => {
    if (!user?._id) return;

    // 1️⃣ Initial chat history
    socket.on("chat-history", (msgs) => dispatch(setChatHistory(msgs)));
    socket.on("chat-message", (msg) => dispatch(addMessage(msg)));

    // 2️⃣ Real-time updates for reactions or edits
    socket.on("message-updated", (msg) => dispatch(updateMessage(msg)));

    // 3️⃣ Real-time message deletions
    socket.on("message-deleted", (msgId) => dispatch(removeMessage(msgId)));

    return () => {
      socket.off("chat-history");
      socket.off("chat-message");
      socket.off("message-updated");
      socket.off("message-deleted");
    };
  }, [dispatch, user?._id]);

  // Send a new message
  const handleSend = (text, image) => {
  if (!text.text && !image) return;

  socket.emit("chat-message", {
    user: user._id,
    text: text.text,   // must be string
    image: image || null,
    timestamp: new Date(),
  });
};


  // Send reaction (with userId)
  const handleReact = (messageId, emoji) => {
    if (!user?._id) return;
    socket.emit("message-react", { messageId, emoji, userId: user._id });
  };

  // Delete message (with userId for validation)
  const handleDelete = (messageId) => {
    if (!user?._id) return;
    socket.emit("delete-message", { messageId, userId: user._id });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-black/40 border border-white/10 backdrop-blur-md relative overflow-hidden font-mono">
      {/* HEADER */}
      {/* You can insert your header here */}

      <MessageFeed
        messages={messages}
        currentUserId={user?._id}
        onReact={handleReact}
        onDelete={handleDelete}
      />

      <MessageInput
        userId={user?._id}
        username={user?.username || user?.name}
        onSend={handleSend}
      />
    </div>
  );
};

export default SectorCommunicationPage;
