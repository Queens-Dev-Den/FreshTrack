import { TradeAnalysis } from '@/lib/types';
import AnalogGauge from './AnalogGauge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsPanelProps {
  analysis: TradeAnalysis;
}

const MetricsPanel = ({ analysis }: MetricsPanelProps) => {
  const isProfit = analysis.netPnl >= 0;

  return (
    <div className="animate-fade-up">
      <div className="text-center mb-8">
        <div className="deco-line mb-3" />
        <h2 className="font-heading text-3xl text-gold font-bold tracking-wide">The Exchange Floor</h2>
        <div className="deco-line mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net P&L Plaque */}
        <div className="vintage-card flex flex-col items-center justify-center py-8">
          <p className="font-heading text-xs text-sepia uppercase tracking-widest mb-3">Net Profit & Loss</p>
          <div className="flex items-center gap-2">
            {isProfit ? (
              <TrendingUp className="w-6 h-6 text-banker-green" />
            ) : (
              <TrendingDown className="w-6 h-6 text-burgundy" />
            )}
            <span className={`font-heading text-4xl font-bold ${isProfit ? 'text-banker-green' : 'text-burgundy'}`}>
              ${Math.abs(analysis.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="font-body text-muted-foreground text-xs mt-2">
            {analysis.totalTrades} trades · {analysis.winningTrades}W / {analysis.losingTrades}L
          </p>
        </div>

        {/* Win Rate Gauge */}
        <div className="vintage-card flex flex-col items-center justify-center">
          <AnalogGauge
            value={analysis.winRate}
            max={100}
            label="Win Rate"
            formatValue={(v) => `${v.toFixed(1)}%`}
            lowLabel="0%"
            highLabel="100%"
          />
        </div>

        {/* Rationality Index Gauge */}
        <div className="vintage-card flex flex-col items-center justify-center">
          <AnalogGauge
            value={analysis.rationalityIndex}
            max={100}
            label="Market Composure"
            sublabel="Rationality Index"
            lowLabel="Panic"
            highLabel="Steady"
          />
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
