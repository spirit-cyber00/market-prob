// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
// FIX 1: Corrected import path (removed .ts and ensure @/ is used)
import { calculateSMA, calculateRSI, computeProbabilities } from '../../../lib/indicators';

// Define the shape of the Quote data
interface YahooQuote {
  regularMarketPrice?: number;
  regularMarketVolume?: number;
  regularMarketChangePercent?: number;
  symbol: string;
}

// FIX 2: Define the shape of the Historical data
interface HistoricalRow {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json({ error: "Ticker symbol is required" }, { status: 400 });
    }

    // Fetch Quote (Force cast to our interface)
    const quote = (await yahooFinance.quote(ticker)) as unknown as YahooQuote;
    
    // Fetch History (Force cast to our interface array)
    // FIX 3: We cast the result to 'unknown' first, then to 'HistoricalRow[]' to stop the errors
    const historyRaw = await yahooFinance.historical(ticker, { 
      period1: '2024-01-01', 
      interval: '1d' 
    });
    const history = historyRaw as unknown as HistoricalRow[];

    // Now TypeScript knows 'history' is an array, so .length works
    if (!history || history.length < 50) {
      return NextResponse.json({ error: "Insufficient historical data for analysis" }, { status: 400 });
    }

    // Now TypeScript knows 'h' has .close and .volume
    const closes = history.map((h) => h.close);
    const volumes = history.map((h) => h.volume);
    
    // Fallbacks
    const currentPrice = quote.regularMarketPrice ?? closes[closes.length - 1];
    const currentVolume = quote.regularMarketVolume ?? volumes[volumes.length - 1];
    const changePercent = quote.regularMarketChangePercent ?? 0;
    
    // Calculate Indicators
    const sma20 = calculateSMA(closes, 20); 
    const sma50 = calculateSMA(closes, 50);
    const rsi = calculateRSI(closes, 14);
    const avgVolume = calculateSMA(volumes, 10);

    const probs = computeProbabilities(
        currentPrice, 
        sma20, 
        sma50, 
        rsi, 
        currentVolume, 
        avgVolume
    );

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      price: currentPrice,
      change: changePercent,
      indicators: {
        rsi: rsi.toFixed(2),
        sma20: sma20.toFixed(2),
        sma50: sma50.toFixed(2),
        volRatio: (avgVolume > 0 ? currentVolume / avgVolume : 1).toFixed(2)
      },
      probabilities: probs
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" }, 
      { status: 500 }
    );
  }
}