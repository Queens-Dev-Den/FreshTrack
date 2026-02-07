const TickerTapeLoader = () => {
  const symbols = ['AAPL ▲', 'MSFT ▼', 'TSLA ▲', 'JPM ▼', 'GOOGL ▲', 'NVDA ▲', 'META ▼', 'AMZN ▲'];

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="overflow-hidden w-full max-w-lg border-y-2 border-gold bg-mahogany py-2">
        <div className="animate-ticker whitespace-nowrap font-typewriter text-gold text-sm tracking-widest">
          {symbols.concat(symbols).map((s, i) => (
            <span key={i} className="mx-4">{s}</span>
          ))}
        </div>
      </div>
      <p className="font-heading text-gold text-lg tracking-wider uppercase">
        Processing Ledger Entries...
      </p>
    </div>
  );
};

export default TickerTapeLoader;
