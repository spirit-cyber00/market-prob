'use client';

import React, { useState } from 'react';
import { Search, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Types
interface AnalysisResult {
  ticker: string;
  price: number;
  change: number;
  indicators: {
    rsi: string;
    sma20: string;
    sma50: string;
    volRatio: string;
  };
  probabilities: {
    bullish: number;
    bearish: number;
    sideways: number;
    rawScore: number;
  };
}

export default function Dashboard() {
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // In production, ticker should include .NS for NSE stocks if user forgets
      const symbol = ticker.toUpperCase().endsWith('.NS') ? ticker : `${ticker}.NS`;
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: symbol }),
      });
      
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      alert("Analysis failed. Check ticker symbol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* Header */}
      <header className="mb-10 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
          <Activity /> MarketProb <span className="text-sm text-slate-500 font-normal">Quant Bias Analyzer</span>
        </h1>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Input & Probability Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-slate-300">Stock Analyzer</h2>
            <form onSubmit={handleAnalyze} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Ticker (e.g., RELIANCE)" 
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition"
                disabled={loading}
              >
                {loading ? '...' : <Search size={20} />}
              </button>
            </form>

            {/* Results Display */}
            {result && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{result.ticker}</h3>
                    <p className="text-slate-400">₹{result.price.toFixed(2)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-bold ${result.change >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {result.change > 0 ? '+' : ''}{result.change?.toFixed(2)}%
                  </span>
                </div>

                {/* Probability Bars */}
                <div className="space-y-3 mb-6">
                  <ProbabilityBar label="Bullish" percent={result.probabilities.bullish} color="bg-green-500" icon={<TrendingUp size={16}/>} />
                  <ProbabilityBar label="Bearish" percent={result.probabilities.bearish} color="bg-red-500" icon={<TrendingDown size={16}/>} />
                  <ProbabilityBar label="Sideways" percent={result.probabilities.sideways} color="bg-yellow-500" icon={<Minus size={16}/>} />
                </div>

                {/* Transparent Logic Data */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs text-slate-400 grid grid-cols-2 gap-2">
                  <p>RSI (14): <span className="text-slate-200">{result.indicators.rsi}</span></p>
                  <p>Vol Ratio: <span className="text-slate-200">{result.indicators.volRatio}x</span></p>
                  <p>SMA (20): <span className="text-slate-200">{result.indicators.sma20}</span></p>
                  <p>SMA (50): <span className="text-slate-200">{result.indicators.sma50}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Market Overview (Placeholder for Sector Heatmap) */}
        <div className="lg:col-span-2">
           <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 min-h-[400px]">
             <h2 className="text-xl font-semibold mb-4 text-slate-300">Sector Heatmap (NIFTY 50)</h2>
             {/* In a real implementation, you would map over the SECTORS constant, 
                 fetch data for all stocks in Promise.all(), and render color-coded boxes.
                 For MVP, we show a static example structure.
             */}
             <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                <SectorBox name="BANKING" change={1.2} bias="Bullish" />
                <SectorBox name="IT" change={-0.5} bias="Bearish" />
                <SectorBox name="AUTO" change={0.8} bias="Bullish" />
                <SectorBox name="PHARMA" change={0.1} bias="Neutral" />
                <SectorBox name="METALS" change={-1.2} bias="Bearish" />
                <SectorBox name="ENERGY" change={0.4} bias="Neutral" />
                <SectorBox name="FMCG" change={-0.1} bias="Neutral" />
                <SectorBox name="REALTY" change={2.1} bias="Bullish" />
             </div>
           </div>
        </div>
      </div>

      {/* DISCLAIMER */}
      <footer className="mt-12 border-t border-slate-800 pt-6 text-center text-slate-600 text-xs">
        <p className="max-w-2xl mx-auto">
          <strong>DISCLAIMER:</strong> This project provides probabilistic analysis based on historical technical data for educational purposes only. 
          It does NOT predict future market movements and does NOT constitute financial advice. 
          Trading involves risk. Please consult a SEBI registered financial advisor before investing.
        </p>
      </footer>
    </div>
  );
}

// Sub-components for cleaner code
function ProbabilityBar({ label, percent, color, icon }: { label: string, percent: number, color: string, icon: any }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1 text-slate-300">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function SectorBox({ name, change, bias }: { name: string, change: number, bias: string }) {
  const colorMap = {
    'Bullish': 'bg-green-900/30 border-green-800 text-green-400',
    'Bearish': 'bg-red-900/30 border-red-800 text-red-400',
    'Neutral': 'bg-slate-800 border-slate-700 text-slate-400'
  };
  
  return (
    <div className={`p-4 rounded border ${colorMap[bias as keyof typeof colorMap]} flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition`}>
      <span className="font-bold text-sm">{name}</span>
      <span className="text-xs mt-1">{change > 0 ? '+' : ''}{change}%</span>
    </div>
  );
}