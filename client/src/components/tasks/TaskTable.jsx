import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';
import { formatDate } from '../../utils/formatDate';

/* ─── helpers ─── */
const toDateInput = (d) => (d ? d.slice(0, 10) : '');
const todayStr    = () => new Date().toISOString().slice(0, 10);

const effectiveStatus = (task) => {
  if (task.is_completed || task.status === 'completed') return 'completed';
  if (task.status === 'blocked') return 'blocked';
  if (task.finish_date && task.finish_date < todayStr()) return 'delayed';
  return 'in_progress';
};

const STATUS_CONFIG = {
  delayed:     { label: 'Delayed',     badge: 'delayed',     header: '#EF4444', headerBg: '#FEF2F2', progress: '#EF4444' },
  blocked:     { label: 'Blocked',     badge: 'blocked',     header: '#F97316', headerBg: '#FFF7ED', progress: '#F97316' },
  in_progress: { label: 'In Progress', badge: 'in_progress', header: '#EAB308', headerBg: '#FEFCE8', progress: '#EAB308' },
  completed:   { label: 'Completed',   badge: 'completed',   header: '#22C55E', headerBg: '#F0FDF4', progress: '#22C55E' },
};

const GROUP_ORDER = ['delayed', 'blocked', 'in_progress', 'completed'];

const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0891B2','#D97706','#DB2777','#059669'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const AssigneeAvatar = ({ name }) => {
  if (!name) return <span className="text-[11px] text-[#9CA3AF]">—</span>;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      title={name}
      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 select-none"
      style={{ backgroundColor: avatarColor(name) }}
    >
      {initials}
    </div>
  );
};

/* ─── Task row ─── */
const TaskRow = ({ task, rowNum, users, canEdit, onToggle, onUpdate, onDelete }) => {
  const status   = effectiveStatus(task);
  const cfg      = STATUS_CONFIG[status];
  const isOverdue = task.finish_date && task.finish_date < todayStr() && status !== 'completed';
  const assigneeName = users.find(u => u.id === task.assigned_to)?.display_name;

  const upd = (field, value) => onUpdate(task.id, { [field]: value });

  return (
    <tr
      className={cn('group border-b border-[#F0EEE8] transition-colors duration-75', task.is_completed && 'opacity-55')}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
    >
      {/* Checkbox */}
      <td className="pl-4 pr-1 py-2.5 w-8">
        <input
          type="checkbox"
          checked={!!task.is_completed}
          onChange={() => onToggle(task.id)}
          disabled={!canEdit}
          className="w-3.5 h-3.5 rounded cursor-pointer"
          style={{ accentColor: '#4F46E5' }}
        />
      </td>

      {/* Row number */}
      <td className="px-1 py-2.5 w-7 text-[11px] text-[#B0AEA8] tabular-nums">{rowNum}</td>

      {/* Task name */}
      <td className="px-3 py-2.5">
        <span className={cn('text-[13px]', task.is_completed ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]')}>
          {task.name}
        </span>
      </td>

      {/* Assignee */}
      <td className="px-2 py-2.5 w-12">
        {canEdit ? (
          <select
            value={task.assigned_to ?? ''}
            onChange={e => upd('assigned_to', e.target.value ? Number(e.target.value) : null)}
            className="appearance-none text-[11px] border-0 bg-transparent focus:ring-0 focus:outline-none cursor-pointer w-full text-[#374151]"
            style={{ maxWidth: '100%' }}
          >
            <option value="">—</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.display_name}</option>)}
          </select>
        ) : (
          <AssigneeAvatar name={assigneeName} />
        )}
      </td>

      {/* Status */}
      <td className="px-2 py-2.5 w-28">
        {canEdit ? (
          <select
            value={task.status ?? 'in_progress'}
            onChange={e => upd('status', e.target.value)}
            className="text-[11px] font-medium border-0 bg-transparent focus:ring-0 focus:outline-none cursor-pointer rounded"
            style={{
              color: { delayed:'#EF4444', blocked:'#F97316', in_progress:'#A16207', completed:'#16A34A' }[status] ?? '#374151',
            }}
          >
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
            <option value="blocked">Blocked</option>
          </select>
        ) : (
          <Badge variant={status} className="text-[11px]">{cfg.label}</Badge>
        )}
      </td>

      {/* Progress */}
      <td className="px-2 py-2.5 w-32">
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Progress value={task.progress ?? 0} color={cfg.progress} />
          </div>
          {canEdit ? (
            <input
              type="number"
              min="0" max="100"
              value={task.progress ?? 0}
              onChange={e => upd('progress', Math.min(100, Math.max(0, Number(e.target.value))))}
              onBlur={e => upd('progress', Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-9 text-[11px] border border-[#E8E6E0] rounded px-1 py-0.5 text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] tabular-nums"
            />
          ) : (
            <span className="text-[11px] text-[#6B7280] tabular-nums w-7 text-right">{task.progress ?? 0}%</span>
          )}
        </div>
      </td>

      {/* Start */}
      <td className="px-2 py-2.5 w-24">
        {canEdit ? (
          <input
            type="date"
            value={toDateInput(task.start_date)}
            onChange={e => upd('start_date', e.target.value || null)}
            className="text-[11px] border-0 bg-transparent text-[#374151] focus:ring-0 focus:outline-none cursor-pointer w-full"
          />
        ) : (
          <span className="text-[11px] text-[#6B7280]">{formatDate(task.start_date)}</span>
        )}
      </td>

      {/* Due */}
      <td className="px-2 py-2.5 w-24">
        {canEdit ? (
          <input
            type="date"
            value={toDateInput(task.finish_date)}
            onChange={e => upd('finish_date', e.target.value || null)}
            className={cn(
              'text-[11px] border-0 bg-transparent focus:ring-0 focus:outline-none cursor-pointer w-full',
              isOverdue ? 'text-red-500 font-medium' : 'text-[#374151]'
            )}
          />
        ) : (
          <span className={cn('text-[11px]', isOverdue ? 'text-red-500 font-medium' : 'text-[#6B7280]')}>
            {formatDate(task.finish_date)}
          </span>
        )}
      </td>

      {/* Notes */}
      <td className="px-2 py-2.5">
        {canEdit ? (
          <input
            type="text"
            defaultValue={task.notes ?? ''}
            onBlur={e => upd('notes', e.target.value || null)}
            placeholder="Add note…"
            className="w-full text-[11px] border-0 bg-transparent text-[#374151] focus:ring-0 focus:outline-none placeholder-[#C4C0B8]"
          />
        ) : (
          <span className="text-[11px] text-[#6B7280]">{task.notes || '—'}</span>
        )}
      </td>

      {/* Delete */}
      {canEdit && (
        <td className="pr-3 py-2.5 w-8">
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#D1D5DB] hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </td>
      )}
    </tr>
  );
};

/* ─── Group header ─── */
const GroupHeader = ({ status, count, collapsed, onToggle }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <tr
      className="cursor-pointer select-none hover:brightness-95 transition-all"
      style={{ backgroundColor: cfg.headerBg }}
      onClick={onToggle}
    >
      <td colSpan={10} className="px-4 py-2">
        <div className="flex items-center gap-2">
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-[#9CA3AF]" />
            : <ChevronDown  className="w-3 h-3 text-[#9CA3AF]" />
          }
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: cfg.header }}>
            {cfg.label}
          </span>
          <span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: cfg.header + '22', color: cfg.header }}
          >
            {count}
          </span>
        </div>
      </td>
    </tr>
  );
};

/* ─── Add task footer row ─── */
const AddTaskRow = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try { await onAdd(name.trim()); setName(''); }
    finally { setBusy(false); }
  };

  return (
    <tr className="border-t border-[#E8E6E0]" style={{ backgroundColor: '#FAFAF8' }}>
      <td colSpan={10} className="px-4 py-2.5">
        <form onSubmit={submit} className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 text-[13px] text-[#1A1A1A] placeholder-[#C4C0B8] border-0 bg-transparent focus:outline-none"
          />
          {name.trim() && (
            <button
              type="submit"
              disabled={busy}
              className="text-[11px] font-medium bg-[#1A1A1A] text-white px-2.5 py-1 rounded-md hover:bg-[#2D2D2D] disabled:opacity-40 transition-colors"
            >
              {busy ? '…' : 'Add task'}
            </button>
          )}
        </form>
      </td>
    </tr>
  );
};

/* ─── Main export ─── */
const TaskTable = ({ tasks, buckets, users, canEdit, onToggle, onUpdate, onDelete, onAdd }) => {
  const [collapsed, setCollapsed] = useState({});
  const toggle = (s) => setCollapsed(c => ({ ...c, [s]: !c[s] }));

  const groups = GROUP_ORDER.reduce((acc, s) => {
    acc[s] = tasks.filter(t => effectiveStatus(t) === s);
    return acc;
  }, {});

  let counter = 0;

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E8E6E0] bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
            <th className="pl-4 pr-1 py-2.5 w-8" />
            <th className="px-1 py-2.5 w-7 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">#</th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Task Name</th>
            <th className="px-2 py-2.5 w-12 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Who</th>
            <th className="px-2 py-2.5 w-28 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Status</th>
            <th className="px-2 py-2.5 w-32 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Progress</th>
            <th className="px-2 py-2.5 w-24 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Start</th>
            <th className="px-2 py-2.5 w-24 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Due</th>
            <th className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Notes</th>
            {canEdit && <th className="pr-3 w-8" />}
          </tr>
        </thead>
        <tbody>
          {GROUP_ORDER.map(status => {
            const group = groups[status];
            if (group.length === 0) return null;
            const isCollapsed = !!collapsed[status];
            return (
              <React.Fragment key={status}>
                <GroupHeader
                  status={status}
                  count={group.length}
                  collapsed={isCollapsed}
                  onToggle={() => toggle(status)}
                />
                {!isCollapsed && group.map(task => {
                  counter++;
                  return (
                    <TaskRow
                      key={task.id}
                      task={task}
                      rowNum={counter}
                      users={users}
                      canEdit={canEdit}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}

          {tasks.length === 0 && (
            <tr>
              <td colSpan={10} className="text-center py-12 text-sm text-[#9CA3AF]">
                No tasks yet
              </td>
            </tr>
          )}

          {canEdit && onAdd && <AddTaskRow onAdd={onAdd} />}
        </tbody>
      </table>
    </div>
  );
};

export { TaskTable, effectiveStatus };
