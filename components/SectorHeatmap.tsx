'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
// FIX: Using relative path (2 dots) to go back one folder to root/lib
import { getMarketStatus } from '../lib/marketStatus'; // USE THIS

interface SectorData {
  name: string;
  change: number;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
}

export default function SectorHeatmap() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, message: '' });

  const fetchSectors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sectors');
      const data = await res.json();
      if (data.sectors) setSectors(data.sectors);
    } catch (err) {
      console.error("Failed to load sectors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
    setMarketStatus(getMarketStatus());
  }, []);

  // Color Mapping logic
  const getColor = (bias: string, change: number) => {
    if (bias === 'Bullish') return `bg-emerald-500/${Math.min(20 + change * 10, 90)}`;
    if (bias === 'Bearish') return `bg-rose-500/${Math.min(20 + Math.abs(change) * 10, 90)}`;
    return 'bg-slate-800';
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-200">Sector Heatmap</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${marketStatus.isOpen ? 'bg-green-900 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
               <Clock size={12} /> {marketStatus.message}
             </span>
          </div>
        </div>
        <button 
          onClick={fetchSectors} 
          disabled={loading}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && sectors.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse">
          Loading Market Data...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1 overflow-y-auto">
          {sectors.map((sector) => (
            <div 
              key={sector.name}
              className={`p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center transition hover:scale-[1.02] cursor-default ${getColor(sector.bias, sector.change)}`}
            >
              <span className="text-xs font-bold text-slate-200 tracking-wider mb-1">{sector.name}</span>
              <span className={`text-lg font-bold ${sector.change > 0 ? 'text-green-100' : sector.change < 0 ? 'text-red-100' : 'text-slate-300'}`}>
                {sector.change > 0 ? '+' : ''}{sector.change}%
              </span>
              <span className="text-[10px] uppercase opacity-70 mt-1">{sector.bias}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}