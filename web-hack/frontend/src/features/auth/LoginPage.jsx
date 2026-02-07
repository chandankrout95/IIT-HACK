import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser } from '../../redux/slices/authSlice';
import { useToast } from "../../context/ToastContext"; // 🛰️ Added your global toast
import { Lock, Mail, ShieldCheck, ChevronRight, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const showToast = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/auth/login', 
        formData, 
        { withCredentials: true } 
      );

      if (response.data.status === 'success') {
        showToast("ACCESS_GRANTED: Terminal Linked", "success");
        dispatch(setUser(response.data.data.user));
        // ❌ Removed localStorage (as per your cookie-only requirement)
        navigate('/visualizer'); // Navigate to your protected route
      }
    } catch (err) {
      setIsError(true);
      const msg = err.response?.data?.message || "UPLINK_DENIED: Credential Mismatch";
      showToast(msg, "error");
      setTimeout(() => setIsError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, x: isError ? [0, -10, 10, -10, 10, 0] : 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#0A0A0A]/90 border border-white/20 p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />

          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-red-600/5 border border-red-600/50 flex items-center justify-center mb-4">
              <ShieldCheck className="text-red-500" size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Terminal Login</h2>
            <p className="text-[9px] text-red-500/70 font-mono tracking-widest uppercase mt-3">Authentication Required</p>
          </div>

          {/* 🚀 Fix: Added autoComplete="off" to form */}
          <form onSubmit={handleLogin} className="space-y-6" noValidate autoComplete="off">
            
            <div className="group space-y-2 text-left">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] ml-1">Email </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-red-500 transition-colors" size={16} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  autoComplete="off" // 🚀 Prevents email suggestions
                  className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 font-mono text-sm text-white focus:border-red-600 outline-none transition-all"
                  placeholder="node@cosmicwatch.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="group space-y-2 text-left">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-red-500 transition-colors" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  autoComplete="new-password" // 🚀 Prevents pre-filling saved passwords
                  className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 pr-12 font-mono text-sm text-white focus:border-red-600 outline-none transition-all"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 py-5 font-black uppercase text-xs tracking-[0.4em] text-white hover:bg-red-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>SYNCING <Loader2 className="animate-spin" size={18} /></>
              ) : (
                <>SYNC TERMINAL <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
              <p className="text-[11px] font-mono text-gray-500 tracking-widest uppercase">
                  No account? 
                  <button onClick={() => navigate('/signup')} className="ml-2 text-red-500 hover:text-red-400 font-black italic">
                      Sign Up
                  </button>
              </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;