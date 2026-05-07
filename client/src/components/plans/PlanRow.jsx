import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import ProgressBar from '../common/ProgressBar';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/formatDate';
import { Pencil, Trash2 } from 'lucide-react';

const TEAM_COLORS = {
  DEV1:    { bg: '#EEF2FF', text: '#4F46E5' },
  DEV2:    { bg: '#F0FDF4', text: '#16A34A' },
  INFRA:   { bg: '#FFF7ED', text: '#EA580C' },
  AI:      { bg: '#FDF4FF', text: '#9333EA' },
  PRODUCT: { bg: '#FFF1F2', text: '#E11D48' },
};

const PlanRow = ({ plan, index, onEdit, onDelete, canEdit }) => {
  const teamColors = plan.team ? (TEAM_COLORS[plan.team] ?? { bg: '#F3F4F6', text: '#6B7280' }) : null;

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
        {plan.owner_name ? (
          <div className="flex items-center gap-2">
            <Avatar name={plan.owner_name} size="sm" />
            <span className="text-[13px]" style={{ color: '#374151' }}>{plan.owner_name}</span>
          </div>
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
        {plan.current_bucket ? (
          <span className="text-[12px] text-[#374151] bg-[#F3F4F6] px-2 py-0.5 rounded">
            {plan.current_bucket}
          </span>
        ) : (
          <span className="text-sm text-[#D1D5DB]">—</span>
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
