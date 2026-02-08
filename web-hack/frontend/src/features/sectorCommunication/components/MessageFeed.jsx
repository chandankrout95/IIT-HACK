import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Trash2, X, Reply , Orbit  , Activity} from "lucide-react";

const EMOJIS = ["🚀", "☄️", "🛡️", "🔴", "📡"];


const MessageItem = ({ msg, isMe, isFirstInGroup, isLastInGroup, currentUserId, isActive, setActiveMessageId, onReact, onDelete, onReply, hasReactions }) => {
  const x = useMotionValue(0);
  const iconOpacity = useTransform(x, [0, 50], [0, 1]);
  const iconScale = useTransform(x, [0, 50], [0.5, 1.2]);

  const formatTimestamp = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 50) onReply(msg);
  };

  const hasMyReaction = (emoji) =>
    msg.reactions?.some((r) => (r.user?._id || r.user) === currentUserId && r.emoji === emoji);

  const senderName = msg.user?.username || msg.user?.fullName || "Unknown Operative";

  // 🛰️ Sub-component for Asteroid Display
  const AsteroidCard = ({ asteroid, compact = false }) => {
    if (!asteroid) return null;
    const data = asteroid.data || asteroid; // Handle both structures
    return (
      <div className={`mt-2 border border-cyan-500/30 bg-cyan-950/20 rounded-sm overflow-hidden font-mono ${compact ? 'p-1.5' : 'p-3'}`}>
        <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-1.5 mb-2">
          <Orbit size={compact ? 12 : 16} className="text-cyan-400 animate-pulse" />
          <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-black text-white uppercase tracking-tighter`}>
            NEO: {data.name}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex flex-col">
            <span className="text-[7px] text-cyan-500/60 uppercase">Reference ID</span>
            <span className="text-[9px] text-cyan-200">{asteroid.neoReferenceId || data.id}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[7px] text-cyan-500/60 uppercase">Diameter</span>
            <span className="text-[9px] text-cyan-200">{data.realSizeMeters || "???"}m</span>
          </div>
        </div>
        {!compact && (
          <div className="mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
             <span className="text-[8px] text-cyan-500/40 tracking-widest italic uppercase">Uplink Active</span>
             <Activity size={10} className="text-cyan-600" />
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isMe ? 10 : -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex flex-col ${isMe ? "items-end" : "items-start"} message-bubble relative group w-full`}
      style={{ marginBottom: isLastInGroup ? "1.2rem" : hasReactions ? "18px" : "3px" }}
    >
      {isFirstInGroup && (
        <div className={`flex items-baseline gap-2 mb-1 px-1 mt-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isMe ? "text-cyan-400" : "text-purple-400"}`}>
            {isMe ? "You" : senderName}
          </span>
          <span className="text-[8px] text-gray-500 font-mono opacity-60">
            [{formatTimestamp(msg.createdAt || msg.timestamp)}]
          </span>
        </div>
      )}

      {!isMe && (
        <motion.div style={{ opacity: iconOpacity, scale: iconScale }} className="absolute left-[-40px] top-1/2 -translate-y-1/2 text-cyan-400">
          <Reply size={20} />
        </motion.div>
      )}

      <motion.div
        drag={!isMe ? "x" : false}
        dragConstraints={{ left: 0, right: 60 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onDoubleClick={(e) => { e.stopPropagation(); setActiveMessageId(isActive ? null : msg._id); }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMessageId(isActive ? null : msg._id); }}
        className={`relative max-w-[85%] p-3 border transition-all duration-200 cursor-grab active:cursor-grabbing
          ${isMe ? "bg-cyan-950/20 border-cyan-500/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]" : "bg-white/5 border-white/10"}
          ${isActive ? "ring-1 ring-cyan-500/40 border-cyan-500/60 z-20 shadow-[0_0_20px_rgba(6,182,212,0.15)]" : "z-10"}
        `}
        style={{
          x,
          borderRadius: "8px",
          borderTopLeftRadius: !isMe && !isFirstInGroup ? "2px" : "8px",
          borderTopRightRadius: isMe && !isFirstInGroup ? "2px" : "8px",
        }}
      >
        {/* TEXT CONTENT */}
        {msg.text && <p className="text-[13px] text-gray-200 leading-snug select-text font-sans">{msg.text}</p>}

        {/* 🛰️ ASTEROID TELEMETRY (Main Message) */}
        {msg.asteroidData && <AsteroidCard asteroid={msg.asteroidData} />}

        {/* IMAGE CONTENT */}
        {msg.image && (
          <div className="mt-2 rounded-sm overflow-hidden border border-white/5">
            <img src={msg.image} alt="uplink" className="max-h-60 w-full object-cover" />
          </div>
        )}

        {/* 🛰️ REPLIES THREAD */}
        {msg.replies && msg.replies.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/5 flex flex-col gap-2">
            {msg.replies.map((reply, rid) => (
              <div key={rid} className="flex flex-col gap-1 pl-2 border-l-2 border-cyan-500/30 bg-white/5 p-2 rounded-r-sm">
                 <div className="flex justify-between items-center gap-4">
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter">
                      {reply.user?.username || reply.user?.fullName || "Signal"}
                    </span>
                 </div>
                 {reply.text && <p className="text-[11px] text-gray-300 leading-tight">{reply.text}</p>}
                 {/* 🛰️ Asteroid in Reply */}
                 {reply.asteroidData && <AsteroidCard asteroid={reply.asteroidData} compact={true} />}
                 {reply.image && (
                    <img src={reply.image} className="mt-1 max-h-32 rounded-sm border border-white/10" alt="reply-img" />
                 )}
              </div>
            ))}
          </div>
        )}

        {/* HUD MENU - Remains the same */}
        <AnimatePresence>
          {isActive && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 5 }} onClick={(e) => e.stopPropagation()}
              className={`absolute z-50 -top-12 ${isMe ? "right-0" : "left-0"} bg-[#080808] border border-cyan-500/40 backdrop-blur-xl p-1.5 rounded-lg flex items-center gap-1 shadow-2xl`}
            >
              <div className="flex gap-1.5 px-2 border-r border-white/10">
                {EMOJIS.map((emoji) => (
                  <button key={emoji} onClick={() => { onReact(msg._id, emoji); setActiveMessageId(null); }}
                    className={`text-base transition-all rounded px-1 py-0.5 ${hasMyReaction(emoji) ? "bg-cyan-500/30 ring-1 ring-cyan-400 scale-125" : "hover:scale-125 opacity-60 hover:opacity-100"}`}
                  >{emoji}</button>
                ))}
              </div>
              <div className="flex items-center gap-1 px-1">
                <button onClick={() => { onReply(msg); setActiveMessageId(null); }} className="p-1.5 text-cyan-400 hover:bg-cyan-500/20 rounded"><Reply size={14} /></button>
                {isMe && <button onClick={() => { onDelete(msg._id); setActiveMessageId(null); }} className="p-1.5 text-red-500 hover:bg-red-500/20 rounded"><Trash2 size={14} /></button>}
                <button onClick={() => setActiveMessageId(null)} className="p-1.5 text-gray-400 hover:bg-white/10 rounded"><X size={14} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REACTION PILLS */}
        {hasReactions && (
          <div className={`absolute bottom-[-10px] flex gap-1.5 ${isMe ? "right-2" : "left-2"}`}>
            {msg.reactions.map((r, i) => (
              <motion.span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${ (r.user?._id || r.user) === currentUserId ? "bg-cyan-950/90 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "bg-[#0a0a0a] border-white/10 text-gray-500"}`}>{r.emoji}</motion.span>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const MessageFeed = ({ messages, currentUserId, onDelete, onReact, onReply }) => {
  const messagesEndRef = useRef(null);
  const [activeMessageId, setActiveMessageId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMessageId && !e.target.closest(".message-bubble")) setActiveMessageId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMessageId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative bg-black/20 overflow-x-hidden">
      <div className="flex flex-col">
        {messages?.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];
          
          // Logic for grouping messages by user
          const isFirstInGroup = !prevMsg || (prevMsg.user?._id || prevMsg.user) !== (msg.user?._id || msg.user);
          const isLastInGroup = !nextMsg || (nextMsg.user?._id || nextMsg.user) !== (msg.user?._id || msg.user);

          return (
            <MessageItem
              key={msg._id || idx}
              msg={msg}
              isMe={(msg.user?._id || msg.user) === currentUserId}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
              currentUserId={currentUserId}
              isActive={activeMessageId === msg._id}
              setActiveMessageId={setActiveMessageId}
              onReact={onReact}
              onDelete={onDelete}
              onReply={onReply}
              hasReactions={msg.reactions && msg.reactions.length > 0}
            />
          );
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageFeed;