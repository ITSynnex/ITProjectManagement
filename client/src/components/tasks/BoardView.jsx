import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateTask, completeTask, createTask, deleteTask } from '../../api/tasks.api';
import { Plus, X } from 'lucide-react';

const BUCKET_COLORS = ['#0F6CBD', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0891B2'];

const TaskCard = ({ task, index, operators, canEdit, onToggle, onDelete }) => {
  const operatorName = task.operator_name ?? operators.find(o => o.id === task.assigned_operator_id)?.name;
  return (
    <Draggable draggableId={String(task.id)} index={index} isDragDisabled={!canEdit}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="rounded-lg px-3 py-2.5 mb-2 select-none transition-shadow duration-150"
          style={{
            backgroundColor: 'white',
            border: snapshot.isDragging ? '1px solid #0F6CBD' : '1px solid #E8E8E8',
            boxShadow: snapshot.isDragging
              ? '0 8px 24px rgba(15,108,189,0.15)'
              : '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={!!task.is_completed}
              onChange={() => onToggle(task.id)}
              disabled={!canEdit}
              className="mt-0.5 w-3.5 h-3.5 cursor-pointer flex-shrink-0 rounded"
              style={{ accentColor: '#0F6CBD' }}
            />
            <span
              className="text-sm flex-1 leading-snug"
              style={{
                color: task.is_completed ? '#9CA3AF' : '#111827',
                textDecoration: task.is_completed ? 'line-through' : 'none',
                fontWeight: task.is_completed ? 400 : 500,
              }}
            >
              {task.name}
            </span>
            {canEdit && (
              <button
                onClick={() => onDelete(task.id)}
                className="flex-shrink-0 p-0.5 rounded transition-colors duration-100"
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
            )}
          </div>
          {operatorName && (
            <div className="flex items-center gap-1.5 mt-2 ml-5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: '#0F6CBD', fontSize: '9px', fontWeight: 600 }}
              >
                {operatorName.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>{operatorName}</p>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

const BucketColumn = ({ bucket, tasks, operators, canEdit, onToggle, onDelete, onAdd, colorIndex }) => {
  const [newName, setNewName] = useState('');
  const [adding, setAdding]   = useState(false);
  const incomplete = tasks.filter(t => !t.is_completed).length;
  const color = BUCKET_COLORS[colorIndex % BUCKET_COLORS.length];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    await onAdd(bucket.id, newName.trim());
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="flex-shrink-0 w-64">
      {/* Column header */}
      <div
        className="flex items-center justify-between mb-3 px-3 py-2.5 rounded-xl"
        style={{ backgroundColor: 'white', border: '1px solid #E8E8E8' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>{bucket.name}</h3>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
        >
          {incomplete}
        </span>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={String(bucket.id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-16 rounded-xl p-2 transition-colors duration-150"
            style={{
              backgroundColor: snapshot.isDraggingOver ? '#EBF4FF' : '#F9FAFB',
              border: snapshot.isDraggingOver ? '2px dashed #0F6CBD' : '2px dashed transparent',
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                operators={operators}
                canEdit={canEdit}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task */}
      {canEdit && (
        <form onSubmit={handleAdd} className="mt-2 flex gap-1.5">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 text-xs rounded-lg px-2.5 py-2 focus:outline-none transition-shadow"
            style={{ border: '1px solid #E8E8E8', backgroundColor: 'white', color: '#111827' }}
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(15,108,189,0.2)'}
            onBlur={e => e.target.style.boxShadow = 'none'}
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="flex items-center justify-center w-8 rounded-lg text-white transition-colors duration-150 disabled:opacity-40 flex-shrink-0"
            style={{ backgroundColor: '#0F6CBD' }}
            onMouseEnter={e => !adding && newName.trim() && (e.currentTarget.style.backgroundColor = '#0E5BAB')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0F6CBD')}
          >
            {adding ? <span className="text-xs">…</span> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </form>
      )}
    </div>
  );
};

const BoardView = ({ planId, tasks, setTasks, buckets, operators = [], canEdit }) => {
  const handleToggle = async (id) => {
    const res = await completeTask(id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: res.data.is_completed } : t));
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAdd = async (bucketId, name) => {
    const res = await createTask(planId, { name, bucket_id: bucketId });
    setTasks(prev => [...prev, res.data]);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId    = Number(draggableId);
    const newBucketId = Number(destination.droppableId);

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, bucket_id: newBucketId } : t));

    try {
      await updateTask(taskId, { bucket_id: newBucketId });
    } catch {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, bucket_id: Number(source.droppableId) } : t));
    }
  };

  const unbucketedTasks = tasks.filter(t => !t.bucket_id);

  if (buckets.length === 0 && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: '#EBF4FF' }}
        >
          <Plus className="w-7 h-7" style={{ color: '#0F6CBD' }} />
        </div>
        <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>No buckets yet</p>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          {canEdit ? 'Add buckets from the Grid view to organize tasks.' : 'No buckets have been created.'}
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {buckets.map((bucket, i) => (
          <BucketColumn
            key={bucket.id}
            bucket={bucket}
            tasks={tasks.filter(t => t.bucket_id === bucket.id)}
            operators={operators}
            canEdit={canEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAdd={handleAdd}
            colorIndex={i}
          />
        ))}

        {unbucketedTasks.length > 0 && (
          <BucketColumn
            bucket={{ id: 0, name: 'No Bucket' }}
            tasks={unbucketedTasks}
            operators={operators}
            canEdit={canEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAdd={handleAdd}
            colorIndex={buckets.length}
          />
        )}
      </div>
    </DragDropContext>
  );
};

export default BoardView;
