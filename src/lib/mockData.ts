import { Trade } from './types';

export function generateMockTrades(): Trade[] {
  const symbols = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META', 'NVDA', 'JPM'];
  const trades: Trade[] = [];
  let id = 1;

  const baseDate = new Date('2024-11-01T09:30:00');

  const addTrade = (
    dayOffset: number,
    hourOffset: number,
    minOffset: number,
    symbol: string,
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    holdMinutes: number
  ) => {
    const entryTime = new Date(baseDate);
    entryTime.setDate(entryTime.getDate() + dayOffset);
    entryTime.setHours(9 + hourOffset, 30 + minOffset, 0, 0);
    const exitTime = new Date(entryTime);
    exitTime.setMinutes(exitTime.getMinutes() + holdMinutes);
    const pnl = direction === 'LONG'
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity;
    trades.push({ id: id++, symbol, direction, entryTime, exitTime, entryPrice, exitPrice, quantity, pnl });
  };

  // Day 0: Normal trading day
  addTrade(0, 0, 0, 'AAPL', 'LONG', 175.50, 177.20, 100, 45);
  addTrade(0, 1, 15, 'MSFT', 'LONG', 378.00, 380.50, 50, 60);
  addTrade(0, 3, 0, 'GOOGL', 'SHORT', 142.00, 140.50, 80, 30);

  // Day 1: Revenge trading pattern - loss then quick re-entry
  addTrade(1, 0, 0, 'TSLA', 'LONG', 242.00, 238.50, 100, 20); // Loss
  addTrade(1, 0, 23, 'TSLA', 'LONG', 238.80, 236.00, 150, 15); // Revenge (3 min after)
  addTrade(1, 0, 45, 'TSLA', 'SHORT', 236.50, 237.80, 200, 10); // Revenge again
  addTrade(1, 2, 0, 'AAPL', 'LONG', 176.00, 177.50, 50, 90);

  // Day 2: Loss aversion - holding losses way too long
  addTrade(2, 0, 0, 'NVDA', 'LONG', 480.00, 485.00, 30, 15); // Quick win
  addTrade(2, 0, 30, 'META', 'LONG', 335.00, 340.00, 40, 20); // Quick win
  addTrade(2, 1, 0, 'AMZN', 'LONG', 152.00, 148.50, 100, 180); // Held loss 3 hours
  addTrade(2, 4, 30, 'JPM', 'LONG', 195.00, 192.00, 60, 150); // Held loss 2.5 hours

  // Day 3: Overtrading day (>15 trades, negative PnL)
  for (let i = 0; i < 18; i++) {
    const sym = symbols[i % symbols.length];
    const dir = i % 3 === 0 ? 'SHORT' as const : 'LONG' as const;
    const entry = 100 + Math.random() * 50;
    const pnlDir = i < 12 ? -1 : 1;
    const exit = entry + pnlDir * (Math.random() * 2 + 0.5) * (dir === 'LONG' ? 1 : -1);
    addTrade(3, Math.floor(i * 0.4), (i * 17) % 60, sym, dir, +entry.toFixed(2), +exit.toFixed(2), 50 + i * 10, 8 + i * 2);
  }

  // Day 5: Mixed day with some revenge trading
  addTrade(5, 0, 0, 'AAPL', 'LONG', 178.00, 176.50, 80, 25); // Loss
  addTrade(5, 0, 28, 'AAPL', 'LONG', 176.80, 175.00, 120, 12); // Revenge (3 min after exit)
  addTrade(5, 1, 30, 'MSFT', 'LONG', 382.00, 385.00, 60, 55); // Win
  addTrade(5, 3, 0, 'GOOGL', 'LONG', 143.00, 145.20, 70, 40); // Win

  // Day 7: Good day
  addTrade(7, 0, 15, 'NVDA', 'LONG', 475.00, 482.00, 40, 35);
  addTrade(7, 1, 0, 'TSLA', 'SHORT', 245.00, 240.00, 60, 50);
  addTrade(7, 2, 30, 'META', 'LONG', 332.00, 338.00, 45, 65);

  // Day 9: Another rough day with losses held long
  addTrade(9, 0, 0, 'JPM', 'LONG', 196.00, 198.50, 100, 20); // Quick win
  addTrade(9, 0, 30, 'AMZN', 'SHORT', 150.00, 153.00, 80, 200); // Loss held >3 hrs
  addTrade(9, 5, 0, 'MSFT', 'LONG', 380.00, 378.50, 50, 120); // Loss held 2 hrs

  return trades.sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());
}
