import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import CommentThread from '../comments/CommentThread';
import TaskForm from './TaskForm';
import ConfirmDialog from '../common/ConfirmDialog';
import { priorityColor, statusColor } from '../../utils/priorityColor';
import { formatDate } from '../../utils/formatDate';
import { updateTask, deleteTask } from '../../api/tasks.api';
import { useAuth } from '../../context/AuthContext';

const TaskDetail = ({ task, onClose, onUpdated, onDeleted }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleUpdate = async (data) => {
    const res = await updateTask(task.id, data);
    onUpdated(res.data);
    setEditing(false);
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onDeleted(task.id);
    onClose();
  };

  if (editing) {
    return (
      <Modal title="Edit Task" onClose={() => setEditing(false)} size="lg">
        <TaskForm initial={task} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
      </Modal>
    );
  }

  return (
    <>
      <Modal title={task.title} onClose={onClose} size="lg">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge label={task.status} className={statusColor(task.status)} />
            <Badge label={task.priority} className={priorityColor(task.priority)} />
          </div>
          {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Assignee:</span>{' '}
              <span className="font-medium">{task.assignee_name || 'Unassigned'}</span>
            </div>
            <div>
              <span className="text-gray-500">Deadline:</span>{' '}
              <span className="font-medium">{formatDate(task.deadline)}</span>
            </div>
          </div>

          {user.role === 'PMO' && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">Edit Task</button>
              <button onClick={() => setConfirmDelete(true)} className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Delete Task</button>
            </div>
          )}
          {user.role === 'DEV' && (
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <select
                defaultValue={task.status}
                onChange={async (e) => { const res = await updateTask(task.id, { status: e.target.value }); onUpdated(res.data); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['To Do','In Progress','Done'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <CommentThread taskId={task.id} />
          </div>
        </div>
      </Modal>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete task "${task.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
};

export default TaskDetail;
