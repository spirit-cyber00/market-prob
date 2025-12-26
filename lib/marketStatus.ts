// lib/marketStatus.ts

export function getMarketStatus() {
  const now = new Date();
  
  // Convert current time to IST (UTC +5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utc + istOffset);

  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const day = istDate.getDay(); // 0 = Sunday, 6 = Saturday

  // Market Hours: 09:15 to 15:30 (3:30 PM)
  const marketOpenHour = 9;
  const marketOpenMinute = 15;
  const marketCloseHour = 15;
  const marketCloseMinute = 30;

  const currentTimeVal = hours * 60 + minutes;
  const openTimeVal = marketOpenHour * 60 + marketOpenMinute;
  const closeTimeVal = marketCloseHour * 60 + marketCloseMinute;

  const isOpen = 
    day !== 0 && // Not Sunday
    day !== 6 && // Not Saturday
    currentTimeVal >= openTimeVal && 
    currentTimeVal <= closeTimeVal;

  let message = "";

  if (isOpen) {
    message = "Market is LIVE";
  } else {
    // Calculate next open
    // If today is Friday (5) after close, or Sat(6)/Sun(0), open is Monday
    // Simple logic: Just say "Opens at 09:15 AM"
    message = "Market Closed • Opens 09:15 AM";
  }

  return { isOpen, message };
}