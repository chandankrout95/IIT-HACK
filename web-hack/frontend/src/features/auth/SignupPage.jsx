import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  UserPlus, Mail, Lock, ChevronRight, Cpu, Eye, EyeOff, Loader2, Beaker, UserCircle
} from "lucide-react";
import { setUser } from "../../redux/slices/authSlice";
import { useToast } from "../../context/ToastContext";

const SignupPage = () => {
  const showToast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "enthusiast",
  });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { fullName, email, password } = formData;
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showToast("INCOMPLETE_DATA: All fields required", "error");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("INVALID_NODE: Email format incorrect", "error");
      return false;
    }
    if (password.length < 8) {
      showToast("WEAK_ENCRYPTION: 8 Characters Minimum", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/signup",
        formData,
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        showToast("ENLISTMENT_SUCCESSFUL: Access Granted", "success");
        dispatch(setUser(response.data.data.user));
        navigate("/visualizer");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "UPLINK_FAILURE: Connection lost", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-mono text-white focus:border-red-600/50 outline-none transition-all focus:bg-white/[0.08]";

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg">
        <div className="bg-[#0A0A0A]/90 border border-white/20 p-10 shadow-2xl backdrop-blur-xl relative">
          
          {/* 🛰️ ANTI-AUTOFILL HONEYPOT: Hidden fields to catch browser autofill attempts */}
          <div className="sr-only" aria-hidden="true">
            <input type="text" name="username" tabIndex="-1" />
            <input type="password" name="password" tabIndex="-1" />
          </div>

          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">New Enlistment</h2>
            <p className="text-[9px] text-red-500 font-mono tracking-[0.3em] uppercase mt-2 font-bold underline underline-offset-4">Security Protocol cusmic watch</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Assigned Designation</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'enthusiast'})}
                  className={`flex items-center justify-center gap-2 p-3 border font-mono text-[10px] uppercase transition-all ${
                    formData.role === 'enthusiast' 
                    ? 'bg-red-600/20 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                  }`}
                >
                  <UserCircle size={14} /> Enthusiast
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'researcher'})}
                  className={`flex items-center justify-center gap-2 p-3 border font-mono text-[10px] uppercase transition-all ${
                    formData.role === 'researcher' 
                    ? 'bg-red-600/20 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                  }`}
                >
                  <Beaker size={14} /> Researcher
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    type="text"
                    autoComplete="off" // 🚀 Standard off
                    className={inputClasses}
                    placeholder="MILLER. J"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Email </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    autoComplete="new-password" // 🚀 Trick: Browsers won't autofill emails into 'new-password'
                    className={inputClasses}
                    placeholder="NODE@STATION.COM"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center pr-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Password</label>
                <span className={`text-[8px] font-mono ${formData.password.length >= 8 ? 'text-green-500' : 'text-gray-600'}`}>
                  {formData.password.length >= 8 ? 'VALID_ENCRYPTION' : '8_CHAR_REQUIRED'}
                </span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors" size={16} />
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  autoComplete="one-time-code" // 🚀 Trick: Prevents password managers from suggesting "Save Password"
                  className={`${inputClasses} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Handshake UI */}
            <div className="p-4 bg-red-950/10 border border-red-900/20 flex items-center gap-4">
              <Cpu size={20} className="text-red-600 animate-pulse" />
              <div className="text-left font-mono">
                <p className="text-[10px] text-red-400 uppercase tracking-tighter">Handshake Protocol</p>
                <p className="text-[8px] text-gray-600 uppercase">
                  {formData.role === 'researcher' ? "Allocating Research Uplink..." : "Allocating Enthusiast Node..."}
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-red-600 py-5 font-black uppercase text-xs tracking-[0.4em] text-white hover:bg-red-500 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <>Signing up... <Loader2 size={18} className="animate-spin" /></>
              ) : (
                <>Sign up <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-gray-600 font-mono tracking-widest uppercase">
            Uplink Active?
            <button onClick={() => navigate("/login")} className="ml-2 text-red-500 hover:text-red-400 font-black italic border-b border-red-500/30">
               Login
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;