import { useState, useEffect, useMemo } from 'react';
import { getPlans } from '../../api/plans.api';
import { getActivePlanStatuses } from '../../api/planStatuses.api';
import Spinner from '../../components/common/Spinner';
import { Badge } from '../../components/ui/badge';
import { AlertTriangle, CheckCircle2, FolderKanban, Play, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

// Solid fill color per status color-key (for chart segments)
const CHART_COLOR = (colorKey) => ({
  not_started: '#94A3B8',
  ongoing:     '#4F46E5',
  on_track:    '#16A34A',
  at_risk:     '#EF4444',
  suspended:   '#F97316',
  closed:      '#2563EB',
  in_progress: '#EAB308',
  completed:   '#22C55E',
  default:     '#9CA3AF',
}[colorKey] || '#9CA3AF');

const PRIORITY_DOT = { low: 'bg-blue-400', medium: 'bg-yellow-400', high: 'bg-orange-400', critical: 'bg-red-500' };
const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };

const isOverdue = (plan) => {
  if (!plan.end_date || plan.status === 'completed' || plan.status === 'closed') return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(plan.end_date) < today;
};

const formatDateTH = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${parseInt(y) + 543}`;
};

const daysUntil = (d) => {
  if (!d) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(d);
  return Math.round((end - today) / 86400000);
};

// ── SVG Donut Chart ───────────────────────────────────────────────────────────
const DonutChart = ({ segments, total }) => {
  const size = 152, cx = 76, r = 52, sw = 20;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const segs = segments.filter(s => s.count > 0).map(s => {
    const len = total > 0 ? (s.count / total) * circ : 0;
    const rot = total > 0 ? (acc / circ) * 360 - 90 : -90;
    acc += len;
    return { ...s, dash: `${len} ${circ - len}`, rot };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
      {segs.map((seg, i) => (
        <circle key={i} cx={cx} cy={cx} r={r} fill="none"
          stroke={seg.color} strokeWidth={sw}
          strokeDasharray={seg.dash} strokeLinecap="butt"
          transform={`rotate(${seg.rot}, ${cx}, ${cx})`} />
      ))}
      <text x={cx} y={cx - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1A1A1A">{total}</text>
      <text x={cx} y={cx + 14} textAnchor="middle" fontSize="10" fill="#9CA3AF">โปรเจกต์</text>
    </svg>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, iconBg, iconColor, title, value, sub, subColor = '#6B7280', badge }) => (
  <div className="bg-white rounded-xl border border-[#E8E6E0] p-5 flex-1 min-w-0"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#9CA3AF] font-medium mb-2">{title}</p>
        <p className="text-[28px] font-bold text-[#1A1A1A] leading-none mb-1.5">{value}</p>
        {sub && <p className="text-[12px]" style={{ color: subColor }}>{sub}</p>}
        {badge && <div className="mt-1.5">{badge}</div>}
      </div>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}>
        <Icon className="w-4.5 h-4.5" style={{ color: iconColor, width: 18, height: 18 }} />
      </div>
    </div>
  </div>
);

// ── Select Dropdown ───────────────────────────────────────────────────────────
const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="appearance-none pl-3 pr-8 py-1.5 text-[12px] font-medium text-[#374151] border border-[#E8E6E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9CA3AF] pointer-events-none" />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const SummaryDashboardPage = () => {
  const [plans, setPlans]       = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [period, setPeriod]     = useState('year');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [deptFilter, setDeptFilter]       = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    Promise.all([getPlans(), getActivePlanStatuses()])
      .then(([pr, sr]) => { setPlans(pr.data); setStatuses(sr.data); })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const statusMap = useMemo(() =>
    Object.fromEntries(statuses.map(s => [s.name, s])), [statuses]);

  // Period-filtered base (for charts + KPIs)
  const periodPlans = useMemo(() => {
    if (period === 'all') return plans;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yr = today.getFullYear();
    const q = Math.floor(today.getMonth() / 3);
    return plans.filter(p => {
      if (!p.end_date) return period === 'all';
      const d = new Date(p.end_date);
      if (period === 'today')   return d <= today;
      if (period === 'quarter') return d.getFullYear() === yr && Math.floor(d.getMonth() / 3) === q;
      if (period === 'year')    return d.getFullYear() === yr;
      return true;
    });
  }, [plans, period]);

  // KPIs (from periodPlans)
  const kpi = useMemo(() => {
    const total     = periodPlans.length;
    const completed = periodPlans.filter(p => p.status === 'completed' || p.status === 'closed').length;
    const overdue   = periodPlans.filter(isOverdue).length;
    const atRisk    = periodPlans.filter(p => p.status === 'at_risk' || isOverdue(p)).length;
    const active    = periodPlans.filter(p => p.status && !['completed', 'closed'].includes(p.status)).length;
    const avgProg   = active > 0
      ? Math.round(periodPlans.filter(p => p.status && !['completed','closed'].includes(p.status))
          .reduce((s, p) => s + (p.progress || 0), 0) / active)
      : 0;
    const onHold    = periodPlans.filter(p => p.status === 'suspended').length;
    return { total, completed, overdue, atRisk, active, avgProg, onHold };
  }, [periodPlans]);

  // Donut segments
  const donutSegments = useMemo(() => {
    const map = {};
    periodPlans.forEach(p => {
      const key = p.status || 'default';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
        label: statusMap[name]?.label || name,
        color: CHART_COLOR(statusMap[name]?.color || name),
      }))
      .sort((a, b) => b.count - a.count);
  }, [periodPlans, statusMap]);

  // Department breakdown with per-status segments
  const deptBreakdown = useMemo(() => {
    const map = {};
    periodPlans.forEach(p => {
      const dept = p.department_name || '(ไม่ระบุ)';
      if (!map[dept]) map[dept] = { total: 0, byStatus: {} };
      map[dept].total++;
      const key = p.status || 'default';
      map[dept].byStatus[key] = (map[dept].byStatus[key] || 0) + 1;
    });
    const max = Math.max(...Object.values(map).map(d => d.total), 1);
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 8)
      .map(([name, data]) => ({
        name,
        total: data.total,
        pct: (data.total / max) * 100,
        segments: Object.entries(data.byStatus).map(([sName, cnt]) => ({
          name: sName,
          count: cnt,
          pct: (cnt / data.total) * 100,
          color: CHART_COLOR(statusMap[sName]?.color || sName),
        })),
      }));
  }, [periodPlans, statusMap]);

  // Filter-tab counts
  const tabCounts = useMemo(() => {
    const c = { all: periodPlans.length, overdue: periodPlans.filter(isOverdue).length };
    statuses.forEach(s => {
      c[s.name] = periodPlans.filter(p => p.status === s.name).length;
    });
    return c;
  }, [periodPlans, statuses]);

  // Visible status tabs (only statuses with plans + overdue)
  const statusTabs = useMemo(() => [
    { key: 'all', label: 'ทั้งหมด' },
    ...statuses.filter(s => (tabCounts[s.name] || 0) > 0).map(s => ({ key: s.name, label: s.label })),
    ...(tabCounts.overdue > 0 ? [{ key: 'overdue', label: 'เกินกำหนด' }] : []),
  ], [statuses, tabCounts]);

  // Dept options for dropdown
  const deptOptions = useMemo(() => {
    const s = new Set(periodPlans.map(p => p.department_name).filter(Boolean));
    return [...s].sort().map(d => ({ value: d, label: d }));
  }, [periodPlans]);

  // Filtered table rows
  const tableRows = useMemo(() => {
    let rows = periodPlans;
    if (statusFilter === 'overdue') rows = rows.filter(isOverdue);
    else if (statusFilter !== 'all') rows = rows.filter(p => p.status === statusFilter);
    if (deptFilter)     rows = rows.filter(p => p.department_name === deptFilter);
    if (priorityFilter) rows = rows.filter(p => p.priority === priorityFilter);
    return rows;
  }, [periodPlans, statusFilter, deptFilter, priorityFilter]);

  const nowStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error)   return <div className="p-6 text-[13px] text-red-600 bg-red-50 rounded-lg m-6">{error}</div>;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F7F6F3]">

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#E8E6E0] px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">ภาพรวมโปรเจกต์</h1>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              ข้อมูล ณ วันที่ {nowStr} · อัปเดตล่าสุด {timeStr}
            </p>
          </div>
          {/* Period toggle */}
          <div className="flex rounded-lg border border-[#E8E6E0] overflow-hidden bg-white">
            {[
              { key: 'today',   label: 'วันนี้' },
              { key: 'quarter', label: 'ไตรมาสนี้' },
              { key: 'year',    label: 'ปีนี้' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  'px-4 py-1.5 text-[12px] font-medium transition-colors',
                  period === p.key
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#6B7280] hover:bg-[#F3F2EF]'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── KPI Cards ── */}
        <div className="flex gap-4">
          <KpiCard
            icon={FolderKanban} iconBg="#EEF2FF" iconColor="#4F46E5"
            title="โปรเจกต์ทั้งหมด"
            value={kpi.total}
            sub={`${kpi.active} กำลังดำเนินการ`}
          />
          <KpiCard
            icon={Play} iconBg="#F0FDF4" iconColor="#16A34A"
            title="กำลังดำเนินการ"
            value={`${kpi.active}`}
            sub={kpi.total > 0 ? `คิดเป็น ${Math.round((kpi.active/kpi.total)*100)}% · เฉลี่ย Progress ${kpi.avgProg}%` : '—'}
            subColor="#16A34A"
          />
          <KpiCard
            icon={AlertTriangle} iconBg="#FEF2F2" iconColor="#DC2626"
            title="หยุดชะงัก / เกินกำหนด"
            value={kpi.atRisk}
            sub={kpi.atRisk > 0 ? `${kpi.onHold} ระงับ · ${kpi.overdue} เกินกำหนด` : 'ไม่มีปัญหา'}
            subColor={kpi.atRisk > 0 ? '#DC2626' : '#16A34A'}
            badge={kpi.atRisk > 0
              ? <span className="inline-flex items-center gap-1 text-[11px] text-red-500 font-medium">
                  <AlertTriangle className="w-3 h-3" /> ต้องติดตาม
                </span>
              : null}
          />
          <KpiCard
            icon={CheckCircle2} iconBg="#F0FDF4" iconColor="#16A34A"
            title="เสร็จสมบูรณ์"
            value={`${kpi.completed}`}
            sub={kpi.total > 0 ? `คิดเป็น ${Math.round((kpi.completed/kpi.total)*100)}% ของทั้งหมด` : '—'}
            subColor="#16A34A"
          />
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-[auto_1fr] gap-4">

          {/* Donut chart */}
          <div className="bg-white rounded-xl border border-[#E8E6E0] p-5 w-[380px]"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-[#1A1A1A]">กระจายตามสถานะ</h3>
              <span className="text-[11px] text-[#9CA3AF]">Status breakdown</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0">
                <DonutChart segments={donutSegments} total={kpi.total} />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                {donutSegments.map(seg => (
                  <div key={seg.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: seg.color }} />
                    <span className="text-[12px] text-[#374151] flex-1 truncate">{seg.label}</span>
                    <span className="text-[12px] font-semibold text-[#1A1A1A] ml-auto">{seg.count}</span>
                    <span className="text-[11px] text-[#9CA3AF] w-8 text-right">
                      {kpi.total > 0 ? `${Math.round((seg.count/kpi.total)*100)}%` : '—'}
                    </span>
                  </div>
                ))}
                {donutSegments.length === 0 && (
                  <p className="text-[12px] text-[#9CA3AF] text-center py-4">ไม่มีข้อมูล</p>
                )}
              </div>
            </div>
          </div>

          {/* Department bar chart */}
          <div className="bg-white rounded-xl border border-[#E8E6E0] p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-[#1A1A1A]">กระจายตามแผนก</h3>
              <button
                onClick={() => setDeptFilter('')}
                className="text-[11px] text-[#4F46E5] hover:underline"
              >
                คลิกเพื่อกรอง
              </button>
            </div>
            <div className="space-y-2.5">
              {deptBreakdown.map(d => (
                <button
                  key={d.name}
                  onClick={() => setDeptFilter(prev => prev === d.name ? '' : d.name)}
                  className={cn(
                    'w-full text-left group',
                    deptFilter === d.name ? 'opacity-100' : deptFilter ? 'opacity-50' : 'opacity-100'
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] font-medium text-[#374151] truncate max-w-[180px]">
                      {d.name}
                    </span>
                    <span className="text-[12px] font-semibold text-[#1A1A1A] ml-2">{d.total}</span>
                  </div>
                  <div className="h-5 bg-[#F3F4F6] rounded-md overflow-hidden flex">
                    {d.segments.map((seg, si) => (
                      <div
                        key={si}
                        className="h-full transition-all duration-300"
                        style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                        title={`${statusMap[seg.name]?.label || seg.name}: ${seg.count}`}
                      />
                    ))}
                  </div>
                </button>
              ))}
              {deptBreakdown.length === 0 && (
                <p className="text-[12px] text-[#9CA3AF] text-center py-6">ไม่มีข้อมูล</p>
              )}
            </div>
            {/* Color legend */}
            {donutSegments.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t border-[#F3F4F6]">
                {donutSegments.map(seg => (
                  <span key={seg.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-[11px] text-[#6B7280]">{seg.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Filter bar + Table ── */}
        <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {/* Filter bar */}
          <div className="px-4 py-3 border-b border-[#E8E6E0] flex items-center gap-3 flex-wrap">
            {/* Status tabs */}
            <div className="flex items-center gap-1 flex-wrap">
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-colors',
                    statusFilter === tab.key
                      ? 'bg-[#1A1A1A] text-white'
                      : 'text-[#6B7280] hover:bg-[#F3F2EF]'
                  )}
                >
                  {tab.key !== 'all' && tab.key !== 'overdue' && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CHART_COLOR(statusMap[tab.key]?.color || tab.key) }}
                    />
                  )}
                  {tab.key === 'overdue' && (
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  )}
                  {tab.label}
                  <span className={cn(
                    'text-[11px] px-1.5 py-0.5 rounded-full',
                    statusFilter === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  )}>
                    {tabCounts[tab.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Dept filter */}
              <FilterSelect
                value={deptFilter}
                onChange={setDeptFilter}
                placeholder="แผนก: ทั้งหมด"
                options={deptOptions}
              />
              {/* Priority filter */}
              <FilterSelect
                value={priorityFilter}
                onChange={setPriorityFilter}
                placeholder="Priority: ทั้งหมด"
                options={[
                  { value: 'critical', label: 'Critical' },
                  { value: 'high',     label: 'High' },
                  { value: 'medium',   label: 'Medium' },
                  { value: 'low',      label: 'Low' },
                ]}
              />
              <span className="text-[12px] text-[#9CA3AF] whitespace-nowrap">
                แสดง {tableRows.length} จาก {periodPlans.length} โปรเจกต์
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                  {['โปรเจกต์', 'แผนก', 'PM / OWNER', 'PRIORITY', 'PROGRESS', 'วันที่เสร็จ', 'STATUS'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map(plan => {
                  const overdue = isOverdue(plan);
                  const days = daysUntil(plan.end_date);
                  const initials = (plan.owner_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <tr key={plan.id} className="border-b border-[#F3F2EF] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                      {/* Project name */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-medium text-[#1A1A1A] truncate max-w-[280px]">
                                {plan.name}
                              </span>
                              {overdue && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5">PRJ-{String(plan.id).padStart(4,'0')}</p>
                          </div>
                        </div>
                      </td>
                      {/* Department */}
                      <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">
                        {plan.department_name || '—'}
                      </td>
                      {/* Owner */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {plan.owner_avatar
                            ? <img src={plan.owner_avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                            : <span className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {initials}
                              </span>
                          }
                          <span className="text-[12px] text-[#374151] whitespace-nowrap max-w-[120px] truncate">
                            {plan.owner_name || '—'}
                          </span>
                        </div>
                      </td>
                      {/* Priority */}
                      <td className="px-4 py-3">
                        {plan.priority
                          ? <span className="flex items-center gap-1.5">
                              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', PRIORITY_DOT[plan.priority] || 'bg-gray-400')} />
                              <span className="text-[12px] text-[#6B7280]">{PRIORITY_LABEL[plan.priority] || plan.priority}</span>
                            </span>
                          : <span className="text-[#C4C0B8]">—</span>
                        }
                      </td>
                      {/* Progress */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${plan.progress || 0}%`,
                                backgroundColor: plan.progress >= 80 ? '#22C55E' : plan.progress >= 40 ? '#4F46E5' : '#EAB308',
                              }}
                            />
                          </div>
                          <span className="text-[12px] text-[#374151] w-8 text-right">{plan.progress || 0}%</span>
                        </div>
                      </td>
                      {/* Due date */}
                      <td className="px-4 py-3">
                        {plan.end_date
                          ? <div>
                              <p className={cn('text-[12px]', overdue ? 'text-red-500 font-medium' : 'text-[#374151]')}>
                                {formatDateTH(plan.end_date)}
                              </p>
                              {days !== null && (
                                <p className={cn('text-[11px] mt-0.5',
                                  days < 0 ? 'text-red-400' : days <= 7 ? 'text-orange-400' : 'text-[#9CA3AF]'
                                )}>
                                  {days < 0 ? `เกิน ${Math.abs(days)} วัน` : days === 0 ? 'วันนี้' : `อีก ${days} วัน`}
                                </p>
                              )}
                            </div>
                          : <span className="text-[#C4C0B8]">—</span>
                        }
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        {plan.status
                          ? <Badge variant={plan.status}>{statusMap[plan.status]?.label || plan.status}</Badge>
                          : <span className="text-[#C4C0B8] text-[12px]">—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {tableRows.length === 0 && (
              <div className="py-12 text-center">
                <FolderKanban className="w-10 h-10 text-[#E5E7EB] mx-auto mb-3" />
                <p className="text-[13px] text-[#9CA3AF]">ไม่พบโปรเจกต์ที่ตรงกับเงื่อนไข</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboardPage;
