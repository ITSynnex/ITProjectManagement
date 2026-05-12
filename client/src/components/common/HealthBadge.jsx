import { Badge } from '../ui/badge';

const HEALTH_MAP = {
  on_track:  { variant: 'on_track',         label: 'On Track' },
  at_risk:   { variant: 'at_risk',           label: 'At Risk' },
  off_track: { variant: 'off_track',         label: 'Off Track' },
  critical:  { variant: 'priority_critical', label: 'Critical' },
  n_a:       { variant: 'default',           label: 'N/A' },
};

const HealthBadge = ({ health, healthMap }) => {
  if (!health) return <span className="text-[11px] text-[#9CA3AF]">—</span>;
  if (healthMap?.[health]) {
    const { color, label } = healthMap[health];
    return <Badge variant={color}>{label}</Badge>;
  }
  const cfg = HEALTH_MAP[health] ?? { variant: 'default', label: health };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

export default HealthBadge;
