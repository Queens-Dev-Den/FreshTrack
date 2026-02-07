import { TradeAnalysis } from '@/lib/types';
import { AlertTriangle, Clock, Activity } from 'lucide-react';

interface AuditorFindingsProps {
  analysis: TradeAnalysis;
}

const AuditorFindings = ({ analysis }: AuditorFindingsProps) => {
  const { revengeTrades, lossAversion, overtradingDays } = analysis;

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
      <div className="text-center mb-8">
        <div className="deco-line mb-3" />
        <h2 className="font-heading text-3xl text-gold font-bold tracking-wide">The Auditor's Findings</h2>
        <div className="deco-line mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenge Trading */}
        <FindingCard
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Evidence of Impulsive Retaliation"
          category="Revenge Trading"
          triggered={revengeTrades.length > 0}
          severity={revengeTrades.length > 3 ? 'high' : revengeTrades.length > 0 ? 'medium' : 'low'}
        >
          {revengeTrades.length > 0 ? (
            <>
              <p className="mb-3">
                <span className="font-heading text-burgundy text-2xl font-bold">{revengeTrades.length}</span>
                <span className="text-sepia text-sm ml-2">instances detected</span>
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {revengeTrades.map((rt, i) => (
                  <div key={i} className="text-xs border-b border-gold/20 pb-1">
                    <span className="text-burgundy font-typewriter">
                      {rt.revengeTrade.symbol}
                    </span>
                    <span className="text-sepia"> — {rt.minutesBetween} min after ${Math.abs(rt.losingTrade.pnl).toFixed(0)} loss</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-banker-green text-sm italic">No impulsive retaliation detected. Composure maintained.</p>
          )}
        </FindingCard>

        {/* Loss Aversion */}
        <FindingCard
          icon={<Clock className="w-5 h-5" />}
          title="Reluctance to Liquidate Losses"
          category="Loss Aversion"
          triggered={lossAversion.triggered}
          severity={lossAversion.ratio > 2.5 ? 'high' : lossAversion.triggered ? 'medium' : 'low'}
        >
          <div className="flex justify-around mb-4">
            <div className="text-center">
              <div className="text-2xl mb-1">⏳</div>
              <p className="font-heading text-banker-green text-xl font-bold">{lossAversion.avgWinHoldMinutes}m</p>
              <p className="text-xs text-sepia">Avg Win Hold</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⌛</div>
              <p className={`font-heading text-xl font-bold ${lossAversion.triggered ? 'text-burgundy' : 'text-foreground'}`}>
                {lossAversion.avgLossHoldMinutes}m
              </p>
              <p className="text-xs text-sepia">Avg Loss Hold</p>
            </div>
          </div>
          <p className="text-xs text-sepia text-center">
            Ratio: <span className={`font-bold ${lossAversion.triggered ? 'text-burgundy' : 'text-banker-green'}`}>
              {lossAversion.ratio}x
            </span>
            {lossAversion.triggered && ' — Threshold exceeded (>1.5x)'}
          </p>
        </FindingCard>

        {/* Overtrading */}
        <FindingCard
          icon={<Activity className="w-5 h-5" />}
          title="Excessive Churn Activity"
          category="Overtrading"
          triggered={overtradingDays.length > 0}
          severity={overtradingDays.length > 2 ? 'high' : overtradingDays.length > 0 ? 'medium' : 'low'}
        >
          {overtradingDays.length > 0 ? (
            <div className="space-y-3">
              {overtradingDays.map((day, i) => (
                <div key={i} className="border-b border-gold/20 pb-2">
                  <p className="font-typewriter text-xs text-sepia">{day.date}</p>
                  <p className="text-sm">
                    <span className="text-burgundy font-bold">{day.tradeCount} trades</span>
                    <span className="text-sepia"> · Net: </span>
                    <span className="text-burgundy font-bold">${day.dailyPnl.toFixed(2)}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-banker-green text-sm italic">No excessive churn detected. Trading volume within norms.</p>
          )}
        </FindingCard>
      </div>
    </div>
  );
};

function FindingCard({
  icon,
  title,
  category,
  triggered,
  severity,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  category: string;
  triggered: boolean;
  severity: 'low' | 'medium' | 'high';
  children: React.ReactNode;
}) {
  const severityColor = severity === 'high' ? 'text-burgundy' : severity === 'medium' ? 'text-gold-dark' : 'text-banker-green';

  return (
    <div className="vintage-card flex flex-col">
      {/* Letterhead */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-typewriter text-xs text-sepia uppercase tracking-wider">{category}</p>
          <h3 className="font-heading text-foreground text-sm font-bold mt-1 leading-snug">{title}</h3>
        </div>
        <div className={`${severityColor} mt-1`}>{icon}</div>
      </div>

      {/* Stamp */}
      {triggered && (
        <div className="flex justify-end mb-3">
          <div className="border-2 border-burgundy rounded-sm px-3 py-1 rotate-[-6deg] opacity-80">
            <span className="font-heading text-burgundy text-xs font-bold uppercase tracking-widest">Flagged</span>
          </div>
        </div>
      )}

      <div className="flex-1">{children}</div>
    </div>
  );
}

export default AuditorFindings;
