import { useMemo, useRef, useState } from 'react';

const DAY_MS = 86400000;

const VIEW_CONFIG = {
  Day:     { colMs: DAY_MS,        colWidth: 40,  fmt: d => d.toLocaleDateString('en', { month:'short', day:'numeric' }) },
  Week:    { colMs: DAY_MS * 7,    colWidth: 80,  fmt: d => `W${getISOWeek(d)} ${d.getFullYear()}` },
  Month:   { colMs: DAY_MS * 30,   colWidth: 120, fmt: d => d.toLocaleDateString('en', { month:'short', year:'numeric' }) },
  Quarter: { colMs: DAY_MS * 90,   colWidth: 160, fmt: d => `Q${Math.ceil((d.getMonth()+1)/3)} ${d.getFullYear()}` },
  Year:    { colMs: DAY_MS * 365,  colWidth: 200, fmt: d => String(d.getFullYear()) },
};

function getISOWeek(d) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay()+6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / DAY_MS - 3 + ((week1.getDay()+6) % 7)) / 7);
}

function floorToUnit(date, colMs) {
  return new Date(Math.floor(date.getTime() / colMs) * colMs);
}

const ROW_H = 40;
const LABEL_W = 220;

export default function GanttChart({ tasks = [], viewMode = 'Month', onExpanderClick, ganttHeight = 400 }) {
  const cfg = VIEW_CONFIG[viewMode] ?? VIEW_CONFIG.Month;

  const { timeStart, timeEnd, cols } = useMemo(() => {
    if (!tasks.length) return { timeStart: new Date(), timeEnd: new Date(), cols: [] };
    const starts = tasks.map(t => t.start.getTime());
    const ends   = tasks.map(t => t.end.getTime());
    const min = Math.min(...starts);
    const max = Math.max(...ends);
    const ts = floorToUnit(new Date(min - cfg.colMs), cfg.colMs);
    const te = new Date(max + cfg.colMs * 2);
    const cols = [];
    let cur = new Date(ts);
    while (cur < te) {
      cols.push(new Date(cur));
      cur = new Date(cur.getTime() + cfg.colMs);
    }
    return { timeStart: ts, timeEnd: te, cols };
  }, [tasks, cfg]);

  const totalW = cols.length * cfg.colWidth;

  const xOf = (date) => {
    const ms = date.getTime() - timeStart.getTime();
    return (ms / cfg.colMs) * cfg.colWidth;
  };

  const today = new Date();
  const todayX = xOf(today);
  const showToday = todayX >= 0 && todayX <= totalW;

  return (
    <div className="overflow-auto" style={{ maxHeight: ganttHeight }}>
      <div style={{ display: 'flex', minWidth: LABEL_W + totalW }}>

        {/* ── Label column ── */}
        <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid #E8E6E0' }}>
          {/* header spacer */}
          <div style={{ height: ROW_H, borderBottom: '1px solid #E8E6E0', background: '#FAFAF8' }} />
          {tasks.map((task, i) => {
            const isProject = task.type === 'project';
            return (
              <div
                key={task.id}
                style={{
                  height: ROW_H,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: isProject ? 8 : 24,
                  gap: 6,
                  borderBottom: '1px solid #F3F2EF',
                  background: i % 2 === 0 ? '#fff' : '#FAFAF8',
                  fontWeight: isProject ? 600 : 400,
                  fontSize: 13,
                  color: isProject ? '#1A1A1A' : '#374151',
                  cursor: isProject && onExpanderClick ? 'pointer' : 'default',
                }}
                onClick={() => isProject && onExpanderClick?.(task)}
              >
                {isProject && (
                  <span style={{ fontSize: 10, color: '#9CA3AF', userSelect: 'none' }}>
                    {task.hideChildren ? '▶' : '▼'}
                  </span>
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {task.name}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0, paddingRight: 8 }}>
                  {task.progress}%
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Timeline ── */}
        <div style={{ flex: 1, position: 'relative', overflowX: 'auto' }}>
          <svg
            width={totalW}
            height={ROW_H + tasks.length * ROW_H}
            style={{ display: 'block' }}
          >
            {/* Header row */}
            <rect x={0} y={0} width={totalW} height={ROW_H} fill="#FAFAF8" />
            {cols.map((col, ci) => (
              <g key={ci}>
                <line x1={ci * cfg.colWidth} y1={0} x2={ci * cfg.colWidth} y2={ROW_H + tasks.length * ROW_H}
                  stroke="#E8E6E0" strokeWidth={1} />
                <text
                  x={ci * cfg.colWidth + cfg.colWidth / 2}
                  y={ROW_H / 2 + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#9CA3AF"
                  fontFamily="system-ui, sans-serif"
                >
                  {cfg.fmt(col)}
                </text>
              </g>
            ))}
            <line x1={0} y1={ROW_H} x2={totalW} y2={ROW_H} stroke="#E8E6E0" strokeWidth={1} />

            {/* Rows */}
            {tasks.map((task, i) => {
              const y = ROW_H + i * ROW_H;
              const rowBg = i % 2 === 0 ? '#fff' : '#FAFAF8';

              const barX = xOf(task.start);
              const barW = Math.max(4, xOf(task.end) - barX);
              const progW = barW * (task.progress / 100);
              const barY = y + (ROW_H - (task.type === 'project' ? 14 : 20)) / 2;
              const barH = task.type === 'project' ? 14 : 20;
              const barR = task.type === 'project' ? 3 : 6;

              const barBg = task.type === 'project' ? '#C7D2FE' : '#D1FAE5';
              const progColor = task.styles?.progressColor ?? (task.type === 'project' ? '#4F46E5' : '#22C55E');

              return (
                <g key={task.id}>
                  <rect x={0} y={y} width={totalW} height={ROW_H} fill={rowBg} />
                  <line x1={0} y1={y + ROW_H} x2={totalW} y2={y + ROW_H} stroke="#F3F2EF" strokeWidth={1} />
                  {/* bar background */}
                  <rect x={barX} y={barY} width={barW} height={barH} rx={barR} fill={barBg} />
                  {/* progress fill */}
                  {progW > 0 && (
                    <rect x={barX} y={barY} width={progW} height={barH} rx={barR} fill={progColor} />
                  )}
                </g>
              );
            })}

            {/* Today line */}
            {showToday && (
              <line x1={todayX} y1={0} x2={todayX} y2={ROW_H + tasks.length * ROW_H}
                stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 3" />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
