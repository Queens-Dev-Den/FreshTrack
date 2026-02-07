import { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface DepositSlotProps {
  onFileUpload: (content: string) => void;
  onLoadSample: () => void;
}

const DepositSlot = ({ onFileUpload, onLoadSample }: DepositSlotProps) => {
  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) onFileUpload(text);
    };
    reader.readAsText(file);
  }, [onFileUpload]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-xl animate-fade-up">
        {/* Ornate header */}
        <div className="text-center mb-8">
          <div className="deco-line mb-4" />
          <h1 className="font-heading text-4xl md:text-5xl text-gold font-bold tracking-wide">
            The Gilded Ledger
          </h1>
          <p className="font-heading text-lg text-sepia mt-2 italic">
            A Behavioral Audit for the Modern Trader
          </p>
          <div className="deco-line mt-4" />
        </div>

        {/* Deposit Slot */}
        <div className="art-deco-border bg-mahogany/5 p-8 md:p-12 text-center">
          <div className="art-deco-border bg-mahogany p-6 mx-auto max-w-sm">
            <div className="border border-gold/30 bg-mahogany-light/80 p-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center">
                <Upload className="w-7 h-7 text-gold" />
              </div>
              <div className="w-48 h-1 bg-gold/60 rounded-full" />
              <p className="font-heading text-gold/90 text-sm tracking-wider uppercase leading-relaxed">
                Submit Your Trading Records
              </p>
              <p className="font-body text-gold/60 text-xs">
                CSV format accepted
              </p>
            </div>
          </div>

          <label className="brass-plaque inline-block mt-8 px-8 py-3 text-sm cursor-pointer">
            Deposit Records
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFile}
            />
          </label>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gold/30" />
            <span className="font-heading text-sepia text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gold/30" />
          </div>

          <button
            onClick={onLoadSample}
            className="brass-plaque px-8 py-3 text-sm"
          >
            View Sample Ledger
          </button>
        </div>

        {/* Footer ornament */}
        <div className="text-center mt-8">
          <div className="flex justify-center gap-2 text-gold/40">
            <span>◆</span>
            <span>◇</span>
            <span>◆</span>
            <span>◇</span>
            <span>◆</span>
          </div>
          <p className="font-body text-muted-foreground text-xs mt-3 italic">
            Est. MCMXXIV — Discretion Assured
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepositSlot;
