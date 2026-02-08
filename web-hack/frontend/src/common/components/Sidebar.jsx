import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // 🛰️ Added useSelector
import axios from 'axios';
import { logout as logoutAction } from '../../redux/slices/authSlice';
import { useToast } from "../../context/ToastContext";
import { 
  LayoutDashboard, Radio, Orbit, MessageSquare, BellDot, 
  Settings, Power, Terminal as TerminalIcon, Activity,
  Database, BarChart3, Bookmark, ShieldAlert, Cpu
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const showToast = useToast();
  
  // 🛰️ Pulling user role to show Clearance Level
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/v1/auth/logout', {}, { withCredentials: true });
      dispatch(logoutAction());
      localStorage.clear();
      showToast("SESSION_TERMINATED: Connection Closed", "success");
      navigate('/login');
    } catch (err) {
      showToast("LOGOUT_FAILED: Protocol Error", "error");
    }
  };

  const navigation = [
    { 
      group: "Mission Ops", 
      items: [
        { label: "Orbital Map", icon: <Orbit size={18} />, path: "/visualizer", desc: "3D Orbit View" },
        { label: "Asteroid calnder", icon: <LayoutDashboard size={18} />, path: "/command", desc: "check all the asteroids" },
        // { label: "Radar Sweep", icon: <Radio size={18} />, path: "/radar", desc: "Live API Feed" },
      ]
    },
    { 
      group: "Intelligence", 
      items: [
        { label: "Community", icon: <MessageSquare size={18} />, path: "/sector-com", desc: "Global Chat" },
        { label: "Alert Feed", icon: <BellDot size={18} />, path: "/alert-feed", desc: "Close Approaches" },
      ]
    },
    { 
      group: "Data Archives", 
      items: [
        // 🚀 NEW: Saved Asteroids Requirement
        { label: "Watched Vault", icon: <Bookmark size={18} />, path: "/telemetry-vault", desc: "Saved Asteroids" },
        // 🚀 NEW: Data Visualizer Requirement
        // { label: "Quantum Engine", icon: <BarChart3 size={18} />, path: "/quantum-engine", desc: "Trajectory Analytics" },
        // { label: "Risk Matrix", icon: <ShieldAlert size={18} />, path: "/risk-matrix", desc: "Threat Modeling" },
      ]
    }
  ];

  return (
    <aside className="w-72 h-screen bg-[#050505] border-r border-white/10 flex flex-col z-50 font-mono">
      
      {/* 1. BRANDING & LOGO */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-b from-red-600/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            <TerminalIcon size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">
            COSMIC<span className="text-red-600">WATCH</span>
          </h1>
        </div>
       
      </div>

      {/* 2. NAVIGATION GROUPS */}
      <div className="flex-1 overflow-y-auto py-6 space-y-8 custom-scrollbar">
        {navigation.map((section) => (
          <div key={section.group} className="px-4">
            <h3 className="px-4 text-[9px] font-mono text-gray-600 uppercase tracking-[0.4em] mb-4">
              {section.group}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full group flex items-center gap-4 px-4 py-3 transition-all relative ${
                      isActive 
                        ? 'bg-red-600/10 text-white' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 h-full w-[2px] bg-red-600 shadow-[0_0_15px_#dc2626]" />
                    )}
                    <span className={`${isActive ? 'text-red-500' : 'group-hover:text-red-500'} transition-colors`}>{item.icon}</span>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[12px] font-bold uppercase tracking-widest">{item.label}</span>
                      <span className="text-[9px] font-mono text-gray-600 uppercase group-hover:text-gray-400 transition-colors">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. SYSTEM VITALS & USER ROLE */}
      <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
        
        {/* Clearance Badge */}
        <div className="flex items-center gap-3 p-3 bg-red-600/5 border border-red-600/20 rounded-sm">
          <Cpu size={14} className="text-red-600" />
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-500 uppercase">Clearance</span>
            <span className="text-[10px] text-red-500 font-black uppercase italic tracking-widest">
              {user?.role || "UNKNOWN"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {/* <button onClick={() => navigate('/settings')} className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-colors">
            <Settings size={14} /> System Settings
          </button>
           */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase text-red-500/70 hover:text-red-500 transition-colors"
          >
            <Power size={14} /> Log out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;