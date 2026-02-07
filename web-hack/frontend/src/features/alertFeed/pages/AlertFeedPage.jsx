import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, ShieldAlert, Clock, ChevronRight, 
  Radio, Calendar, Filter
} from 'lucide-react';
import { calculateRiskScore, getStatus } from "../../../utils/riskEngine";

const AlertFeedPage = () => {
  const [allData, setAllData] = useState({}); // Stores the raw API object
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [displayAlerts, setDisplayAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingApproaches = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const res = await axios.get(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=2wG2FKo4fVeIjsi5OzPYyFNyqXw7hxLhcdddvSjO`
        );

        const neoData = res.data.near_earth_objects;
        setAllData(neoData);
        
        // Extract and sort dates for the filter bar
        const dates = Object.keys(neoData).sort();
        setAvailableDates(dates);
        
        processDisplayData(neoData, 'ALL');
      } catch (err) {
        console.error("ALERT_UPLINK_FAIL:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingApproaches();
  }, []);

  // Helper to process data based on selection
  const processDisplayData = (data, dateFilter) => {
    let flattened = [];
    
    if (dateFilter === 'ALL') {
      Object.keys(data).forEach(date => {
        data[date].forEach(neo => {
          flattened.push(formatNeo(neo, date));
        });
      });
    } else {
      data[dateFilter]?.forEach(neo => {
        flattened.push(formatNeo(neo, dateFilter));
      });
    }

    // Sort by Risk Score first, then date
    flattened.sort((a, b) => b.riskScore - a.riskScore);
    setDisplayAlerts(flattened);
  };

  const formatNeo = (neo, date) => {
    const score = calculateRiskScore(neo);
    return {
      ...neo,
      arrivalDate: date,
      riskScore: score,
      status: getStatus(score)
    };
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    processDisplayData(allData, date);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 📡 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <Radio size={18} className="animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Chronological Intercept Feed</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Notification <span className="text-red-600">Vault</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
          <StatMini label="Objects in View" value={displayAlerts.length} />
          <StatMini label="Avg Risk" value={
            displayAlerts.length ? 
            Math.round(displayAlerts.reduce((acc, curr) => acc + curr.riskScore, 0) / displayAlerts.length) + '%' 
            : '0%'
          } color="text-yellow-500" />
        </div>
      </div>

      {/* 🗓️ DATE FILTER BAR */}
      <div className="mb-8 p-2 bg-white/5 border border-white/10 flex flex-wrap gap-2 items-center">
        <div className="px-3 flex items-center gap-2 text-gray-500 border-r border-white/10 mr-2">
          <Calendar size={14} />
          <span className="text-[10px] uppercase font-bold tracking-widest">Temporal Filter</span>
        </div>
        
        <button
          onClick={() => handleDateChange('ALL')}
          className={`px-4 py-1 text-[10px] font-bold uppercase transition-all ${
            selectedDate === 'ALL' ? 'bg-red-600 text-black' : 'hover:bg-white/10 text-gray-400'
          }`}
        >
          All Dates
        </button>

        {availableDates.map(date => (
          <button
            key={date}
            onClick={() => handleDateChange(date)}
            className={`px-4 py-1 text-[10px] font-bold uppercase transition-all ${
              selectedDate === date ? 'bg-white text-black' : 'hover:bg-white/10 text-gray-400 border border-white/5'
            }`}
          >
            {date.split('-').slice(1).join('/')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 border border-white/5 bg-white/5 backdrop-blur-sm">
          <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] uppercase tracking-widest text-gray-500">Syncing Orbital Calendars...</span>
        </div>
      ) : (
        <div className="space-y-4 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {displayAlerts.map((alert, index) => (
              <AlertItem key={alert.id} alert={alert} index={index} />
            ))}
          </AnimatePresence>
          
          {displayAlerts.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10">
               <p className="text-gray-600 uppercase text-xs tracking-[0.5em]">No Intercepts Recorded for this cycle</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AlertItem = ({ alert, index }) => {
  const isHighRisk = alert.riskScore > 60;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-center gap-6 p-4 border-l-2 transition-all ${
        isHighRisk ? 'bg-red-950/20 border-red-600 shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="flex flex-col items-center min-w-[80px] border-r border-white/5">
        <Clock size={14} className="text-gray-500 mb-1" />
        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
            {alert.arrivalDate.split('-').slice(1).join('-')}
        </span>
        <span className="text-[8px] text-gray-500 uppercase">Sector Date</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className={`text-lg font-black uppercase italic tracking-tight ${isHighRisk ? 'text-red-500' : 'text-white'}`}>
            {alert.name.replace('(', '').replace(')', '')}
          </h3>
          {isHighRisk && <ShieldAlert size={14} className="text-red-500 animate-bounce" />}
        </div>
        <p className="text-[9px] text-gray-400 uppercase tracking-widest">
          Vel: <span className="text-white">{Math.round(alert.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString()} km/h</span> 
          <span className="mx-2 text-white/20">|</span>
          Prox: <span className="text-white">{(parseFloat(alert.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(2)}M KM</span>
        </p>
      </div>

      <div className="text-right px-6">
        <p className="text-[8px] text-gray-500 uppercase mb-1">Risk Profile</p>
        <p className={`text-2xl font-black leading-none ${alert.status.color}`}>{alert.riskScore}%</p>
      </div>

      <button className="h-10 w-10 flex items-center justify-center bg-white/5 group-hover:bg-red-600 group-hover:text-black transition-all">
        <ChevronRight size={18} />
      </button>
    </motion.div>
  );
};

const StatMini = ({ label, value, color = "text-white" }) => (
  <div className="bg-black/40 border border-white/10 p-2 min-w-[110px] backdrop-blur-sm">
    <p className="text-[8px] text-gray-500 uppercase tracking-tighter mb-1 font-bold">{label}</p>
    <p className={`text-xl font-black leading-none ${color}`}>{value}</p>
  </div>
);

export default AlertFeedPage;