import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PlanRow from './PlanRow';

const ViewByOperator = ({ plans, canEdit, onEdit, onDelete }) => {
  const [collapsed, setCollapsed] = useState(new Set());

  const groups = useMemo(() => {
    const map = {};
    plans.forEach(p => {
      const key = p.operator_name || 'Unassigned';
      if (!map[key]) map[key] = { operator: key, plans: [] };
      map[key].plans.push(p);
    });
    return Object.values(map).sort((a, b) => {
      if (a.operator === 'Unassigned') return 1;
      if (b.operator === 'Unassigned') return -1;
      return a.operator.localeCompare(b.operator);
    });
  }, [plans]);

  const toggle = (operator) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(operator) ? next.delete(operator) : next.add(operator);
    return next;
  });

  if (groups.length === 0) {
    return <div className="text-center py-10 text-[13px] text-[#9CA3AF]">No projects found.</div>;
  }

  return (
    <div className="space-y-4">
      {groups.map(({ operator, plans: opPlans }) => {
        const isCollapsed = collapsed.has(operator);
        const initial = operator === 'Unassigned' ? '—' : operator[0].toUpperCase();
        return (
          <div key={operator} className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <button
              onClick={() => toggle(operator)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F6F3] transition-colors"
              style={{ backgroundColor: '#FAFAF8', borderBottom: isCollapsed ? 'none' : '1px solid #E8E6E0' }}
            >
              {isCollapsed
                ? <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                : <ChevronDown  className="w-4 h-4 text-[#9CA3AF]" />}
              <span className="w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                {initial}
              </span>
              <span className="text-[13px] font-semibold text-[#1A1A1A]">{operator}</span>
              <span className="ml-2 text-[11px] text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded-full">
                {opPlans.length}
              </span>
            </button>

            {!isCollapsed && (
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                    {['#', 'Project Name', 'Team', 'Operator', 'Progress', 'Start', 'End', 'Status', 'Priority'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        {h}
                      </th>
                    ))}
                    {canEdit && <th className="px-4 py-3 w-20" />}
                  </tr>
                </thead>
                <tbody>
                  {opPlans.map((plan, idx) => (
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

export default ViewByOperator;
