type CauseChainProps = {
  items: string[];
  compact?: boolean;
};

export default function CauseChain({ items, compact = false }: CauseChainProps) {
  return (
    <ol className={`cause-chain ${compact ? 'cause-chain--compact' : ''}`} aria-label="地理因果链">
      {items.map((item, index) => (
        <li key={item}>
          <span className="chain-step-number">{String(index + 1).padStart(2, '0')}</span>
          <span className="chain-step-text">{item}</span>
          {index < items.length - 1 ? <span className="chain-arrow" aria-hidden="true">↓</span> : null}
        </li>
      ))}
    </ol>
  );
}
