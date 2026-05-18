import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import Spinner from '../common/Spinner';

// Maps plan_statuses.color → KPI card hex colors
const COLOR_TO_KPI = {
  not_started:       { bg: '#F9FAFB', text: '#6B7280',  border: '#E5E7EB' },
  ongoing:           { bg: '#EEF2FF', text: '#4F46E5',  border: '#C7D2FE' },
  on_track:          { bg: '#F0FDF4', text: '#16A34A',  border: '#BBF7D0' },
  at_risk:           { bg: '#FEF2F2', text: '#DC2626',  border: '#FECACA' },
  suspended:         { bg: '#FFF7ED', text: '#EA580C',  border: '#FED7AA' },
  closed:            { bg: '#EFF6FF', text: '#2563EB',  border: '#BFDBFE' },
  in_progress:       { bg: '#FEFCE8', text: '#CA8A04',  border: '#FEF08A' },
  completed:         { bg: '#F0FDF4', text: '#16A34A',  border: '#BBF7D0' },
  default:           { bg: '#F3F4F6', text: '#374151',  border: '#E5E7EB' },
};

const NO_BUCKET_STYLE = { bg: '#F3F4F6', text: '#9CA3AF', border: '#E5E7EB' };
const TOTAL_STYLE     = { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };

const getKpiStyle = (color) => COLOR_TO_KPI[color] || NO_BUCKET_STYLE;

// Maps color → section header text color class
const COLOR_TO_TEXT = {
  not_started:  'text-gray-500',
  ongoing:      'text-indigo-600',
  on_track:     'text-green-600',
  at_risk:      'text-red-600',
  suspended:    'text-orange-600',
  closed:       'text-blue-600',
  in_progress:  'text-yellow-600',
  completed:    'text-green-600',
  default:      'text-gray-500',
};

const formatDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const TaskOverviewLayout = ({ kpis, matrix, swimlane, buckets = [], groupKey, loading, error }) => {
  const [collapsed, setCollapsed]         = useState(new Set());
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedBucket, setSelectedBucket] = useState(null);

  const toggle = (key) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const handleRowClick = (label) =>
    setSelectedGroup(prev => prev === label ? null : label);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error)   return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
  );

  // Build ordered bucket list: configured buckets first, then (No Bucket) if any exist
  const filteredSwimlane = (swimlane || [])
    .filter(p => !selectedGroup  || p.group_label === selectedGroup)
    .filter(p => !selectedBucket || p.bucket      === selectedBucket);

  const bucketNames = buckets.map(b => b.name);
  const noBucket = filteredSwimlane.filter(p => p.bucket === '(No Bucket)');
  const allBucketSections = [
    ...bucketNames.map(name => ({
      name,
      color: buckets.find(b => b.name === name)?.color || 'default',
      plans: filteredSwimlane.filter(p => p.bucket === name),
    })),
    ...(noBucket.length > 0 ? [{ name: '(No Bucket)', color: 'default', plans: noBucket }] : []),
  ].filter(s => s.plans.length > 0);

  // Matrix: all bucket column names (configured + no-bucket if any appear)
  const matrixBuckets = [
    ...bucketNames,
    ...((matrix || []).some(r => r['(No Bucket)'] > 0) ? ['(No Bucket)'] : []),
  ];

  return (
    <div className="space-y-5">

      {/* KPI cards */}
      <div className="flex flex-wrap gap-3">
        {/* Total — click to clear bucket filter */}
        <button
          onClick={() => setSelectedBucket(null)}
          className="rounded-xl p-4 border flex-1 min-w-[120px] text-left transition-all duration-150"
          style={{
            backgroundColor: TOTAL_STYLE.bg,
            borderColor: selectedBucket === null ? TOTAL_STYLE.text : TOTAL_STYLE.border,
            boxShadow: selectedBucket === null ? `0 0 0 2px ${TOTAL_STYLE.text}33` : 'none',
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: TOTAL_STYLE.text }}>
            Total Projects
          </p>
          <p className="text-2xl font-bold leading-none" style={{ color: TOTAL_STYLE.text }}>
            {kpis?.total ?? 0}
          </p>
        </button>
        {/* One card per bucket */}
        {buckets.map(b => {
          const style    = getKpiStyle(b.color);
          const isActive = selectedBucket === b.name;
          return (
            <button
              key={b.name}
              onClick={() => setSelectedBucket(prev => prev === b.name ? null : b.name)}
              className="rounded-xl p-4 border flex-1 min-w-[120px] text-left transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: style.bg,
                borderColor: isActive ? style.text : style.border,
                boxShadow: isActive ? `0 0 0 2px ${style.text}33` : 'none',
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: style.text }}>
                {b.name}
              </p>
              <p className="text-2xl font-bold leading-none" style={{ color: style.text }}>
                {kpis?.[b.name] ?? 0}
              </p>
            </button>
          );
        })}
        {/* (No Bucket) card if any plans have no bucket */}
        {(kpis?.['(No Bucket)'] ?? 0) > 0 && (() => {
          const isActive = selectedBucket === '(No Bucket)';
          return (
            <button
              onClick={() => setSelectedBucket(prev => prev === '(No Bucket)' ? null : '(No Bucket)')}
              className="rounded-xl p-4 border flex-1 min-w-[120px] text-left transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: NO_BUCKET_STYLE.bg,
                borderColor: isActive ? NO_BUCKET_STYLE.text : NO_BUCKET_STYLE.border,
                boxShadow: isActive ? `0 0 0 2px ${NO_BUCKET_STYLE.text}33` : 'none',
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: NO_BUCKET_STYLE.text }}>
                No Status
              </p>
              <p className="text-2xl font-bold leading-none" style={{ color: NO_BUCKET_STYLE.text }}>
                {kpis['(No Bucket)']}
              </p>
            </button>
          );
        })()}
      </div>

      {/* Matrix table */}
      <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="px-4 py-3 border-b border-[#E8E6E0] bg-[#FAFAF8] flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Breakdown by {groupKey}</h3>
          <div className="flex items-center gap-2">
            {selectedBucket && (
              <button
                onClick={() => setSelectedBucket(null)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#374151] bg-[#F3F4F6] px-2.5 py-1 rounded-full hover:bg-[#E5E7EB] transition-colors"
              >
                {selectedBucket}
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedGroup && (
              <button
                onClick={() => setSelectedGroup(null)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-full hover:bg-[#E0E7FF] transition-colors"
              >
                {selectedGroup}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] whitespace-nowrap">
                  {groupKey}
                </th>
                {matrixBuckets.map(b => (
                  <th key={b} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] whitespace-nowrap">
                    {b}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(matrix || []).map(row => {
                const isSelected = selectedGroup === row.group_label;
                return (
                  <tr
                    key={row.group_label}
                    onClick={() => handleRowClick(row.group_label)}
                    className="border-b border-[#F3F2EF] last:border-0 transition-colors cursor-pointer"
                    style={isSelected ? { backgroundColor: '#EEF2FF' } : undefined}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#FAFAF8'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = ''; }}
                  >
                    <td className="px-4 py-3 text-[13px] font-medium flex items-center gap-2"
                      style={{ color: isSelected ? '#4F46E5' : '#1A1A1A' }}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] flex-shrink-0" />}
                      {row.group_label}
                    </td>
                    {matrixBuckets.map(b => {
                      const val = row[b] || 0;
                      const bStyle = getKpiStyle(buckets.find(bk => bk.name === b)?.color || 'default');
                      return (
                        <td key={b} className="px-4 py-3">
                          {val > 0
                            ? <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md text-[12px] font-semibold"
                                style={{ backgroundColor: bStyle.bg, color: bStyle.text }}>
                                {val}
                              </span>
                            : <span className="text-[#C4C0B8] text-[13px]">—</span>
                          }
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-[13px] font-bold"
                      style={{ color: isSelected ? '#4F46E5' : '#1A1A1A' }}>
                      {row.total}
                    </td>
                  </tr>
                );
              })}
              {(matrix || []).length === 0 && (
                <tr>
                  <td colSpan={matrixBuckets.length + 2} className="px-4 py-8 text-center text-[13px] text-[#9CA3AF]">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Swimlane — one section per bucket */}
      {allBucketSections.length === 0 ? (
        <div className="text-center py-10 text-[13px] text-[#9CA3AF]">No projects found.</div>
      ) : (
        <div className="space-y-3">
          {allBucketSections.map(({ name, color, plans }) => {
            const isCollapsed = collapsed.has(name);
            const textColor = name === '(No Bucket)' ? 'text-gray-400' : (COLOR_TO_TEXT[color] || 'text-gray-500');
            return (
              <div key={name} className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <button
                  onClick={() => toggle(name)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F6F3] transition-colors"
                  style={{ backgroundColor: '#FAFAF8', borderBottom: isCollapsed ? 'none' : '1px solid #E8E6E0' }}
                >
                  {isCollapsed
                    ? <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                    : <ChevronDown  className="w-4 h-4 text-[#9CA3AF]" />
                  }
                  <span className={`text-[13px] font-semibold ${textColor}`}>{name}</span>
                  <span className="text-[11px] text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded-full">
                    {plans.length} project{plans.length !== 1 ? 's' : ''}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col style={{ width: '38%' }} />
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '14%' }} />
                      </colgroup>
                      <thead>
                        <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                          {['Project Name', groupKey, 'Total Tasks', 'Delayed', 'Due Date'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {plans.map(p => (
                          <tr key={p.plan_id} className="border-b border-[#F3F2EF] last:border-0 hover:bg-[#FAFAF8]">
                            <td className="px-4 py-2.5 text-[13px] font-medium text-[#1A1A1A] truncate">{p.plan_name}</td>
                            <td className="px-4 py-2.5 text-[13px] text-[#6B7280] truncate">{p.group_label}</td>
                            <td className="px-4 py-2.5 text-[13px] text-[#374151]">{p.total_tasks}</td>
                            <td className="px-4 py-2.5 text-[13px]">
                              {p.delayed_tasks > 0
                                ? <span className="font-semibold text-red-500">{p.delayed_tasks}</span>
                                : <span className="text-[#C4C0B8]">—</span>
                              }
                            </td>
                            <td className="px-4 py-2.5 text-[13px] text-[#6B7280]">{formatDate(p.end_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default TaskOverviewLayout;
