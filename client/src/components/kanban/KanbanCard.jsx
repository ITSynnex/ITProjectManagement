import { Draggable } from '@hello-pangea/dnd';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { priorityColor } from '../../utils/priorityColor';
import { formatDate } from '../../utils/formatDate';

const KanbanCard = ({ task, index, onClick }) => (
  <Draggable draggableId={String(task.id)} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        onClick={onClick}
        className={`bg-white rounded-lg border p-3 cursor-pointer hover:shadow-sm transition-shadow mb-2
          ${snapshot.isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'}`}
      >
        <p className="text-sm font-medium text-gray-800 mb-2 leading-tight">{task.title}</p>
        <div className="flex items-center justify-between gap-2">
          <Badge label={task.priority} className={`${priorityColor(task.priority)} text-xs`} />
          {task.assignee_name && <Avatar name={task.assignee_name} size="sm" />}
        </div>
        {task.deadline && (
          <p className="text-xs text-gray-400 mt-2">{formatDate(task.deadline)}</p>
        )}
      </div>
    )}
  </Draggable>
);

export default KanbanCard;
