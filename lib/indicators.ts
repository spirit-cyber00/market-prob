// lib/indicators.ts

// Calculate Simple Moving Average
export const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return 0;
  const slice = prices.slice(0, period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
};

// Calculate RSI (Relative Strength Index)
export const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50; // Default neutral

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain/loss
  for (let i = prices.length - period - 1; i < prices.length - 1; i++) {
    const diff = prices[i + 1] - prices[i];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

// The Probability Engine
export const computeProbabilities = (
  currentPrice: number,
  sma20: number,
  sma50: number,
  rsi: number,
  volume: number,
  avgVolume: number
) => {
  let score = 50; // Base Neutral Score (0-100)

  // 1. Trend Logic (Weight: 40 pts)
  if (currentPrice > sma20) score += 10; else score -= 10;
  if (currentPrice > sma50) score += 10; else score -= 10;

  // 2. Momentum Logic (Weight: 30 pts)
  // RSI < 30 is oversold (Bullish reversion), > 70 is overbought (Bearish reversion)
  // RSI > 50 generally indicates bullish momentum
  if (rsi > 50 && rsi < 70) score += 10;
  if (rsi < 50 && rsi > 30) score -= 10;
  
  // Mean Reversion Risks
  if (rsi >= 70) score -= 5; // Slight pullback risk
  if (rsi <= 30) score += 5; // Slight bounce chance

  // 3. Volume Logic (Weight: 20 pts)
  const volRatio = volume / avgVolume;
  if (volRatio > 1.2) {
    // High volume confirms the trend direction
    if (currentPrice > sma20) score += 10;
    else score -= 10;
  }

  // Cap Score
  score = Math.max(0, Math.min(100, score));

  // Convert Score to Probability Distribution
  // This is a heuristic mapping, not statistical prediction
  const bullish = score;
  const bearish = 100 - score;
  
  // Sideways is the uncertainty factor (closer to 50 = more sideways)
  const uncertainty = 100 - Math.abs(bullish - bearish); 
  
  // Normalize to 100%
  const total = bullish + bearish + (uncertainty * 0.5); 
  
  return {
    bullish: Math.round((bullish / total) * 100),
    bearish: Math.round((bearish / total) * 100),
    sideways: Math.round(((uncertainty * 0.5) / total) * 100),
    rawScore: score
  };
};