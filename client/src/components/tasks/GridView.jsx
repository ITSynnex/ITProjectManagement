import { useState } from 'react';
import { createTask, updateTask, completeTask, deleteTask } from '../../api/tasks.api';
import TaskRow from './TaskRow';
import { Plus, Search, Tag, X } from 'lucide-react';

const GridView = ({ planId, tasks, setTasks, buckets, users, canEdit, onAddBucket, onDeleteBucket }) => {
  const [newName, setNewName]             = useState('');
  const [adding, setAdding]               = useState(false);
  const [filter, setFilter]               = useState('');
  const [newBucketName, setNewBucketName] = useState('');
  const [addingBucket, setAddingBucket]   = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await createTask(planId, { name: newName.trim() });
      setTasks(prev => [...prev, res.data]);
      setNewName('');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    const res = await completeTask(id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: res.data.is_completed } : t));
  };

  const handleUpdate = async (id, data) => {
    const res = await updateTask(id, data);
    setTasks(prev => prev.map(t => t.id === id ? res.data : t));
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddBucket = async (e) => {
    e.preventDefault();
    if (!newBucketName.trim() || !onAddBucket) return;
    setAddingBucket(true);
    try {
      await onAddBucket(newBucketName.trim());
      setNewBucketName('');
    } finally {
      setAddingBucket(false);
    }
  };

  const filtered = filter
    ? tasks.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()))
    : tasks;

  return (
    <div>
      {/* Bucket management bar */}
      {canEdit && onAddBucket && (
        <div
          className="flex items-center gap-2 mb-4 flex-wrap px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'white', border: '1px solid #E8E8E8' }}
        >
          <Tag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9CA3AF' }} />
          <span className="text-xs font-semibold mr-1" style={{ color: '#6B7280' }}>Buckets</span>

          {buckets.length === 0 && (
            <span className="text-xs italic" style={{ color: '#9CA3AF' }}>No buckets yet</span>
          )}

          {buckets.map(b => (
            <span
              key={b.id}
              className="flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1"
              style={{ backgroundColor: '#EBF4FF', color: '#0F6CBD' }}
            >
              {b.name}
              <button
                type="button"
                onClick={() => onDeleteBucket(b.id)}
                className="transition-colors duration-100 ml-0.5"
                style={{ color: 'rgba(15,108,189,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(15,108,189,0.5)'}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <form onSubmit={handleAddBucket} className="flex items-center gap-1.5 ml-auto">
            <input
              value={newBucketName}
              onChange={e => setNewBucketName(e.target.value)}
              placeholder="New bucket…"
              className="text-xs px-2.5 py-1 rounded-lg focus:outline-none w-36"
              style={{
                border: '1px solid #E8E8E8',
                backgroundColor: '#FAFAFA',
                color: '#111827',
              }}
              onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(15,108,189,0.2)'}
              onBlur={e => e.target.style.boxShadow = 'none'}
            />
            <button
              type="submit"
              disabled={addingBucket || !newBucketName.trim()}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white rounded-lg transition-colors duration-150 disabled:opacity-40"
              style={{ backgroundColor: '#0F6CBD' }}
              onMouseEnter={e => !addingBucket && newBucketName.trim() && (e.currentTarget.style.backgroundColor = '#0E5BAB')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0F6CBD')}
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </form>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: '#9CA3AF' }}
          />
          <input
            type="text"
            placeholder="Filter tasks…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none w-52 transition-shadow"
            style={{ border: '1px solid #E8E8E8', backgroundColor: 'white', color: '#111827' }}
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(15,108,189,0.2)'}
            onBlur={e => e.target.style.boxShadow = 'none'}
          />
        </div>
        <span className="text-xs" style={{ color: '#9CA3AF' }}>
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'white', border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
              <th className="px-4 py-3 w-10" />
              <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>Task</th>
              <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide w-40" style={{ color: '#6B7280' }}>Assigned To</th>
              <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide w-36" style={{ color: '#6B7280' }}>Bucket</th>
              <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide w-32" style={{ color: '#6B7280' }}>Start</th>
              <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide w-32" style={{ color: '#6B7280' }}>Finish</th>
              {canEdit && <th className="px-2 py-3 w-10" />}
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                buckets={buckets}
                users={users}
                canEdit={canEdit}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={canEdit ? 7 : 6}
                  className="text-center py-12 text-sm"
                  style={{ color: '#9CA3AF' }}
                >
                  {filter ? `No tasks match "${filter}"` : 'No tasks yet — add one below'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {canEdit && (
          <form
            onSubmit={handleAdd}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderTop: '1px solid #F3F4F6', backgroundColor: '#FAFAFA' }}
          >
            <Plus className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Add a task…"
              className="flex-1 text-sm border-0 bg-transparent focus:outline-none"
              style={{ color: '#111827' }}
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="text-xs font-medium text-white px-3 py-1.5 rounded-lg transition-colors duration-150 disabled:opacity-40"
              style={{ backgroundColor: '#0F6CBD' }}
              onMouseEnter={e => !adding && newName.trim() && (e.currentTarget.style.backgroundColor = '#0E5BAB')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0F6CBD')}
            >
              {adding ? '…' : 'Add'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GridView;
