import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../api/plans.api';
import { getActiveDepartments } from '../../api/departments.api';
import { getActiveOperators } from '../../api/operators.api';
import PlanForm from '../../components/plans/PlanForm';
import PlanRow from '../../components/plans/PlanRow';
import ViewByOwner from '../../components/plans/ViewByOwner';
import ViewByStatus from '../../components/plans/ViewByStatus';
import GanttOverview from '../../components/gantt/GanttOverview';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { Plus, FolderKanban, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

const DASHBOARD_TABS = [
  { key: 'all',      label: 'All Projects' },
  { key: 'by_owner', label: 'View by Owner' },
  { key: 'by_status',label: 'View by Status' },
  { key: 'gantt',    label: 'Gantt chart' },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const teamFilter  = searchParams.get('team');
  const groupFilter = searchParams.get('group');

  const [plans, setPlans]               = useState([]);
  const [operators, setOperators]       = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]             = useState('');
  const [activeTab, setActiveTab]       = useState('all');

  const canEdit = user?.role === 'it_manager' || user?.role === 'pmo';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPlans(),
      getActiveDepartments(),
      getActiveOperators(),
    ])
      .then(([plansRes, deptsRes, opsRes]) => {
        setPlans(plansRes.data);
        setDepartments(deptsRes.data);
        setOperators(opsRes.data);
      })
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

  const title = teamFilter
    ? `${teamFilter} Projects`
    : groupFilter
    ? `${groupFilter} Projects`
    : 'Projects';

  const commonProps = {
    canEdit,
    onEdit: p => { setEditTarget(p); setShowForm(true); },
    onDelete: setDeleteTarget,
  };

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-[#E8E6E0] px-6 pt-5 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between pb-4">
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

        {/* Tab bar */}
        <div className="flex gap-0">
          {DASHBOARD_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors duration-100',
                activeTab === tab.key
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
              )}
            >
              {tab.label}
            </button>
          ))}
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
          <>
            {/* ── All Projects tab ── */}
            {activeTab === 'all' && (
              <div className="space-y-4">
                <div className="relative w-72">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
                  <Input
                    placeholder="Search projects…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
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
                      {filtered.map((plan, idx) => (
                        <PlanRow
                          key={plan.id}
                          plan={plan}
                          index={idx + 1}
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

            {/* ── View by Owner tab ── */}
            {activeTab === 'by_owner' && (
              <ViewByOwner plans={filtered} {...commonProps} />
            )}

            {/* ── View by Status tab ── */}
            {activeTab === 'by_status' && (
              <ViewByStatus plans={filtered} {...commonProps} />
            )}

            {/* ── Gantt chart tab ── */}
            {activeTab === 'gantt' && (
              <GanttOverview />
            )}
          </>
        )}
      </div>

      {showForm && (
        <PlanForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSave={handleSave}
          initial={editTarget}
          operators={operators}
          departments={departments}
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
