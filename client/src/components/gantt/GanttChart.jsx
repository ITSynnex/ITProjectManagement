import { useMemo } from 'react';

const DAY_MS = 86400000;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

const ROW_H    = 40;
const LABEL_W  = 220;
const MONTH_ROW_H = 22;
const DAY_ROW_H   = 26;
const DAY_HEADER_H = MONTH_ROW_H + DAY_ROW_H; // 48 total for Day view

export default function GanttChart({ tasks = [], viewMode = 'Month', onExpanderClick, ganttHeight = 400 }) {
  const cfg = VIEW_CONFIG[viewMode] ?? VIEW_CONFIG.Month;
  const isDay = viewMode === 'Day';
  const headerH = isDay ? DAY_HEADER_H : ROW_H;

  const { timeStart, cols } = useMemo(() => {
    if (!tasks.length) return { timeStart: new Date(), cols: [] };
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
    return { timeStart: ts, cols };
  }, [tasks, cfg]);

  /* Month groups for Day view merged header */
  const monthGroups = useMemo(() => {
    if (!isDay) return [];
    const groups = [];
    cols.forEach((col, ci) => {
      const key = `${col.getFullYear()}-${col.getMonth()}`;
      if (!groups.length || groups[groups.length - 1].key !== key) {
        groups.push({
          key,
          label: col.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
          startIdx: ci,
          count: 1,
        });
      } else {
        groups[groups.length - 1].count++;
      }
    });
    return groups;
  }, [cols, isDay]);

  const totalW = cols.length * cfg.colWidth;

  const xOf = (date) => (date.getTime() - timeStart.getTime()) / cfg.colMs * cfg.colWidth;

  const today  = new Date();
  const todayX = xOf(today);
  const showToday = todayX >= 0 && todayX <= totalW;

  const isWeekend = (col) => { const d = col.getDay(); return d === 0 || d === 6; };

  return (
    <div style={{ overflow: 'auto', maxHeight: ganttHeight }}>
      <div style={{ display: 'flex', minWidth: LABEL_W + totalW }}>

        {/* ── Sticky-left label column ── */}
        <div style={{
          width: LABEL_W,
          flexShrink: 0,
          position: 'sticky',
          left: 0,
          zIndex: 2,
          borderRight: '1px solid #E8E6E0',
          background: 'white',
        }}>
          {/* Corner cell */}
          <div style={{
            height: headerH,
            position: 'sticky',
            top: 0,
            zIndex: 3,
            background: '#FAFAF8',
            borderBottom: '1px solid #E8E6E0',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 12,
            fontSize: 11,
            fontWeight: 600,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Project / Task
          </div>

          {/* Label rows */}
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

        {/* ── Timeline column ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Sticky-top timeline header */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            height: headerH,
            background: '#FAFAF8',
            borderBottom: '1px solid #E8E6E0',
            overflow: 'hidden',
          }}>
            {isDay ? (
              /* ── Day view: 2-row header ── */
              <svg width={totalW} height={headerH} style={{ display: 'block' }}>
                {/* Weekend column highlights in header */}
                {cols.map((col, ci) => isWeekend(col) && (
                  <rect key={`wh-${ci}`}
                    x={ci * cfg.colWidth} y={0}
                    width={cfg.colWidth} height={headerH}
                    fill="rgba(79,70,229,0.05)"
                  />
                ))}

                {/* Row 1: merged month labels */}
                {monthGroups.map((g, gi) => {
                  const x = g.startIdx * cfg.colWidth;
                  const w = g.count * cfg.colWidth;
                  return (
                    <g key={gi}>
                      <line x1={x} y1={0} x2={x} y2={MONTH_ROW_H} stroke="#E8E6E0" strokeWidth={1} />
                      <text
                        x={x + w / 2}
                        y={MONTH_ROW_H / 2 + 4}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={600}
                        fill="#374151"
                        fontFamily="system-ui, sans-serif"
                      >
                        {g.label}
                      </text>
                    </g>
                  );
                })}

                {/* Divider between month row and day row */}
                <line x1={0} y1={MONTH_ROW_H} x2={totalW} y2={MONTH_ROW_H} stroke="#E8E6E0" strokeWidth={1} />

                {/* Row 2: day number + day name */}
                {cols.map((col, ci) => {
                  const weekend = isWeekend(col);
                  const x = ci * cfg.colWidth;
                  return (
                    <g key={ci}>
                      <line x1={x} y1={MONTH_ROW_H} x2={x} y2={headerH} stroke="#E8E6E0" strokeWidth={1} />
                      {/* day number */}
                      <text
                        x={x + cfg.colWidth / 2}
                        y={MONTH_ROW_H + 10}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={weekend ? 600 : 400}
                        fill={weekend ? '#6366F1' : '#6B7280'}
                        fontFamily="system-ui, sans-serif"
                      >
                        {col.getDate()}
                      </text>
                      {/* day name */}
                      <text
                        x={x + cfg.colWidth / 2}
                        y={MONTH_ROW_H + 22}
                        textAnchor="middle"
                        fontSize={9}
                        fill={weekend ? '#818CF8' : '#9CA3AF'}
                        fontFamily="system-ui, sans-serif"
                      >
                        {DAY_NAMES[col.getDay()]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              /* ── Other views: single-row header ── */
              <svg width={totalW} height={ROW_H} style={{ display: 'block' }}>
                {cols.map((col, ci) => (
                  <g key={ci}>
                    <line
                      x1={ci * cfg.colWidth} y1={0}
                      x2={ci * cfg.colWidth} y2={ROW_H}
                      stroke="#E8E6E0" strokeWidth={1}
                    />
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
              </svg>
            )}
          </div>

          {/* Timeline bar rows */}
          <svg
            width={totalW}
            height={tasks.length * ROW_H}
            style={{ display: 'block' }}
          >
            {tasks.map((task, i) => {
              const y      = i * ROW_H;
              const rowBg  = i % 2 === 0 ? '#fff' : '#FAFAF8';
              const barX   = xOf(task.start);
              const barW   = Math.max(4, xOf(task.end) - barX);
              const progW  = barW * (task.progress / 100);
              const barH   = task.type === 'project' ? 14 : 20;
              const barY   = y + (ROW_H - barH) / 2;
              const barR   = task.type === 'project' ? 3 : 6;
              const barBg  = task.type === 'project' ? '#C7D2FE' : '#D1FAE5';
              const progColor = task.styles?.progressColor ?? (task.type === 'project' ? '#4F46E5' : '#22C55E');

              return (
                <g key={task.id}>
                  <rect x={0} y={y} width={totalW} height={ROW_H} fill={rowBg} />

                  {/* Weekend column highlights in body */}
                  {isDay && cols.map((col, ci) => isWeekend(col) && (
                    <rect key={`wb-${ci}`}
                      x={ci * cfg.colWidth} y={y}
                      width={cfg.colWidth} height={ROW_H}
                      fill="rgba(79,70,229,0.04)"
                    />
                  ))}

                  <line x1={0} y1={y + ROW_H} x2={totalW} y2={y + ROW_H} stroke="#F3F2EF" strokeWidth={1} />
                  {cols.map((_, ci) => (
                    <line key={ci}
                      x1={ci * cfg.colWidth} y1={y}
                      x2={ci * cfg.colWidth} y2={y + ROW_H}
                      stroke="#E8E6E0" strokeWidth={0.5}
                    />
                  ))}
                  <rect x={barX} y={barY} width={barW} height={barH} rx={barR} fill={barBg} />
                  {progW > 0 && (
                    <rect x={barX} y={barY} width={progW} height={barH} rx={barR} fill={progColor} />
                  )}
                </g>
              );
            })}

            {showToday && (
              <line
                x1={todayX} y1={0}
                x2={todayX} y2={tasks.length * ROW_H}
                stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 3"
              />
            )}
          </svg>
        </div>

      </div>
    </div>
  );
}
