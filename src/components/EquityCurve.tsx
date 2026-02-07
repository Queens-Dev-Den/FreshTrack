import { TradeAnalysis } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface EquityCurveProps {
  analysis: TradeAnalysis;
}

const EquityCurve = ({ analysis }: EquityCurveProps) => {
  const data = analysis.equityCurve.map((pt, i) => ({
    index: i,
    time: pt.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    equity: pt.equity,
    isRevenge: pt.isRevengeTrade,
    tradeId: pt.tradeId,
  }));

  const revengePoints = data.filter(d => d.isRevenge);

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
      <div className="text-center mb-8">
        <div className="deco-line mb-3" />
        <h2 className="font-heading text-3xl text-gold font-bold tracking-wide">Equity Curve</h2>
        <p className="font-body text-sepia text-sm mt-1 italic">Portfolio performance over time</p>
        <div className="deco-line mt-3" />
      </div>

      <div className="vintage-card">
        {/* Graph paper effect via background */}
        <div className="relative" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--gold) / 0.06) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--gold) / 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid
                stroke="hsl(43 40% 70% / 0.2)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="time"
                tick={{ fill: 'hsl(30 40% 45%)', fontSize: 11, fontFamily: 'Lora' }}
                axisLine={{ stroke: 'hsl(43 70% 50% / 0.4)' }}
                tickLine={{ stroke: 'hsl(43 70% 50% / 0.3)' }}
              />
              <YAxis
                tick={{ fill: 'hsl(30 40% 45%)', fontSize: 11, fontFamily: 'Lora' }}
                axisLine={{ stroke: 'hsl(43 70% 50% / 0.4)' }}
                tickLine={{ stroke: 'hsl(43 70% 50% / 0.3)' }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(20 40% 15%)',
                  border: '1px solid hsl(43 70% 50%)',
                  borderRadius: '2px',
                  fontFamily: 'Lora',
                  color: 'hsl(43 70% 50%)',
                }}
                labelStyle={{ color: 'hsl(43 60% 65%)' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="hsl(150 40% 20%)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(43 70% 50%)', stroke: 'hsl(150 40% 20%)' }}
              />
              {/* Revenge trade warning stamps */}
              {revengePoints.map((pt) => (
                <ReferenceDot
                  key={pt.index}
                  x={pt.time}
                  y={pt.equity}
                  r={8}
                  fill="hsl(345 60% 35%)"
                  stroke="hsl(345 60% 35% / 0.5)"
                  strokeWidth={3}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gold/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-banker-green" />
            <span className="font-body text-xs text-sepia">Equity Curve</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-burgundy" />
            <span className="font-body text-xs text-sepia">Revenge Trade Warning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquityCurve;
