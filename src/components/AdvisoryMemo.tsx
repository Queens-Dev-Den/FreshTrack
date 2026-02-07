import { TradeAnalysis } from '@/lib/types';

interface AdvisoryMemoProps {
  analysis: TradeAnalysis;
}

const AdvisoryMemo = ({ analysis }: AdvisoryMemoProps) => {
  const memos = generateMemos(analysis);

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.6s' }}>
      <div className="text-center mb-8">
        <div className="deco-line mb-3" />
        <h2 className="font-heading text-3xl text-gold font-bold tracking-wide">Strategic Advisory Memo</h2>
        <div className="deco-line mt-3" />
      </div>

      <div className="vintage-card max-w-2xl mx-auto">
        {/* Telegram header */}
        <div className="text-center border-b-2 border-gold/40 pb-4 mb-6">
          <p className="font-typewriter text-xs text-sepia tracking-[0.3em] uppercase">
            ═══ Confidential Memorandum ═══
          </p>
          <p className="font-typewriter text-xs text-sepia/60 mt-1">
            The Gilded Ledger — Office of Behavioral Audit
          </p>
        </div>

        {/* Memo body */}
        <div className="space-y-6">
          {memos.map((memo, i) => (
            <div key={i} className="typewriter-text text-sm text-foreground leading-relaxed">
              <span className="font-bold text-burgundy">{memo.prefix}</span>{' '}
              {memo.body}{' '}
              <span className="font-bold text-burgundy">STOP.</span>
            </div>
          ))}
        </div>

        {/* Signature */}
        <div className="mt-8 pt-4 border-t border-gold/30 flex justify-between items-end">
          <div>
            <p className="font-typewriter text-xs text-sepia">Composure Score: {analysis.rationalityIndex}/100</p>
            <p className="font-typewriter text-xs text-sepia/60 mt-1">
              Classification: {analysis.rationalityIndex >= 80 ? 'EXEMPLARY' : analysis.rationalityIndex >= 60 ? 'SATISFACTORY' : analysis.rationalityIndex >= 40 ? 'CONCERNING' : 'CRITICAL'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-heading text-gold text-sm italic">— The Auditor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateMemos(analysis: TradeAnalysis) {
  const memos: { prefix: string; body: string }[] = [];

  if (analysis.revengeTrades.length > 3) {
    memos.push({
      prefix: 'URGENT.',
      body: `The Firm has identified ${analysis.revengeTrades.length} instances of impulsive retaliation in your ledger. The Firm advises immediate cessation of trading activity for 24 hours following significant drawdowns to cool tempers.`,
    });
  } else if (analysis.revengeTrades.length > 0) {
    memos.push({
      prefix: 'ADVISORY.',
      body: `${analysis.revengeTrades.length} instance(s) of post-loss impulsive entry detected. The Firm recommends implementing a mandatory 10-minute cooling period after any realized loss before initiating new positions.`,
    });
  }

  if (analysis.lossAversion.triggered) {
    memos.push({
      prefix: 'OBSERVATION.',
      body: `Your average loss holding period (${analysis.lossAversion.avgLossHoldMinutes} min) exceeds your average winning hold time (${analysis.lossAversion.avgWinHoldMinutes} min) by a factor of ${analysis.lossAversion.ratio}x. The Firm strongly advises the implementation of strict stop-loss orders to prevent further capital erosion from hope-based position management.`,
    });
  }

  if (analysis.overtradingDays.length > 0) {
    memos.push({
      prefix: 'WARNING.',
      body: `Excessive trading volume detected on ${analysis.overtradingDays.length} session(s) with negative returns. The Firm prescribes a maximum of 10 trades per session and mandates a full review of the day's strategy before the opening bell of the following session.`,
    });
  }

  if (memos.length === 0) {
    memos.push({
      prefix: 'COMMENDATION.',
      body: 'The Firm is pleased to report that your trading conduct demonstrates exceptional discipline and composure. Continue maintaining current standards of practice. Your emotional resilience is a credit to this establishment.',
    });
  }

  return memos;
}

export default AdvisoryMemo;
