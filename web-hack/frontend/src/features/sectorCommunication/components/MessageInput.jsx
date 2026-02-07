import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

const MessageInput = ({ userId, username, onSend, replyingTo }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 🛰️ AUTO-FOCUS: Focus input when user starts a reply
  const inputRef = useRef(null);
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const sendMessage = async () => {
    // 1. Prevent duplicate sends while uploading
    if (isUploading) return;

    let imageUrl = null;

    if (image) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", image);
        const res = await axios.post("http://localhost:5000/api/v1/upload", formData);
        imageUrl = res.data.imageUrl;
      } catch (err) {
        console.error("UPLOAD_FAIL:", err);
      }
      setIsUploading(false);
    }

    // 2. Updated validation
    if (!text.trim() && !imageUrl) return;

    // 3. Send the structured object to handleSend in the parent
    onSend({
      text: text.trim(),
      image: imageUrl
    });

    // 4. Reset states
    setText("");
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 bg-black/60 border-t border-white/10 z-10">
      {/* IMAGE PREVIEW AREA */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 100, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative mb-4 inline-block"
          >
            <div className="relative h-20 w-20 group">
              <img src={imagePreview} className="h-full w-full object-cover border border-cyan-500/50 p-1 bg-white/5 rounded-sm" alt="upload" />
              <button 
                onClick={() => {
                  setImage(null); 
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white shadow-lg hover:bg-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        {/* ICON BUTTONS */}
        <label className="cursor-pointer group flex-shrink-0">
          <ImageIcon className="text-gray-500 group-hover:text-cyan-400 transition-colors" size={20} />
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleImageChange} 
            accept="image/*" 
          />
        </label>
        
        {/* TEXT INPUT */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={replyingTo ? `REPLYING TO ${replyingTo.username}...` : "TYPE TRANSMISSION..."}
          className="flex-1 bg-transparent border-b border-white/10 py-2 text-[13px] text-white focus:border-cyan-500 outline-none transition-all uppercase tracking-widest placeholder:text-gray-700"
        />

        {/* SEND BUTTON */}
        <button
          onClick={sendMessage}
          disabled={isUploading || (!text.trim() && !image)}
          className={`flex items-center gap-2 px-6 py-2 font-black italic uppercase text-xs tracking-tighter transition-all rounded-sm ${
            isUploading || (!text.trim() && !image)
              ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50" 
              : "bg-cyan-600 text-black hover:bg-cyan-400 active:scale-95 shadow-[0_0_10px_rgba(8,145,178,0.2)]"
          }`}
        >
          {isUploading ? "SYNCING..." : "SEND"}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;