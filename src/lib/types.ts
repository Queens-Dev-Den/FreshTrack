export interface Trade {
  id: number;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryTime: Date;
  exitTime: Date;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
}

export interface TradeAnalysis {
  trades: Trade[];
  netPnl: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  rationalityIndex: number;
  revengeTrades: RevengeTradeInstance[];
  lossAversion: LossAversionResult;
  overtradingDays: OvertradingDay[];
  equityCurve: EquityPoint[];
}

export interface RevengeTradeInstance {
  losingTrade: Trade;
  revengeTrade: Trade;
  minutesBetween: number;
}

export interface LossAversionResult {
  avgWinHoldMinutes: number;
  avgLossHoldMinutes: number;
  ratio: number;
  triggered: boolean;
}

export interface OvertradingDay {
  date: string;
  tradeCount: number;
  dailyPnl: number;
}

export interface EquityPoint {
  time: Date;
  equity: number;
  tradeId: number;
  isRevengeTrade?: boolean;
}
