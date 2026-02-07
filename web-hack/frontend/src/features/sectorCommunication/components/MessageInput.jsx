import React, { useState } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

const MessageInput = ({ userId, username, onSend }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const sendMessage = async () => {
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

    if (!text && !imageUrl) return;

    const messageData = {
      user: userId,
      username,
      text,
      image: imageUrl,
      timestamp: new Date(),
    };

    onSend(messageData);
    setText("");
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="p-4 bg-black/60 border-t border-white/10 z-10">
      <AnimatePresence>
        {imagePreview && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 80, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative mb-4 inline-block"
          >
            <img src={imagePreview} className="h-full w-20 object-cover border border-cyan-500/50 p-1 bg-white/5" />
            <button 
              onClick={() => {setImage(null); setImagePreview(null);}}
              className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white shadow-lg hover:bg-red-500"
            >
              <X size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <label className="cursor-pointer group">
          <ImageIcon className="text-gray-500 group-hover:text-cyan-400 transition-colors" size={20} />
          <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
        </label>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="TYPE TRANSMISSION..."
          className="flex-1 bg-transparent border-b border-white/10 py-2 text-xs text-white focus:border-cyan-500 outline-none transition-all uppercase tracking-widest placeholder:text-gray-800"
        />

        <button
          onClick={sendMessage}
          disabled={isUploading}
          className={`flex items-center gap-2 px-6 py-2 font-black italic uppercase text-xs tracking-tighter transition-all ${
            isUploading ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-cyan-600 text-black hover:bg-cyan-400"
          }`}
        >
          {isUploading ? "SYNCING..." : "SEND"}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
