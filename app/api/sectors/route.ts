// app/api/sectors/route.ts
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { SECTORS } from '../../../lib/constants'; 

// 1. Define the interface for the Quote data
interface SectorQuote {
  symbol: string;
  regularMarketChangePercent?: number;
  regularMarketPrice?: number;
}

export async function GET() {
  try {
    const sectorMap: Record<string, string> = {};
    const allSymbols: string[] = [];

    Object.entries(SECTORS).forEach(([sectorName, symbols]) => {
      symbols.forEach((sym) => {
        allSymbols.push(sym);
        sectorMap[sym] = sectorName;
      });
    });

    // 2. Fetch all quotes in parallel
    const quotes = await Promise.all(
      allSymbols.map(async (sym) => {
        try {
          // 3. FORCE CAST the result to our interface
          const res = (await yahooFinance.quote(sym)) as unknown as SectorQuote;
          
          return { 
            symbol: sym, 
            // Now TypeScript knows these properties exist
            change: res.regularMarketChangePercent || 0,
            price: res.regularMarketPrice || 0
          };
        } catch (e) {
          console.error(`Failed to fetch ${sym}`, e);
          return null;
        }
      })
    );

    // ... Rest of your aggregation logic remains the same ...
    const sectorPerformance: Record<string, { totalChange: number; count: number }> = {};

    quotes.forEach((quote) => {
      if (!quote) return;
      const sector = sectorMap[quote.symbol];
      
      if (!sectorPerformance[sector]) {
        sectorPerformance[sector] = { totalChange: 0, count: 0 };
      }
      
      sectorPerformance[sector].totalChange += quote.change;
      sectorPerformance[sector].count += 1;
    });

    const results = Object.entries(sectorPerformance).map(([name, data]) => {
      const avgChange = data.totalChange / data.count;
      
      let bias = 'Neutral';
      if (avgChange > 0.5) bias = 'Bullish';
      if (avgChange < -0.5) bias = 'Bearish';

      return {
        name,
        change: parseFloat(avgChange.toFixed(2)),
        bias
      };
    });

    results.sort((a, b) => b.change - a.change);

    return NextResponse.json({ sectors: results });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch sector data" }, { status: 500 });
  }
}