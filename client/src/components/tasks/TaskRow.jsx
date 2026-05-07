import { formatDate } from '../../utils/formatDate';
import { X } from 'lucide-react';

const toDateInput = (d) => (d ? d.slice(0, 10) : '');

const selectClass = `
  text-sm border-0 bg-transparent focus:ring-0 focus:outline-none w-full cursor-pointer
  transition-colors duration-100
`.trim();

const TaskRow = ({ task, buckets, users, onToggle, onUpdate, onDelete, canEdit }) => {
  const handleBucketChange   = (e) => onUpdate(task.id, { bucket_id: e.target.value ? Number(e.target.value) : null });
  const handleAssigneeChange = (e) => onUpdate(task.id, { assigned_to: e.target.value ? Number(e.target.value) : null });
  const handleDateChange     = (field) => (e) => onUpdate(task.id, { [field]: e.target.value || null });

  return (
    <tr
      className="border-b group transition-colors duration-100"
      style={{
        borderColor: '#F3F4F6',
        opacity: task.is_completed ? 0.55 : 1,
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* Checkbox */}
      <td className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={!!task.is_completed}
          onChange={() => onToggle(task.id)}
          disabled={!canEdit}
          className="w-4 h-4 rounded cursor-pointer"
          style={{ accentColor: '#0F6CBD' }}
        />
      </td>

      {/* Task name */}
      <td className="px-2 py-3">
        <span
          className="text-sm"
          style={{
            color: task.is_completed ? '#9CA3AF' : '#111827',
            fontWeight: task.is_completed ? 400 : 500,
            textDecoration: task.is_completed ? 'line-through' : 'none',
          }}
        >
          {task.name}
        </span>
      </td>

      {/* Assigned To */}
      <td className="px-2 py-3 w-40">
        {canEdit ? (
          <select
            value={task.assigned_to ?? ''}
            onChange={handleAssigneeChange}
            className={selectClass}
            style={{ color: task.assigned_to ? '#374151' : '#9CA3AF' }}
          >
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.display_name}</option>)}
          </select>
        ) : (
          <span className="text-sm" style={{ color: '#6B7280' }}>
            {users.find(u => u.id === task.assigned_to)?.display_name ?? '—'}
          </span>
        )}
      </td>

      {/* Bucket */}
      <td className="px-2 py-3 w-36">
        {canEdit ? (
          <select
            value={task.bucket_id ?? ''}
            onChange={handleBucketChange}
            className={selectClass}
            style={{ color: task.bucket_id ? '#374151' : '#9CA3AF' }}
          >
            <option value="">No bucket</option>
            {buckets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        ) : (
          <span className="text-sm" style={{ color: '#6B7280' }}>
            {buckets.find(b => b.id === task.bucket_id)?.name ?? '—'}
          </span>
        )}
      </td>

      {/* Start date */}
      <td className="px-2 py-3 w-32">
        {canEdit ? (
          <input
            type="date"
            value={toDateInput(task.start_date)}
            onChange={handleDateChange('start_date')}
            className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none w-full cursor-pointer"
            style={{ color: task.start_date ? '#374151' : '#9CA3AF' }}
          />
        ) : (
          <span className="text-sm" style={{ color: '#6B7280' }}>{formatDate(task.start_date)}</span>
        )}
      </td>

      {/* Finish date */}
      <td className="px-2 py-3 w-32">
        {canEdit ? (
          <input
            type="date"
            value={toDateInput(task.finish_date)}
            onChange={handleDateChange('finish_date')}
            className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none w-full cursor-pointer"
            style={{ color: task.finish_date ? '#374151' : '#9CA3AF' }}
          />
        ) : (
          <span className="text-sm" style={{ color: '#6B7280' }}>{formatDate(task.finish_date)}</span>
        )}
      </td>

      {/* Delete */}
      {canEdit && (
        <td className="px-2 py-3 w-10">
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded transition-colors duration-150 opacity-0 group-hover:opacity-100"
            title="Delete task"
            style={{ color: '#D1D5DB' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#DC2626';
              e.currentTarget.style.backgroundColor = '#FEF2F2';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#D1D5DB';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </td>
      )}
    </tr>
  );
};

export default TaskRow;
