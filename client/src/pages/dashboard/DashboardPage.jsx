import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../api/plans.api';
import PlanForm from '../../components/plans/PlanForm';
import PlanRow from '../../components/plans/PlanRow';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { Plus, FolderKanban, Search } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const teamFilter = searchParams.get('team');

  const [plans, setPlans]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]             = useState('');

  const canEdit = user?.role === 'it_manager' || user?.role === 'pmo';

  useEffect(() => {
    setLoading(true);
    getPlans()
      .then(r => setPlans(r.data))
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data) => {
    if (editTarget) {
      const r = await updatePlan(editTarget.id, data);
      setPlans(prev => prev.map(p => p.id === editTarget.id ? r.data : p));
    } else {
      const r = await createPlan(data);
      setPlans(prev => [...prev, r.data]);
    }
    setEditTarget(null);
  };

  const handleDelete = async () => {
    try {
      await deletePlan(deleteTarget.id);
      setPlans(prev => prev.filter(p => p.id !== deleteTarget.id));
    } catch { setError('Failed to delete.'); }
    finally  { setDeleteTarget(null); }
  };

  let filtered = teamFilter
    ? plans.filter(p => p.team === teamFilter)
    : plans;

  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  const title = teamFilter ? `${teamFilter} Projects` : 'Projects';

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-[#E8E6E0] px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">{title}</h1>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          {canEdit && (
            <Button variant="default" size="sm" onClick={() => { setEditTarget(null); setShowForm(true); }}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Project
            </Button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-6 min-h-0">

        {error && (
          <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <FolderKanban className="w-7 h-7 text-indigo-500" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1">No projects yet</h3>
            <p className="text-[13px] text-[#6B7280] max-w-xs">
              {canEdit ? 'Create your first project to start managing tasks.' : 'No projects have been created yet.'}
            </p>
            {canEdit && (
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> New Project
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
              <Input
                placeholder="Search projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                    {['Project Name', 'Team', 'Owner', 'Progress', 'Start', 'End', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        {h}
                      </th>
                    ))}
                    {canEdit && <th className="px-4 py-3 w-20" />}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(plan => (
                    <PlanRow
                      key={plan.id}
                      plan={plan}
                      canEdit={canEdit}
                      onEdit={p => { setEditTarget(p); setShowForm(true); }}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-10 text-[13px] text-[#9CA3AF]">
                  {search
                    ? `No projects match "${search}"`
                    : `No projects in team ${teamFilter}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <PlanForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSave={handleSave}
          initial={editTarget}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? All tasks and buckets will be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
