import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Terminal, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = useCallback((message, type = 'error') => {
    setToast({ show: true, message, type });
    // Automatically hide after 3 seconds
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      
      {/* GLOBAL TOAST UI */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-10 left-1/2 z-[9999] flex items-center gap-3 px-6 py-3 bg-[#0A0A0A] border border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.3)] backdrop-blur-xl min-w-[300px]"
          >
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            <AlertTriangle size={18} className="text-red-500 relative z-10" />
            <span className="text-red-500 font-mono text-[10px] uppercase tracking-[0.2em] relative z-10 flex-1">
              {toast.message}
            </span>
            <button onClick={() => setToast({ ...toast, show: false })} className="relative z-10 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

// Custom Hook for easy access
export const useToast = () => useContext(ToastContext);