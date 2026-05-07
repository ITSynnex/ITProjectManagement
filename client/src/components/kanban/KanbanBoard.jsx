import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import TaskDetail from '../tasks/TaskDetail';
import TaskForm from '../tasks/TaskForm';
import Modal from '../common/Modal';
import { updateTaskStatus, createTask } from '../../api/tasks.api';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['To Do', 'In Progress', 'Done'];

const KanbanBoard = ({ projectId, initialTasks }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [addingStatus, setAddingStatus] = useState(null);

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;
    const taskId = Number(draggableId);
    const newStatus = destination.droppableId;
    if (!STATUSES.includes(newStatus)) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: source.droppableId } : t));
    }
  };

  const handleAddTask = async (data) => {
    const res = await createTask(projectId, { ...data, status: addingStatus });
    setTasks(prev => [...prev, res.data]);
    setAddingStatus(null);
  };

  const handleUpdated = (updated) => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  const handleDeleted = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(s => (
            <div key={s} className="flex-1 min-w-52">
              <KanbanColumn
                status={s}
                tasks={grouped[s]}
                onCardClick={setSelectedTask}
                onAddTask={() => setAddingStatus(s)}
                canAdd={user.role === 'PMO'}
              />
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={updated => { handleUpdated(updated); setSelectedTask(updated); }}
          onDeleted={handleDeleted}
        />
      )}

      {addingStatus && (
        <Modal title={`Add Task — ${addingStatus}`} onClose={() => setAddingStatus(null)}>
          <TaskForm
            initial={{ status: addingStatus }}
            onSubmit={handleAddTask}
            onCancel={() => setAddingStatus(null)}
          />
        </Modal>
      )}
    </>
  );
};

export default KanbanBoard;
