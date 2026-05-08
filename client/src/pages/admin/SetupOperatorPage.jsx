import { useState, useEffect } from 'react';
import { getPlans, updatePlan } from '../../api/plans.api';
import { getUsers } from '../../api/users.api';
import { Badge } from '../../components/ui/badge';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import { UserCircle } from 'lucide-react';

const TEAM_BADGE_VARIANTS = {
  DEV1: 'primary', DEV2: 'completed', INFRA: 'blocked', AI: 'default', PRODUCT: 'delayed',
};

const selectClass = 'w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-1.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent';

const SetupOperatorPage = () => {
  const [plans, setPlans]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState({});
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([getPlans(), getUsers()])
      .then(([plansRes, usersRes]) => {
        setPlans(plansRes.data);
        setUsers(usersRes.data);
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = async (planId, newOwnerId) => {
    setSaving(prev => ({ ...prev, [planId]: true }));
    try {
      const res = await updatePlan(planId, { owner_id: newOwnerId ? Number(newOwnerId) : null });
      setPlans(prev => prev.map(p => p.id === planId ? res.data : p));
    } catch {
      setError('Failed to update operator.');
    } finally {
      setSaving(prev => ({ ...prev, [planId]: false }));
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">

      <div className="bg-white border-b border-[#E8E6E0] px-6 py-5 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Setup Operator</h1>
        </div>
        <p className="text-[13px] text-[#6B7280] mt-1">Assign or change the operator for each project</p>
      </div>

      <div className="flex-1 overflow-auto p-6 min-h-0">
        {error && (
          <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : (
          <div
            className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                  {['#', 'Project Name', 'Team', 'Current Operator', 'Assign Operator'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, idx) => (
                  <tr
                    key={plan.id}
                    className="border-b border-[#E8E6E0] last:border-0 hover:bg-[#FAFAF8] transition-colors"
                  >
                    <td className="px-4 py-3 text-[12px] text-[#9CA3AF]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-medium text-[#1A1A1A]">{plan.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {plan.team
                        ? <Badge variant={TEAM_BADGE_VARIANTS[plan.team] || 'default'}>{plan.team}</Badge>
                        : <span className="text-[13px] text-[#9CA3AF]">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {plan.owner_name ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={plan.owner_name} size="sm" />
                          <span className="text-[13px] text-[#374151]">{plan.owner_name}</span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-xs">
                        <select
                          className={selectClass}
                          value={plan.owner_id || ''}
                          onChange={e => handleChange(plan.id, e.target.value)}
                          disabled={saving[plan.id]}
                        >
                          <option value="">— No operator —</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.display_name}</option>
                          ))}
                        </select>
                        {saving[plan.id] && (
                          <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap">Saving…</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {plans.length === 0 && (
              <div className="text-center py-10 text-[13px] text-[#9CA3AF]">No projects found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupOperatorPage;
