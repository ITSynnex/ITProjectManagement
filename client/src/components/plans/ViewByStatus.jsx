import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PlanRow from './PlanRow';
import { Badge } from '../ui/badge';

const FALLBACK_ORDER = [
  { name: 'not_started', label: 'Not Started', color: 'not_started' },
  { name: 'ongoing',     label: 'Ongoing',     color: 'ongoing' },
  { name: 'on_track',    label: 'On Track',    color: 'on_track' },
  { name: 'at_risk',     label: 'At Risk',     color: 'at_risk' },
  { name: 'completed',   label: 'Completed',   color: 'completed' },
  { name: 'suspended',   label: 'Suspended',   color: 'suspended' },
  { name: 'closed',      label: 'Closed',      color: 'closed' },
];

const ViewByStatus = ({ plans, statuses, canEdit, onEdit, onDelete }) => {
  const [collapsed, setCollapsed] = useState(new Set());

  const statusOrder = statuses?.length ? statuses : FALLBACK_ORDER;

  const groups = useMemo(() => {
    const map = {};
    plans.forEach(p => {
      const key = p.status || '__none__';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });

    const ordered = statusOrder
      .filter(s => map[s.name]?.length > 0)
      .map(s => ({ key: s.name, label: s.label, color: s.color, plans: map[s.name] }));

    if (map['__none__']?.length) {
      ordered.push({ key: '__none__', label: 'No Status', color: 'default', plans: map['__none__'] });
    }

    // Append any plan statuses not in statusOrder (e.g. custom ones not yet loaded)
    Object.keys(map).forEach(key => {
      if (key !== '__none__' && !ordered.find(g => g.key === key)) {
        ordered.push({ key, label: key, color: 'default', plans: map[key] });
      }
    });

    return ordered;
  }, [plans, statusOrder]);

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
      {groups.map(({ key, label, color, plans: statusPlans }) => {
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
              <Badge variant={color}>{label}</Badge>
              <span className="text-[11px] text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded-full">
                {statusPlans.length} record{statusPlans.length !== 1 ? 's' : ''}
              </span>
            </button>

            {!isCollapsed && (
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                    {['#', 'Project Name', 'Team', 'Operator', 'Progress', 'Start', 'End', 'Status', 'Health', 'Priority'].map(h => (
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
