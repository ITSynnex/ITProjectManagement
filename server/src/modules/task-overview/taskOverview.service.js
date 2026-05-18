const db = require('../../config/db');

const TASK_AGG_CTE = `
  WITH task_agg AS (
    SELECT
      plan_id,
      COUNT(*)                                                                AS total_tasks,
      SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END)                      AS incomplete_tasks,
      SUM(CASE
            WHEN finish_date IS NOT NULL AND finish_date < date('now')
             AND is_completed = 0 THEN 1 ELSE 0 END)                         AS delayed_tasks
    FROM tasks
    GROUP BY plan_id
  )
`;

// Status sections for By Team / By Department views
const getStatusSections = () =>
  db.prepare(`
    SELECT name, label, color FROM plan_statuses
    WHERE is_active = 1 ORDER BY sort_order ASC, name ASC
  `).all();

// Bucket sections for By Bucket view
const getBucketSections = () =>
  db.prepare(`
    SELECT name, color FROM plan_buckets
    WHERE is_active = 1 ORDER BY sort_order ASC, id ASC
  `).all();

// Pivot flat rows [{group_label, bucket, count}] into [{group_label, [bucket]: count, total}]
const pivotMatrix = (rows) => {
  const map = {};
  rows.forEach(r => {
    if (!map[r.group_label]) {
      map[r.group_label] = { group_label: r.group_label, total: 0 };
    }
    map[r.group_label][r.bucket] = (map[r.group_label][r.bucket] || 0) + r.count;
    map[r.group_label].total += r.count;
  });
  return Object.values(map).sort((a, b) => {
    const aN = a.group_label.startsWith('(No') ? 1 : 0;
    const bN = b.group_label.startsWith('(No') ? 1 : 0;
    return aN !== bN ? aN - bN : a.group_label.localeCompare(b.group_label);
  });
};

const getByTeam = () => {
  const buckets = getStatusSections();

  const total = db.prepare('SELECT COUNT(*) AS c FROM plans').get().c;

  const kpiRows = db.prepare(`
    SELECT COALESCE(p.status, '(No Bucket)') AS bucket, COUNT(*) AS count
    FROM plans p GROUP BY COALESCE(p.status, '(No Bucket)')
  `).all();
  const kpis = { total };
  kpiRows.forEach(r => { kpis[r.bucket] = r.count; });

  const matrixRaw = db.prepare(`
    SELECT
      COALESCE(p.team, '(No Team)')          AS group_label,
      COALESCE(p.status, '(No Bucket)')      AS bucket,
      COUNT(*)                               AS count
    FROM plans p
    GROUP BY COALESCE(p.team, '(No Team)'), COALESCE(p.status, '(No Bucket)')
  `).all();
  const matrix = pivotMatrix(matrixRaw);

  const swimlane = db.prepare(`
    ${TASK_AGG_CTE}
    SELECT
      p.id                                   AS plan_id,
      p.name                                 AS plan_name,
      COALESCE(p.team, '(No Team)')          AS group_label,
      p.end_date,
      COALESCE(ta.total_tasks,   0)          AS total_tasks,
      COALESCE(ta.delayed_tasks, 0)          AS delayed_tasks,
      COALESCE(p.status, '(No Bucket)')      AS bucket
    FROM plans p
    LEFT JOIN task_agg ta ON ta.plan_id = p.id
    ORDER BY CASE WHEN p.end_date IS NULL THEN 1 ELSE 0 END, p.end_date ASC
  `).all();

  return { buckets, kpis, matrix, swimlane };
};

const getByDepartment = () => {
  const buckets = getStatusSections();

  const total = db.prepare('SELECT COUNT(*) AS c FROM plans').get().c;

  const kpiRows = db.prepare(`
    SELECT COALESCE(p.status, '(No Bucket)') AS bucket, COUNT(*) AS count
    FROM plans p GROUP BY COALESCE(p.status, '(No Bucket)')
  `).all();
  const kpis = { total };
  kpiRows.forEach(r => { kpis[r.bucket] = r.count; });

  const matrixRaw = db.prepare(`
    SELECT
      COALESCE(d.name, '(No Department)')    AS group_label,
      COALESCE(p.status, '(No Bucket)')      AS bucket,
      COUNT(p.id)                            AS count
    FROM plans p
    LEFT JOIN departments d ON d.id = p.department_id
    GROUP BY COALESCE(d.name, '(No Department)'), COALESCE(p.status, '(No Bucket)')
  `).all();
  const matrix = pivotMatrix(matrixRaw);

  const swimlane = db.prepare(`
    ${TASK_AGG_CTE}
    SELECT
      p.id                                      AS plan_id,
      p.name                                    AS plan_name,
      COALESCE(d.name, '(No Department)')       AS group_label,
      p.end_date,
      COALESCE(ta.total_tasks,   0)             AS total_tasks,
      COALESCE(ta.delayed_tasks, 0)             AS delayed_tasks,
      COALESCE(p.status, '(No Bucket)')         AS bucket
    FROM plans p
    LEFT JOIN departments d ON d.id = p.department_id
    LEFT JOIN task_agg ta  ON ta.plan_id = p.id
    ORDER BY CASE WHEN p.end_date IS NULL THEN 1 ELSE 0 END, p.end_date ASC
  `).all();

  return { buckets, kpis, matrix, swimlane };
};

const getByBucket = () => {
  const buckets = getBucketSections();

  const total = db.prepare('SELECT COUNT(*) AS c FROM plans').get().c;

  const kpiRows = db.prepare(`
    SELECT COALESCE(pb.name, '(No Bucket)') AS bucket, COUNT(p.id) AS count
    FROM plans p
    LEFT JOIN plan_buckets pb ON pb.id = p.bucket_id
    GROUP BY COALESCE(pb.name, '(No Bucket)')
  `).all();
  const kpis = { total };
  kpiRows.forEach(r => { kpis[r.bucket] = r.count; });

  const matrixRaw = db.prepare(`
    SELECT
      COALESCE(d.name, '(No Department)')    AS group_label,
      COALESCE(pb.name, '(No Bucket)')       AS bucket,
      COUNT(p.id)                            AS count
    FROM plans p
    LEFT JOIN departments    d  ON d.id    = p.department_id
    LEFT JOIN plan_buckets   pb ON pb.id   = p.bucket_id
    GROUP BY COALESCE(d.name, '(No Department)'), COALESCE(pb.name, '(No Bucket)')
  `).all();
  const matrix = pivotMatrix(matrixRaw);

  const swimlane = db.prepare(`
    ${TASK_AGG_CTE}
    SELECT
      p.id                                      AS plan_id,
      p.name                                    AS plan_name,
      COALESCE(d.name, '(No Department)')       AS group_label,
      p.end_date,
      COALESCE(ta.total_tasks,   0)             AS total_tasks,
      COALESCE(ta.delayed_tasks, 0)             AS delayed_tasks,
      COALESCE(pb.name, '(No Bucket)')          AS bucket
    FROM plans p
    LEFT JOIN departments  d  ON d.id    = p.department_id
    LEFT JOIN plan_buckets pb ON pb.id   = p.bucket_id
    LEFT JOIN task_agg     ta ON ta.plan_id = p.id
    ORDER BY CASE WHEN p.end_date IS NULL THEN 1 ELSE 0 END, p.end_date ASC
  `).all();

  return { buckets, kpis, matrix, swimlane };
};

module.exports = { getByTeam, getByDepartment, getByBucket };
