import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

const colColors = {
  'To Do':       'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done':        'bg-green-100 text-green-700',
};

const KanbanColumn = ({ status, tasks, onCardClick, onAddTask, canAdd }) => (
  <div className="flex flex-col flex-1 min-w-0">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colColors[status]}`}>{status}</span>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>
      {canAdd && (
        <button onClick={onAddTask} className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded">
          + Add
        </button>
      )}
    </div>
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex-1 min-h-20 rounded-xl p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'}`}
        >
          {tasks.map((task, index) => (
            <KanbanCard key={task.id} task={task} index={index} onClick={() => onCardClick(task)} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

export default KanbanColumn;
