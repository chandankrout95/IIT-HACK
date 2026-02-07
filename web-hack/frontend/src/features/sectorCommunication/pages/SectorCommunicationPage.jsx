import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import socket from "../../../socket/socket";
import MessageFeed from "../components/MessageFeed";
import MessageInput from "../components/MessageInput";
import { X, Reply, Loader2, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  setChatHistory, 
  addMessage, 
  updateMessage, 
  removeMessage 
} from "../../../redux/slices/chatSlice";

const SectorCommunicationPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { messages } = useSelector((store) => store.chat);

  // --- STATE ---
  const [replyingTo, setReplyingTo] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef(null);

  // --- 🛰️ 1. INITIAL REST API FETCH ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsFetching(true);
        // Using your specific endpoint
        const response = await axios.get("http://localhost:5000/api/v1/message/get-all", {
          withCredentials: true 
        });

        console.log(response)
        
        // Handle both standard axios response and custom data wrappers
        const history = response.data.data || response.data;
        dispatch(setChatHistory(history));
      } catch (err) {
        console.error("REST_UPLINK_FAILURE:", err);
      } finally {
        setIsFetching(false);
      }
    };

    if (user?._id) {
      fetchHistory();
    }
  }, [dispatch, user?._id]);

  // --- 🛰️ 2. REAL-TIME SOCKET LISTENERS ---
  useEffect(() => {
    if (!user?._id) return;

    // Listen for incoming live events
    socket.on("chat-message", (msg) => {
      dispatch(addMessage(msg));
      scrollToBottom();
    });

    socket.on("message-updated", (msg) => {
      dispatch(updateMessage(msg));
    });

    socket.on("message-deleted", (msgId) => {
      dispatch(removeMessage(msgId));
    });

    // Handle history pushed via socket (fallback)
    socket.on("chat-history", (msgs) => {
      dispatch(setChatHistory(msgs));
    });

    return () => {
      socket.off("chat-message");
      socket.off("message-updated");
      socket.off("message-deleted");
      socket.off("chat-history");
    };
  }, [dispatch, user?._id]);

  // --- HANDLERS ---
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = (content) => {
    const image = content?.image || null;
    const messageText = content?.text || "";

    if (!messageText && !image) return;

    if (replyingTo) {
      // 📡 EMIT REPLY
      socket.emit("message-reply", {
        messageId: replyingTo._id,
        userId: user._id,
        text: messageText,
        image: image,
      });
      setReplyingTo(null);
    } else {
      // 📡 EMIT STANDARD MESSAGE
      socket.emit("chat-message", {
        user: user._id,
        text: messageText,
        image: image,
        timestamp: new Date(),
      });
    }
  };

  const handleReact = (messageId, emoji) => {
    if (!user?._id) return;
    socket.emit("message-react", { messageId, emoji, userId: user._id });
  };

  const handleDelete = (messageId) => {
    if (!user?._id) return;
    socket.emit("delete-message", { messageId, userId: user._id });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-black/40 border border-white/10 backdrop-blur-md relative overflow-hidden font-mono shadow-2xl">
      
      {/* 📡 HEADER STATUS */}
      <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio size={18} className="text-cyan-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full blur-[2px]"></span>
          </div>
          <h2 className="text-xs font-black tracking-[0.3em] uppercase text-gray-300">
            Sector Comm-Link <span className="text-cyan-500 text-[10px] ml-2 font-mono tracking-normal">({messages.length} pkts)</span>
          </h2>
        </div>
        <div className="text-[10px] text-gray-500 italic">Encrypted // Node_{user?._id?.slice(-4)}</div>
      </div>

      {/* 📡 FEED AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={scrollRef}>
        {isFetching ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-cyan-500/50">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-[10px] uppercase tracking-widest animate-pulse">Synchronizing Data...</span>
          </div>
        ) : (
          <MessageFeed
            messages={messages}
            currentUserId={user?._id}
            onReact={handleReact}
            onDelete={handleDelete}
            onReply={(msg) => setReplyingTo(msg)}
          />
        )}
      </div>

      {/* 📡 REPLY PREVIEW BAR */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-3 bg-cyan-950/30 border-t border-cyan-500/40 flex items-center justify-between backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-1 h-8 bg-cyan-500 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Reply size={10} /> Replying to {replyingTo.user?.username || "Commander"}
                </span>
                <p className="text-[11px] text-gray-400 truncate max-w-xl italic mt-0.5">
                  {replyingTo.text || (replyingTo.image ? "Attached visual data" : "...")}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📡 INPUT AREA */}
      <div className="p-4 bg-black/20">
        <MessageInput
          userId={user?._id}
          username={user?.username || user?.name}
          onSend={handleSend}
        />
      </div>
    </div>
  );
};

export default SectorCommunicationPage;