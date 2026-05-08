import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlan, updatePlan, deletePlan } from '../../api/plans.api';
import { getTasks, createTask, updateTask, completeTask, deleteTask } from '../../api/tasks.api';
import { getBuckets, createBucket, deleteBucket } from '../../api/buckets.api';
import { getUsers } from '../../api/users.api';
import { getActiveDepartments } from '../../api/departments.api';
import { getActiveOperators } from '../../api/operators.api';
import PlanForm from '../../components/plans/PlanForm';
import { TaskTable, effectiveStatus } from '../../components/tasks/TaskTable';
import BoardView from '../../components/tasks/BoardView';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardValue } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Pencil, Trash2, Plus, X, Search,
  CheckCircle2, Clock, AlertTriangle, TrendingUp,
  Filter, Users as UsersIcon, UserCircle,
} from 'lucide-react';
import GanttProjectView from '../../components/gantt/GanttProjectView';
import { cn } from '../../lib/utils';

const PLAN_STATUS_CONFIG = {
  on_track:    { variant: 'on_track',    label: 'On Track' },
  at_risk:     { variant: 'at_risk',     label: 'At Risk' },
  closed:      { variant: 'closed',      label: 'Closed' },
  not_started: { variant: 'not_started', label: 'Not Started' },
  ongoing:     { variant: 'ongoing',     label: 'Ongoing' },
  completed:   { variant: 'completed',   label: 'Completed' },
  suspended:   { variant: 'suspended',   label: 'Suspended' },
};

const FILTER_TABS = [
  { key: 'all',         label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
  { key: 'delayed',     label: 'Delayed' },
  { key: 'blocked',     label: 'Blocked' },
];

const DETAIL_TABS = ['Tasks', 'Board', 'Reports'];

const PlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plan, setPlan]         = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [buckets, setBuckets]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [operators, setOperators] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [detailTab, setDetailTab] = useState('Tasks');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newBucket, setNewBucket]   = useState('');
  const [addingBucket, setAddingBucket] = useState(false);

  /* filter state */
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const canEdit = user?.role === 'it_manager' || user?.role === 'pmo';

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const requests = [getPlan(id), getTasks(id), getBuckets(id), getActiveDepartments(), getActiveOperators()];
        if (user?.role === 'it_manager' || user?.role === 'pmo') requests.push(getUsers());
        const [planRes, taskRes, bucketRes, deptsRes, opsRes, userRes] = await Promise.all(requests);
        setPlan(planRes.data);
        setTasks(taskRes.data);
        setBuckets(bucketRes.data);
        setDepartments(deptsRes.data);
        setOperators(opsRes.data);
        if (userRes) setUsers(userRes.data);
      } catch {
        setError('Failed to load project.');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [id]);

  /* task mutations */
  const handleToggle = async (taskId) => {
    const res = await completeTask(taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...res.data } : t));
  };

  const handleUpdate = async (taskId, data) => {
    const res = await updateTask(taskId, data);
    setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAdd = async (name) => {
    const res = await createTask(id, { name });
    setTasks(prev => [...prev, res.data]);
  };

  /* bucket mutations */
  const handleAddBucket = async (e) => {
    e.preventDefault();
    if (!newBucket.trim()) return;
    setAddingBucket(true);
    try {
      const res = await createBucket(id, { name: newBucket.trim() });
      setBuckets(prev => [...prev, res.data]);
      setNewBucket('');
    } finally { setAddingBucket(false); }
  };

  const handleDeleteBucket = async (bucketId) => {
    await deleteBucket(id, bucketId);
    setBuckets(prev => prev.filter(b => b.id !== bucketId));
    setTasks(prev => prev.map(t => t.bucket_id === bucketId ? { ...t, bucket_id: null } : t));
  };

  const addBucketByName = async (name) => {
    const res = await createBucket(id, { name });
    setBuckets(prev => [...prev, res.data]);
  };

  /* plan mutations */
  const handleSavePlan = async (data) => {
    const res = await updatePlan(id, data);
    setPlan(res.data);
  };

  const handleDeletePlan = async () => {
    try { await deletePlan(id); navigate('/plans'); }
    catch { setError('Failed to delete.'); setShowDelete(false); }
  };

  /* stats */
  const stats = useMemo(() => {
    const total     = tasks.length;
    const completed = tasks.filter(t => effectiveStatus(t) === 'completed').length;
    const delayed   = tasks.filter(t => effectiveStatus(t) === 'delayed').length;
    const avgProg   = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, delayed, avgProg };
  }, [tasks]);

  /* filtered tasks */
  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (search) list = list.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') list = list.filter(t => effectiveStatus(t) === statusFilter);
    return list;
  }, [tasks, search, statusFilter]);

  /* status tab counts */
  const tabCounts = useMemo(() => {
    const counts = { all: tasks.length };
    ['in_progress','completed','delayed','blocked'].forEach(s => {
      counts[s] = tasks.filter(t => effectiveStatus(t) === s).length;
    });
    return counts;
  }, [tasks]);

  if (loading) return <div className="flex justify-center py-20"><Spinner text="Loading project…" /></div>;
  if (error)   return <div className="p-6 text-sm text-red-600">{error}</div>;
  if (!plan)   return null;

  const planStatusCfg = PLAN_STATUS_CONFIG[plan.status];

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-[#E8E6E0] px-6 pt-5 pb-0 flex-shrink-0">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF] mb-3">
          <button
            onClick={() => navigate('/plans')}
            className="flex items-center gap-1 hover:text-[#4F46E5] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Project
          </button>
          <span>/</span>
          <span className="text-[#6B7280] truncate">{plan.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">{plan.name}</h1>
              {planStatusCfg && (
                <Badge variant={planStatusCfg.variant}>{planStatusCfg.label}</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-[13px] text-[#6B7280] flex-wrap">
              {plan.start_date && (
                <span>{formatDate(plan.start_date)} → {formatDate(plan.end_date)}</span>
              )}
              {plan.operator_name && (
                <span className="flex items-center gap-1">
                  <UserCircle className="w-3.5 h-3.5" />
                  <span className="font-medium text-[#374151]">Operator:</span> {plan.operator_name}
                </span>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Detail tabs */}
        <div className="flex gap-0">
          {DETAIL_TABS.map(t => (
            <button
              key={t}
              onClick={() => setDetailTab(t)}
              className={cn(
                'px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors duration-100',
                detailTab === t
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-6 min-h-0">

        {/* ── Tasks tab ── */}
        {detailTab === 'Tasks' && (
          <div className="space-y-5">

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Total */}
              <Card>
                <CardHeader>
                  <CardTitle>Total tasks</CardTitle>
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardValue>{stats.total}</CardValue>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">across all statuses</p>
                </CardContent>
              </Card>

              {/* Completed */}
              <Card>
                <CardHeader>
                  <CardTitle>Completed</CardTitle>
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardValue className="text-green-600">{stats.completed}</CardValue>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">
                    {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              {/* Delayed */}
              <Card>
                <CardHeader>
                  <CardTitle>Delayed</CardTitle>
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardValue className="text-red-600">{stats.delayed}</CardValue>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">past due date</p>
                </CardContent>
              </Card>

              {/* Avg progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Avg. progress</CardTitle>
                  <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardValue>{stats.avgProg}%</CardValue>
                  <div className="mt-2">
                    <Progress
                      value={stats.avgProg}
                      color={stats.avgProg >= 70 ? '#22C55E' : stats.avgProg >= 40 ? '#EAB308' : '#EF4444'}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status tabs */}
              <div className="flex items-center gap-0 bg-white border border-[#E8E6E0] rounded-lg p-0.5 flex-shrink-0">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-medium transition-colors',
                      statusFilter === tab.key
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#6B7280] hover:text-[#1A1A1A]'
                    )}
                  >
                    {tab.label}
                    <span className={cn(
                      'text-[11px] font-medium px-1 rounded',
                      statusFilter === tab.key ? 'text-white/70' : 'text-[#9CA3AF]'
                    )}>
                      {tabCounts[tab.key]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
                <Input
                  placeholder="Search tasks…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-[12px]"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-[12px]">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="text-[12px]">
                  <UsersIcon className="w-3.5 h-3.5" /> Assignee
                </Button>
                {canEdit && (
                  <Button variant="default" size="sm" className="text-[12px]">
                    <Plus className="w-3.5 h-3.5" /> New task
                  </Button>
                )}
              </div>
            </div>

            {/* Task table */}
            <TaskTable
              tasks={filteredTasks}
              buckets={buckets}
              operators={operators}
              canEdit={canEdit}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAdd={canEdit ? handleAdd : null}
            />
          </div>
        )}

        {/* ── Board tab ── */}
        {detailTab === 'Board' && (
          <div>
            {canEdit && (
              <form onSubmit={handleAddBucket} className="flex items-center gap-2 mb-5 flex-wrap">
                <input
                  value={newBucket}
                  onChange={e => setNewBucket(e.target.value)}
                  placeholder="New bucket name…"
                  className="rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] w-44 border border-[#E8E6E0] bg-white"
                />
                <Button type="submit" size="sm" variant="outline" disabled={addingBucket || !newBucket.trim()}>
                  <Plus className="w-3.5 h-3.5" /> Add bucket
                </Button>
                {buckets.map(b => (
                  <span key={b.id} className="flex items-center gap-1 text-[12px] font-medium rounded-full px-2.5 py-1 bg-indigo-50 text-indigo-700">
                    {b.name}
                    <button type="button" onClick={() => handleDeleteBucket(b.id)} className="ml-0.5 text-indigo-400 hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </form>
            )}
            <BoardView
              planId={id}
              tasks={tasks}
              setTasks={setTasks}
              buckets={buckets}
              operators={operators}
              canEdit={canEdit}
            />
          </div>
        )}

        {/* ── Reports tab ── */}
        {detailTab === 'Reports' && (
          <div className="space-y-6">
            <h2 className="text-[13px] font-semibold text-[#374151]">Task Summary</h2>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total',     value: stats.total,     color: '#1A1A1A', bg: '#F7F6F3' },
                { label: 'Completed', value: stats.completed, color: '#16A34A', bg: '#F0FDF4' },
                { label: 'Remaining', value: stats.total - stats.completed, color: '#4F46E5', bg: '#EEF2FF' },
              ].map(({ label, value, color, bg }) => (
                <Card key={label}>
                  <CardContent className="pt-5 text-center">
                    <p className="text-[12px] text-[#6B7280] mb-2">{label}</p>
                    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="max-w-2xl">
              <Card>
                <CardHeader><CardTitle>Progress by bucket</CardTitle></CardHeader>
                <CardContent>
                  {buckets.length === 0 ? (
                    <p className="text-[12px] text-[#9CA3AF]">No buckets defined.</p>
                  ) : (
                    <div className="space-y-4">
                      {buckets.map(b => {
                        const bTasks = tasks.filter(t => t.bucket_id === b.id);
                        const done   = bTasks.filter(t => effectiveStatus(t) === 'completed').length;
                        const pct    = bTasks.length ? Math.round((done / bTasks.length) * 100) : 0;
                        return (
                          <div key={b.id}>
                            <div className="flex justify-between text-[12px] mb-1.5">
                              <span className="font-medium text-[#374151]">{b.name}</span>
                              <span className="text-[#9CA3AF]">{done}/{bTasks.length}</span>
                            </div>
                            <Progress value={pct} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Gantt chart */}
            <div>
              <h2 className="text-[13px] font-semibold text-[#374151] mb-4">Gantt chart</h2>
              <GanttProjectView plan={plan} tasks={tasks} buckets={buckets} />
            </div>
          </div>
        )}
      </div>

      {showEdit && (
        <PlanForm open={showEdit} onClose={() => setShowEdit(false)} onSave={handleSavePlan} initial={plan} operators={operators} departments={departments} />
      )}
      {showDelete && (
        <ConfirmDialog
          message={`Delete "${plan.name}"? All tasks and buckets will be permanently removed.`}
          onConfirm={handleDeletePlan}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
};

export default PlanDetailPage;
