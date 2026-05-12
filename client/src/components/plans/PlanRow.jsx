import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import HealthBadge from '../common/HealthBadge';
import ProgressBar from '../common/ProgressBar';
import { Badge } from '../ui/badge';
import { formatDate } from '../../utils/formatDate';
import { Pencil, Trash2 } from 'lucide-react';
import { getTeamColors } from '../../lib/teamColors';

const PRIORITY_VARIANT = {
  low:      'priority_low',
  medium:   'priority_medium',
  high:     'priority_high',
  critical: 'priority_critical',
};

const PRIORITY_LABEL = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

const PlanRow = ({ plan, index, onEdit, onDelete, canEdit }) => {
  const teamColors = plan.team ? getTeamColors(plan.team_color) : null;

  return (
    <tr
      className="border-b group transition-colors duration-100"
      style={{ borderColor: '#F3F2EF' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F6F3'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <td className="px-4 py-3.5 text-[11px] font-mono text-[#9CA3AF] w-8 select-none">{index}</td>
      <td className="px-4 py-3.5">
        <Link
          to={`/plans/${plan.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline underline-offset-2 transition-colors"
          style={{ color: '#4F46E5' }}
          onMouseEnter={e => e.currentTarget.style.color = '#4338CA'}
          onMouseLeave={e => e.currentTarget.style.color = '#4F46E5'}
        >
          {plan.name}
        </Link>
      </td>

      <td className="px-4 py-3.5">
        {teamColors ? (
          <span
            className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: teamColors.bg, color: teamColors.text }}
          >
            {plan.team}
          </span>
        ) : (
          <span className="text-sm" style={{ color: '#D1D5DB' }}>—</span>
        )}
      </td>

      <td className="px-4 py-3.5">
        {plan.operator_name ? (
          <span className="text-[13px]" style={{ color: '#374151' }}>{plan.operator_name}</span>
        ) : (
          <span className="text-sm" style={{ color: '#D1D5DB' }}>—</span>
        )}
      </td>

      <td className="px-4 py-3.5 w-44">
        <ProgressBar value={plan.progress} />
      </td>

      <td className="px-4 py-3.5 text-[13px]" style={{ color: '#6B7280' }}>{formatDate(plan.start_date)}</td>
      <td className="px-4 py-3.5 text-[13px]" style={{ color: '#6B7280' }}>{formatDate(plan.end_date)}</td>

      <td className="px-4 py-3.5">
        <StatusBadge status={plan.status} />
      </td>

      <td className="px-4 py-3.5">
        <HealthBadge health={plan.health} />
      </td>

      <td className="px-4 py-3.5">
        {plan.priority ? (
          <Badge variant={PRIORITY_VARIANT[plan.priority]}>
            {PRIORITY_LABEL[plan.priority]}
          </Badge>
        ) : (
          <span className="text-sm" style={{ color: '#D1D5DB' }}>—</span>
        )}
      </td>

      {canEdit && (
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => onEdit(plan)}
              className="p-1.5 rounded-lg transition-colors duration-150"
              style={{ color: '#9CA3AF' }}
              title="Edit"
              onMouseEnter={e => {
                e.currentTarget.style.color = '#4F46E5';
                e.currentTarget.style.backgroundColor = '#EEF2FF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#9CA3AF';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(plan)}
              className="p-1.5 rounded-lg transition-colors duration-150"
              style={{ color: '#9CA3AF' }}
              title="Delete"
              onMouseEnter={e => {
                e.currentTarget.style.color = '#DC2626';
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#9CA3AF';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
};

export default PlanRow;
