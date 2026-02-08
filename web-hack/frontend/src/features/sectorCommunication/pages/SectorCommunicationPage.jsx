import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import socket from "../../../socket/socket";
import MessageFeed from "../components/MessageFeed";
import MessageInput from "../components/MessageInput";
import TelemetryModal from "../components/TelemetryModal"; // 🛰️ Import the modal component
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
  
  // 🛰️ Pulling live asteroids from your existing store for suggestions
  const { asteroids } = useSelector((store) => store.asteroid || { asteroids: [] });

  // --- STATE ---
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachedAsteroid, setAttachedAsteroid] = useState(null); // 🛸 Attached Telemetry State
  const [isModalOpen, setIsModalOpen] = useState(false); // 🔍 Modal visibility
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef(null);

  // --- 🛰️ 1. INITIAL REST API FETCH ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsFetching(true);
        const response = await axios.get("http://localhost:5000/api/v1/message/get-all", {
          withCredentials: true 
        });
        const history = response.data.data || response.data;
        dispatch(setChatHistory(history));
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("REST_UPLINK_FAILURE:", err);
      } finally {
        setIsFetching(false);
      }
    };

    if (user?._id) fetchHistory();
  }, [dispatch, user?._id]);

  // --- 🛰️ 2. REAL-TIME SOCKET LISTENERS ---
  useEffect(() => {
    if (!user?._id) return;

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

    return () => {
      socket.off("chat-message");
      socket.off("message-updated");
      socket.off("message-deleted");
    };
  }, [dispatch, user?._id]);

  // --- HANDLERS ---
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = (content) => {
    const { text, image, asteroidData } = content;

    // Prevent empty transmissions
    if (!text && !image && !asteroidData) return;

    const payload = {
      user: user._id,
      text: text,
      image: image,
      asteroidData: asteroidData, // 🛰️ Link the NASA telemetry object
      timestamp: new Date(),
    };

    if (replyingTo) {
      socket.emit("message-reply", {
        ...payload,
        messageId: replyingTo._id,
      });
      setReplyingTo(null);
    } else {
      socket.emit("chat-message", payload);
    }

    setAttachedAsteroid(null); // Clear buffer after send
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-black/40 border border-white/10 backdrop-blur-md relative overflow-hidden font-mono shadow-2xl">
      
      {/* 📡 TELEMETRY MODAL OVERLAY */}
      <TelemetryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        savedAsteroids={asteroids}
        onSelect={(neo) => {
          setAttachedAsteroid(neo);
          setIsModalOpen(false);
        }}
      />

      {/* 📡 HEADER STATUS */}
      <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio size={18} className="text-cyan-500 animate-pulse" />
          </div>
          <h2 className="text-xs font-black tracking-[0.3em] uppercase text-gray-300">
            Community 
          </h2>
        </div>
        <div className="text-[10px] text-gray-500 italic uppercase">Node_{user?._id?.slice(-4)}</div>
      </div>

      {/* 📡 FEED AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4" ref={scrollRef}>
        {isFetching ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-cyan-500/50">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-[10px] uppercase tracking-widest">Syncing Data...</span>
          </div>
        ) : (
          <MessageFeed
            messages={messages}
            currentUserId={user?._id}
            onReact={(id, emoji) => socket.emit("message-react", { messageId: id, emoji, userId: user._id })}
            onDelete={(id) => socket.emit("delete-message", { messageId: id, userId: user._id })}
            onReply={(msg) => setReplyingTo(msg)}
          />
        )}
      </div>

      {/* 📡 REPLY PREVIEW BAR */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="px-6 py-3 bg-cyan-950/30 border-t border-cyan-500/40 flex items-center justify-between backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-1 h-8 bg-cyan-500 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Reply size={10} /> Replying to {replyingTo.user?.username}
                </span>
                <p className="text-[11px] text-gray-400 truncate italic">{replyingTo.text || "Visual Data"}</p>
              </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📡 INPUT AREA */}
      <div className="p-4 bg-black/20">
        <MessageInput
          userId={user?._id}
          username={user?.username || user?.name}
          onSend={handleSend}
          replyingTo={replyingTo}
          attachedAsteroid={attachedAsteroid}
          onOpenTelemetry={() => setIsModalOpen(true)} // 🛰️ Passed to trigger the database button
          onClearAttachment={() => setAttachedAsteroid(null)}
        />
      </div>
    </div>
  );
};

export default SectorCommunicationPage;