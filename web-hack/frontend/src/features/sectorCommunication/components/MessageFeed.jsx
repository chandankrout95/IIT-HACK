import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Trash2, X, Reply } from "lucide-react";

const EMOJIS = ["🚀", "☄️", "🛡️", "🔴", "📡"];

const MessageFeed = ({
  messages,
  currentUserId,
  onDelete,
  onReact,
  onReply,
}) => {
  const messagesEndRef = useRef(null);
  const [activeMessageId, setActiveMessageId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMessageId && !e.target.closest(".message-bubble")) {
        setActiveMessageId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMessageId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative bg-black/20 overflow-x-hidden">
      <div className="flex flex-col">
        {messages?.map((msg, idx) => {
          const isMe = msg.user === currentUserId;
          const isActive = activeMessageId === msg._id;

          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];
          const isFirstInGroup = !prevMsg || prevMsg.user !== msg.user;
          const isLastInGroup = !nextMsg || nextMsg.user !== msg.user;
          const hasReactions = msg.reactions && msg.reactions.length > 0;

          const hasMyReaction = (emoji) =>
            msg.reactions?.some(
              (r) => r.user === currentUserId && r.emoji === emoji,
            );

          const getMarginBottom = () => {
            if (isLastInGroup) return "1.2rem";
            if (hasReactions) return "18px";
            return "3px";
          };

          // 🛠️ Swipe to Reply Logic
          const x = useMotionValue(0);
          const iconOpacity = useTransform(x, [0, 50], [0, 1]);
          const iconScale = useTransform(x, [0, 50], [0.5, 1.2]);

          const handleDragEnd = (_, info) => {
            // If swiped more than 50px to the right
            if (info.offset.x > 50) {
              onReply(msg);
            }
          };

          return (
            <motion.div
              key={msg._id || idx}
              initial={{ opacity: 0, x: isMe ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ marginBottom: getMarginBottom() }}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} message-bubble relative group`}
            >
              {isFirstInGroup && (
                <div
                  className={`flex items-center gap-2 mb-1 px-1 mt-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <span
                    className={`text-[9px] font-black uppercase italic tracking-widest ${isMe ? "text-cyan-400" : "text-purple-500"}`}
                  >
                    {msg.username}
                  </span>
                </div>
              )}

              {/* REPLY ICON (Revealed on Swipe) */}
              {!isMe && (
                <motion.div
                  style={{ opacity: iconOpacity, scale: iconScale }}
                  className="absolute left-[-40px] top-1/2 -translate-y-1/2 text-cyan-400"
                >
                  <Reply size={20} />
                </motion.div>
              )}
              <motion.div
                drag={!isMe ? "x" : false}
                dragConstraints={{ left: 0, right: 60 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setActiveMessageId(isActive ? null : msg._id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveMessageId(isActive ? null : msg._id);
                }}
                className={`relative max-w-[85%] p-3 border transition-all duration-200 cursor-grab active:cursor-grabbing
    ${isMe ? "bg-cyan-950/20 border-cyan-500/20" : "bg-white/5 border-white/10"}
    ${isActive ? "ring-2 ring-cyan-500/40 border-cyan-500/60 z-20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "z-10"}
  `}
                // ✅ MERGED BOTH INTO ONE STYLE OBJECT
                style={{
                  x, // This is the motion value for swiping
                  borderTopLeftRadius:
                    !isMe && isFirstInGroup ? "12px" : isMe ? "12px" : "4px",
                  borderTopRightRadius:
                    isMe && isFirstInGroup ? "12px" : !isMe ? "12px" : "4px",
                  borderBottomLeftRadius:
                    !isMe && isLastInGroup ? "12px" : "4px",
                  borderBottomRightRadius:
                    isMe && isLastInGroup ? "12px" : "4px",
                }}
              >
                {/* REPLIED-TO MESSAGE PREVIEW (Optional: add if you have msg.replyTo) */}
                {msg.replyTo && (
                  <div className="mb-2 p-2 bg-white/5 border-l-2 border-cyan-500 text-[11px] opacity-60 rounded-r">
                    {msg.replyTo.text}
                  </div>
                )}

                {msg.text && (
                  <p className="text-[13px] text-gray-200 leading-snug font-sans select-text">
                    {msg.text}
                  </p>
                )}

                {msg.image && (
                  <div className="mt-1 rounded-sm overflow-hidden border border-white/5">
                    <img
                      src={msg.image}
                      alt="uplink"
                      className="max-h-60 w-full object-cover"
                    />
                  </div>
                )}

                {/* ⚡ ACTION HUB */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute z-50 -top-12 ${isMe ? "right-0" : "left-0"} 
                        bg-[#080808] border border-cyan-500/40 backdrop-blur-xl p-1.5 rounded-lg flex items-center gap-1 shadow-2xl ring-1 ring-white/10`}
                    >
                      <div className="flex gap-1.5 px-2 border-r border-white/10">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              onReact(msg._id, emoji);
                              setActiveMessageId(null);
                            }}
                            className={`text-base transition-all rounded px-1 py-0.5 ${hasMyReaction(emoji) ? "bg-cyan-500/30 ring-1 ring-cyan-400 scale-125" : "hover:scale-125 opacity-60 hover:opacity-100"}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 px-1">
                        {/* REPLY BUTTON IN HUB */}
                        <button
                          onClick={() => {
                            onReply(msg);
                            setActiveMessageId(null);
                          }}
                          className="p-1.5 text-cyan-400 hover:bg-cyan-500/20 rounded transition-colors"
                          title="Reply to signal"
                        >
                          <Reply size={14} />
                        </button>

                        {isMe && (
                          <button
                            onClick={() => {
                              onDelete(msg._id);
                              setActiveMessageId(null);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setActiveMessageId(null)}
                          className="p-1.5 text-gray-400 hover:bg-white/10 rounded transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* REACTIONS PILLS */}
                {hasReactions && (
                  <div
                    className={`absolute bottom-[-10px] flex gap-1.5 ${isMe ? "right-2" : "left-2"}`}
                  >
                    {msg.reactions.map((r, i) => (
                      <motion.span
                        key={`${r.user}-${i}`}
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${r.user === currentUserId ? "bg-cyan-950/90 border-cyan-400 text-cyan-400" : "bg-[#0a0a0a] border-white/10 text-gray-500"}`}
                      >
                        {r.emoji}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageFeed;
