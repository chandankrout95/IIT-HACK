import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, X, Link, Orbit, Database, Crosshair } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

const MessageInput = ({ 
  userId, 
  username, 
  onSend, 
  replyingTo, 
  attachedAsteroid, 
  onClearAttachment,
  onOpenTelemetry 
}) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(false); 
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (attachedAsteroid) {
      setShowInfo(true);
      const timer = setTimeout(() => setShowInfo(false), 4000);
      inputRef.current?.focus();
      return () => clearTimeout(timer);
    }
  }, [attachedAsteroid]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const sendMessage = async () => {
    if (isUploading) return;
    let imageUrl = null;
    if (image) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", image);
        const res = await axios.post("http://localhost:5000/api/v1/upload", formData);
        imageUrl = res.data.imageUrl;
      } catch (err) { console.error("UPLOAD_FAIL:", err); }
      setIsUploading(false);
    }
    if (!text.trim() && !imageUrl && !attachedAsteroid) return;

    onSend({
      text: text.trim(),
      image: imageUrl,
      asteroidData: attachedAsteroid 
    });

    setText("");
    setImage(null);
    setImagePreview(null);
    if (onClearAttachment) onClearAttachment(); 
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 bg-black/60 border-t border-white/10 z-10 relative">
      
      {/* 🛰️ DROP NOTIFICATION POPUP (TOP CENTER) */}
      <AnimatePresence>
        {showInfo && attachedAsteroid && (
          <motion.div
            initial={{ y: -20, x: "-50%", opacity: 0 }}
            animate={{ y: -60, x: "-50%", opacity: 1 }}
            exit={{ y: -80, x: "-50%", opacity: 0 }}
            className="fixed left-1/2 bg-cyan-500 border border-cyan-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.5)] z-[100]"
          >
            <Crosshair size={16} className="text-black animate-spin-slow" />
            <span className="text-[10px] font-black text-black uppercase tracking-tighter">
              Telemetry Locked: {attachedAsteroid.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📡 ATTACHMENT PREVIEW DRAWER */}
      <AnimatePresence>
        {(imagePreview || attachedAsteroid) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-4 mb-4 items-end overflow-hidden"
          >
            {imagePreview && (
              <div className="relative h-20 w-20 flex-shrink-0">
                <img src={imagePreview} className="h-full w-full object-cover border border-cyan-500/50 p-1 bg-white/5" alt="upload" />
                <button onClick={() => { setImage(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white"><X size={12} /></button>
              </div>
            )}

            {attachedAsteroid && (
              <div className="h-20 flex items-center gap-3 bg-cyan-950/40 border border-cyan-500/30 px-4 py-2 rounded-sm relative group min-w-[200px]">
                <div className="bg-cyan-500/20 p-2 rounded-full"><Orbit size={20} className="text-cyan-400 animate-spin-slow" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Linked Telemetry</span>
                  <span className="text-sm text-white font-bold italic uppercase">{attachedAsteroid.name}</span>
                </div>
                <button onClick={onClearAttachment} className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white"><X size={12} /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        {/* ACTION ICONS */}
        <div className="flex items-center gap-4 border-r border-white/10 pr-4">
          <label className="cursor-pointer group flex items-center justify-center">
            <ImageIcon className="text-gray-400 group-hover:text-cyan-400 transition-colors" size={20} />
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
          </label>
          
          {/* 🛰️ DATABASE ICON CONTAINER */}
          <div className="relative flex items-center justify-center">
            <button 
              type="button"
              onClick={onOpenTelemetry}
              className="text-gray-400 hover:text-cyan-400 transition-all active:scale-90"
            >
              <Database size={20} />
            </button>

            {/* 🛰️ THE POPUP HINT (Only shows if no asteroid is attached) */}
            <AnimatePresence>
              {!attachedAsteroid && (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, y: -45, x: "-50%" }}
                  className="absolute left-1/2 whitespace-nowrap z-50 pointer-events-none"
                >
                  <div className="bg-cyan-600 text-black text-[9px] font-black px-3 py-1.5 rounded shadow-[0_0_15px_rgba(6,182,212,0.4)] uppercase tracking-tighter">
                    Attach Asteroid Data
                    {/* Tiny Arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-600 rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder={attachedAsteroid ? `DESCRIBE ANOMALY: ${attachedAsteroid.name}...` : "SEND TRANSMISSION..."}
          className="flex-1 bg-transparent py-2 text-[14px] text-white focus:border-cyan-500 outline-none transition-all uppercase tracking-[0.1em] font-medium"
        />

        <button
          onClick={sendMessage}
          disabled={isUploading || (!text.trim() && !image && !attachedAsteroid)}
          className={`flex items-center gap-2 px-8 py-2.5 font-black italic uppercase text-xs tracking-tighter transition-all rounded-sm ${
            isUploading || (!text.trim() && !image && !attachedAsteroid)
              ? "bg-gray-800 text-gray-600 cursor-not-allowed" 
              : "bg-cyan-600 text-black hover:bg-cyan-400 active:scale-95 shadow-[0_0_15px_rgba(8,145,178,0.3)]"
          }`}
        >
          {isUploading ? "SYNC..." : "SEND"}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;