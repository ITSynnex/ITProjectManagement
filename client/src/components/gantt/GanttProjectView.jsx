import { useMemo, useState } from 'react';
import { Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Calendar } from 'lucide-react';

const parseDate = (str, fallback) => {
  if (!str) return fallback;
  const d = new Date(str);
  return isNaN(d.getTime()) ? fallback : d;
};

const VIEW_MODES = ['Day', 'Week', 'Month', 'Quarter'];

const GanttProjectView = ({ plan, tasks, buckets }) => {
  const [viewMode, setViewMode] = useState('Month');

  const planStart = parseDate(plan?.start_date, new Date());
  const planEnd   = parseDate(plan?.end_date,   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const ganttTasks = useMemo(() => {
    const result = [];

    const bucketsWithTasks = buckets.filter(b =>
      tasks.some(t => t.bucket_id === b.id)
    );

    bucketsWithTasks.forEach(bucket => {
      const bTasks = tasks.filter(t => t.bucket_id === bucket.id);
      const bStart = bTasks.reduce((min, t) => {
        const d = parseDate(t.start_date, planStart);
        return d < min ? d : min;
      }, planEnd);
      const bEnd = bTasks.reduce((max, t) => {
        const d = parseDate(t.finish_date, planEnd);
        return d > max ? d : max;
      }, planStart);
      const safeBEnd = bEnd > bStart ? bEnd : new Date(bStart.getTime() + 24 * 60 * 60 * 1000);

      result.push({
        id:       `bucket-${bucket.id}`,
        name:     bucket.name,
        start:    bStart,
        end:      safeBEnd,
        progress: 0,
        type:     'project',
        hideChildren: false,
        styles: { progressColor: '#4F46E5', progressSelectedColor: '#4338CA' },
      });

      bTasks.forEach(t => {
        const ts = parseDate(t.start_date, planStart);
        const te = parseDate(t.finish_date, planEnd);
        const safeTE = te > ts ? te : new Date(ts.getTime() + 24 * 60 * 60 * 1000);
        result.push({
          id:       `task-${t.id}`,
          name:     t.name,
          start:    ts,
          end:      safeTE,
          progress: t.is_completed ? 100 : (t.progress ?? 0),
          type:     'task',
          project:  `bucket-${bucket.id}`,
          styles: { progressColor: '#22C55E', progressSelectedColor: '#16A34A' },
        });
      });
    });

    // Tasks not in any bucket
    const unbucketedTasks = tasks.filter(t => !t.bucket_id);
    unbucketedTasks.forEach(t => {
      const ts = parseDate(t.start_date, planStart);
      const te = parseDate(t.finish_date, planEnd);
      const safeTE = te > ts ? te : new Date(ts.getTime() + 24 * 60 * 60 * 1000);
      result.push({
        id:       `task-${t.id}`,
        name:     t.name,
        start:    ts,
        end:      safeTE,
        progress: t.is_completed ? 100 : (t.progress ?? 0),
        type:     'task',
        styles: { progressColor: '#22C55E', progressSelectedColor: '#16A34A' },
      });
    });

    return result;
  }, [tasks, buckets, planStart, planEnd]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Calendar className="w-10 h-10 text-[#D1D5DB] mb-4" />
        <p className="text-[14px] font-medium text-[#374151]">No tasks yet</p>
        <p className="text-[13px] text-[#9CA3AF] mt-1">Add tasks to this project to see them on the Gantt chart.</p>
      </div>
    );
  }

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

      <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          listCellWidth="200px"
          columnWidth={viewMode === 'Day' ? 40 : viewMode === 'Week' ? 80 : 120}
          ganttHeight={Math.min(500, ganttTasks.length * 50 + 60)}
        />
      </div>
    </div>
  );
};

export default GanttProjectView;
