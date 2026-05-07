import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PlanRow from './PlanRow';
import { Badge } from '../ui/badge';

const STATUS_ORDER = [
  { key: 'not_started', label: 'Not Started', variant: 'not_started' },
  { key: 'ongoing',     label: 'Ongoing',     variant: 'ongoing' },
  { key: 'on_track',    label: 'On Track',    variant: 'on_track' },
  { key: 'at_risk',     label: 'At Risk',     variant: 'at_risk' },
  { key: 'completed',   label: 'Completed',   variant: 'completed' },
  { key: 'suspended',   label: 'Suspended',   variant: 'suspended' },
  { key: 'closed',      label: 'Closed',      variant: 'closed' },
  { key: '__none__',    label: 'No Status',   variant: 'default' },
];

const ViewByStatus = ({ plans, canEdit, onEdit, onDelete }) => {
  const [collapsed, setCollapsed] = useState(new Set());

  const groups = useMemo(() => {
    const map = {};
    plans.forEach(p => {
      const key = p.status || '__none__';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return STATUS_ORDER.filter(s => map[s.key]?.length > 0).map(s => ({
      ...s,
      plans: map[s.key],
    }));
  }, [plans]);

  const toggle = (key) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  if (groups.length === 0) {
    return <div className="text-center py-10 text-[13px] text-[#9CA3AF]">No projects found.</div>;
  }

  return (
    <div className="space-y-4">
      {groups.map(({ key, label, variant, plans: statusPlans }) => {
        const isCollapsed = collapsed.has(key);
        return (
          <div key={key} className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F6F3] transition-colors"
              style={{ backgroundColor: '#FAFAF8', borderBottom: isCollapsed ? 'none' : '1px solid #E8E6E0' }}
            >
              {isCollapsed
                ? <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                : <ChevronDown  className="w-4 h-4 text-[#9CA3AF]" />}
              <Badge variant={variant}>{label}</Badge>
              <span className="text-[11px] text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded-full">
                {statusPlans.length} record{statusPlans.length !== 1 ? 's' : ''}
              </span>
            </button>

            {!isCollapsed && (
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                    {['#', 'Project Name', 'Team', 'Owner', 'Progress', 'Start', 'End', 'Status', 'Bucket'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        {h}
                      </th>
                    ))}
                    {canEdit && <th className="px-4 py-3 w-20" />}
                  </tr>
                </thead>
                <tbody>
                  {statusPlans.map((plan, idx) => (
                    <PlanRow
                      key={plan.id}
                      plan={plan}
                      index={idx + 1}
                      canEdit={canEdit}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ViewByStatus;
