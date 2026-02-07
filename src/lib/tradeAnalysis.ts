import { Trade, TradeAnalysis, RevengeTradeInstance, LossAversionResult, OvertradingDay, EquityPoint } from './types';

export function analyzeTrades(trades: Trade[]): TradeAnalysis {
  const sorted = [...trades].sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());

  const netPnl = sorted.reduce((sum, t) => sum + t.pnl, 0);
  const winningTrades = sorted.filter(t => t.pnl > 0).length;
  const losingTrades = sorted.filter(t => t.pnl <= 0).length;
  const winRate = sorted.length > 0 ? (winningTrades / sorted.length) * 100 : 0;

  const revengeTrades = detectRevengeTrades(sorted);
  const lossAversion = detectLossAversion(sorted);
  const overtradingDays = detectOvertrading(sorted);
  const equityCurve = buildEquityCurve(sorted, revengeTrades);

  const rationalityIndex = calculateRationalityIndex(revengeTrades, lossAversion, overtradingDays, sorted.length);

  return {
    trades: sorted,
    netPnl,
    winRate,
    totalTrades: sorted.length,
    winningTrades,
    losingTrades,
    rationalityIndex,
    revengeTrades,
    lossAversion,
    overtradingDays,
    equityCurve,
  };
}

function detectRevengeTrades(trades: Trade[]): RevengeTradeInstance[] {
  const instances: RevengeTradeInstance[] = [];

  for (let i = 0; i < trades.length; i++) {
    if (trades[i].pnl >= 0) continue;
    const losingTrade = trades[i];

    for (let j = i + 1; j < trades.length; j++) {
      const nextTrade = trades[j];
      const minutesBetween = (nextTrade.entryTime.getTime() - losingTrade.exitTime.getTime()) / 60000;
      if (minutesBetween > 5) break;
      if (minutesBetween >= 0 && minutesBetween <= 5) {
        instances.push({ losingTrade, revengeTrade: nextTrade, minutesBetween: Math.round(minutesBetween) });
        break;
      }
    }
  }
  return instances;
}

function detectLossAversion(trades: Trade[]): LossAversionResult {
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);

  const holdTime = (t: Trade) => (t.exitTime.getTime() - t.entryTime.getTime()) / 60000;

  const avgWinHoldMinutes = wins.length > 0
    ? wins.reduce((s, t) => s + holdTime(t), 0) / wins.length
    : 0;
  const avgLossHoldMinutes = losses.length > 0
    ? losses.reduce((s, t) => s + holdTime(t), 0) / losses.length
    : 0;

  const ratio = avgWinHoldMinutes > 0 ? avgLossHoldMinutes / avgWinHoldMinutes : 0;

  return {
    avgWinHoldMinutes: Math.round(avgWinHoldMinutes),
    avgLossHoldMinutes: Math.round(avgLossHoldMinutes),
    ratio: +ratio.toFixed(2),
    triggered: ratio > 1.5,
  };
}

function detectOvertrading(trades: Trade[]): OvertradingDay[] {
  const byDay = new Map<string, Trade[]>();
  trades.forEach(t => {
    const key = t.entryTime.toISOString().slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(t);
  });

  const days: OvertradingDay[] = [];
  byDay.forEach((dayTrades, date) => {
    const dailyPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
    if (dayTrades.length > 15 && dailyPnl < 0) {
      days.push({ date, tradeCount: dayTrades.length, dailyPnl });
    }
  });
  return days;
}

function buildEquityCurve(trades: Trade[], revengeTrades: RevengeTradeInstance[]): EquityPoint[] {
  const revengeIds = new Set(revengeTrades.map(r => r.revengeTrade.id));
  let equity = 0;
  const points: EquityPoint[] = [{ time: trades[0]?.entryTime || new Date(), equity: 0, tradeId: 0 }];

  trades.forEach(t => {
    equity += t.pnl;
    points.push({
      time: t.exitTime,
      equity: +equity.toFixed(2),
      tradeId: t.id,
      isRevengeTrade: revengeIds.has(t.id),
    });
  });

  return points;
}

function calculateRationalityIndex(
  revengeTrades: RevengeTradeInstance[],
  lossAversion: LossAversionResult,
  overtradingDays: OvertradingDay[],
  totalTrades: number
): number {
  if (totalTrades === 0) return 100;

  let score = 100;

  // Revenge trading penalty: -8 per instance, max -40
  score -= Math.min(revengeTrades.length * 8, 40);

  // Loss aversion penalty: up to -30 based on ratio
  if (lossAversion.triggered) {
    const excess = Math.min(lossAversion.ratio - 1.5, 3);
    score -= Math.round((excess / 3) * 30);
  }

  // Overtrading penalty: -15 per day, max -30
  score -= Math.min(overtradingDays.length * 15, 30);

  return Math.max(0, Math.min(100, score));
}

export function parseCSV(csvText: string): Trade[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const trades: Trade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length < 7) continue;

    const get = (name: string) => {
      const idx = header.indexOf(name);
      return idx >= 0 ? vals[idx] : '';
    };

    try {
      trades.push({
        id: i,
        symbol: get('symbol') || get('ticker') || `TRADE${i}`,
        direction: (get('direction') || get('side') || 'LONG').toUpperCase() as 'LONG' | 'SHORT',
        entryTime: new Date(get('entrytime') || get('entry_time') || get('open_time') || get('entry')),
        exitTime: new Date(get('exittime') || get('exit_time') || get('close_time') || get('exit')),
        entryPrice: parseFloat(get('entryprice') || get('entry_price') || get('open')),
        exitPrice: parseFloat(get('exitprice') || get('exit_price') || get('close')),
        quantity: parseFloat(get('quantity') || get('qty') || get('size') || '1'),
        pnl: parseFloat(get('pnl') || get('profit') || get('pl') || '0'),
      });
    } catch {
      continue;
    }
  }

  return trades.filter(t => !isNaN(t.entryTime.getTime()) && !isNaN(t.exitTime.getTime()));
}
