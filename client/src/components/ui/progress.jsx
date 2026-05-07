import { cn } from '../../lib/utils';

const Progress = ({ value = 0, className, color }) => {
  const pct = Math.min(100, Math.max(0, value));
  const bg  = color
    ?? (pct === 100 ? '#22C55E' : pct >= 60 ? '#4F46E5' : pct >= 30 ? '#EAB308' : '#E5E7EB');
  return (
    <div className={cn('relative h-1.5 w-full rounded-full bg-[#E8E6E0] overflow-hidden', className)}>
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: bg }}
      />
    </div>
  );
};

export { Progress };
