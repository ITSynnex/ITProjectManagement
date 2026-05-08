import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PlanRow from './PlanRow';
import Avatar from '../common/Avatar';

const ViewByOwner = ({ plans, canEdit, onEdit, onDelete }) => {
  const [collapsed, setCollapsed] = useState(new Set());

  const groups = useMemo(() => {
    const map = {};
    plans.forEach(p => {
      const key = p.owner_name || 'Unassigned';
      if (!map[key]) map[key] = { owner: key, avatar: p.owner_avatar, plans: [] };
      map[key].plans.push(p);
    });
    return Object.values(map).sort((a, b) => a.owner.localeCompare(b.owner));
  }, [plans]);

  const toggle = (owner) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(owner) ? next.delete(owner) : next.add(owner);
    return next;
  });

  if (groups.length === 0) {
    return <div className="text-center py-10 text-[13px] text-[#9CA3AF]">No projects found.</div>;
  }

  return (
    <div className="space-y-4">
      {groups.map(({ owner, plans: ownerPlans }, gi) => {
        const isCollapsed = collapsed.has(owner);
        return (
          <div key={owner} className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <button
              onClick={() => toggle(owner)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F6F3] transition-colors"
              style={{ backgroundColor: '#FAFAF8', borderBottom: isCollapsed ? 'none' : '1px solid #E8E6E0' }}
            >
              {isCollapsed
                ? <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                : <ChevronDown  className="w-4 h-4 text-[#9CA3AF]" />}
              <Avatar name={owner} size="sm" />
              <span className="text-[13px] font-semibold text-[#1A1A1A]">{owner}</span>
              <span className="ml-2 text-[11px] text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded-full">
                {ownerPlans.length}
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
                  {ownerPlans.map((plan, idx) => (
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

export default ViewByOwner;
