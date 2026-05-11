import { Badge } from '../ui/badge';

// Static map for the 7 built-in statuses — new statuses added via Setup Status use 'default' styling
const STATUS_MAP = {
  on_track:    { variant: 'on_track',    label: 'On Track' },
  at_risk:     { variant: 'at_risk',     label: 'At Risk' },
  closed:      { variant: 'closed',      label: 'Closed' },
  not_started: { variant: 'not_started', label: 'Not Started' },
  ongoing:     { variant: 'ongoing',     label: 'Ongoing' },
  completed:   { variant: 'completed',   label: 'Completed' },
  suspended:   { variant: 'suspended',   label: 'Suspended' },
};

// Optional statusesMap prop: { [name]: { color, label } } from API — overrides the static map
const StatusBadge = ({ status, statusesMap }) => {
  if (!status) return <span className="text-[11px] text-[#9CA3AF]">—</span>;
  if (statusesMap?.[status]) {
    const { color, label } = statusesMap[status];
    return <Badge variant={color}>{label}</Badge>;
  }
  const cfg = STATUS_MAP[status] ?? { variant: 'default', label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

export default StatusBadge;
