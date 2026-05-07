import { useState, useEffect, useMemo } from 'react';
import { Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { getPlansGantt } from '../../api/plans.api';
import Spinner from '../common/Spinner';
import { Calendar } from 'lucide-react';

const DEFAULT_START = new Date();
const DEFAULT_END   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const parseDate = (str, fallback) => {
  if (!str) return fallback;
  const d = new Date(str);
  return isNaN(d.getTime()) ? fallback : d;
};

const buildTasks = (plans, collapsedSet) => {
  const tasks = [];
  plans.forEach(plan => {
    const start = parseDate(plan.start_date, DEFAULT_START);
    const end   = parseDate(plan.end_date,   new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000));
    const safeEnd = end > start ? end : new Date(start.getTime() + 24 * 60 * 60 * 1000);

    tasks.push({
      id:           `plan-${plan.id}`,
      name:         plan.name,
      start,
      end:          safeEnd,
      progress:     plan.progress ?? 0,
      type:         'project',
      hideChildren: collapsedSet.has(plan.id),
      styles: { progressColor: '#4F46E5', progressSelectedColor: '#4338CA' },
    });

    if (!collapsedSet.has(plan.id) && Array.isArray(plan.tasks)) {
      plan.tasks.forEach(t => {
        const ts = parseDate(t.start_date, start);
        const te = parseDate(t.finish_date, safeEnd);
        const safeTE = te > ts ? te : new Date(ts.getTime() + 24 * 60 * 60 * 1000);
        tasks.push({
          id:       `task-${t.id}`,
          name:     t.name,
          start:    ts,
          end:      safeTE,
          progress: t.is_completed ? 100 : (t.progress ?? 0),
          type:     'task',
          project:  `plan-${plan.id}`,
          styles: { progressColor: '#22C55E', progressSelectedColor: '#16A34A' },
        });
      });
    }
  });
  return tasks;
};

const VIEW_MODES = ['Day', 'Week', 'Month', 'Quarter', 'Year'];

const GanttOverview = () => {
  const [plans, setPlans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [collapsed, setCollapsed] = useState(new Set());
  const [viewMode, setViewMode] = useState('Month');

  useEffect(() => {
    getPlansGantt()
      .then(r => setPlans(r.data))
      .catch(() => setError('Failed to load Gantt data.'))
      .finally(() => setLoading(false));
  }, []);

  const plansWithDates = useMemo(
    () => plans.filter(p => p.start_date && p.end_date),
    [plans]
  );
  const plansNoDates = useMemo(
    () => plans.filter(p => !p.start_date || !p.end_date),
    [plans]
  );

  const tasks = useMemo(
    () => buildTasks(plansWithDates, collapsed),
    [plansWithDates, collapsed]
  );

  const handleExpanderClick = (task) => {
    const id = Number(task.id.replace('plan-', ''));
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error)   return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {/* View mode selector */}
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[#6B7280]">View:</span>
        {VIEW_MODES.map(m => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${
              viewMode === m
                ? 'bg-[#4F46E5] text-white'
                : 'bg-white border border-[#E8E6E0] text-[#6B7280] hover:bg-[#F7F6F3]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Plans without dates notice */}
      {plansNoDates.length > 0 && (
        <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF] bg-[#FAFAF8] border border-[#E8E6E0] rounded-lg px-4 py-2">
          <Calendar className="w-3.5 h-3.5" />
          {plansNoDates.length} project{plansNoDates.length !== 1 ? 's' : ''} hidden (no start/end dates):&nbsp;
          <span className="text-[#6B7280]">{plansNoDates.map(p => p.name).join(', ')}</span>
        </div>
      )}

      {/* Gantt */}
      {tasks.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <Gantt
            tasks={tasks}
            viewMode={viewMode}
            onExpanderClick={handleExpanderClick}
            listCellWidth="200px"
            columnWidth={viewMode === 'Day' ? 40 : viewMode === 'Week' ? 80 : viewMode === 'Month' ? 120 : 200}
            ganttHeight={Math.min(600, tasks.length * 50 + 60)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Calendar className="w-10 h-10 text-[#D1D5DB] mb-4" />
          <p className="text-[14px] font-medium text-[#374151]">No projects with date ranges</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Set start and end dates on your projects to see them on the Gantt chart.</p>
        </div>
      )}
    </div>
  );
};

export default GanttOverview;
