import { Progress } from '../ui/progress';

const ProgressBar = ({ value = 0 }) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1">
        <Progress value={pct} />
      </div>
      <span className="text-[11px] font-medium text-[#6B7280] w-8 text-right tabular-nums flex-shrink-0">{pct}%</span>
    </div>
  );
};

export default ProgressBar;
