import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { getActiveTeams } from '../../api/teams.api';
import { getActivePlanStatuses } from '../../api/planStatuses.api';

const PRIORITIES = [
  { value: 'low',      label: 'Low',      active: 'bg-blue-50 text-blue-700 border-blue-400',   dot: 'bg-blue-400' },
  { value: 'medium',   label: 'Medium',   active: 'bg-yellow-50 text-yellow-700 border-yellow-400', dot: 'bg-yellow-400' },
  { value: 'high',     label: 'High',     active: 'bg-orange-50 text-orange-700 border-orange-400', dot: 'bg-orange-400' },
  { value: 'critical', label: 'Critical', active: 'bg-red-50 text-red-700 border-red-500',      dot: 'bg-red-500' },
];

const empty = { name: '', team: '', operator_id: '', start_date: '', end_date: '', status: '', department_id: '', priority: '' };

const Label = ({ children, required }) => (
  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const PlanForm = ({ open, onClose, onSave, initial, operators = [], departments = [] }) => {
  const [form, setForm]     = useState(empty);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [teams, setTeams]       = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    getActiveTeams().then(r => setTeams(r.data)).catch(() => {});
    getActivePlanStatuses().then(r => setStatuses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setForm(initial ? {
      name:          initial.name          ?? '',
      team:          initial.team          ?? '',
      operator_id:   initial.operator_id   ?? '',
      start_date:    initial.start_date    ?? '',
      end_date:      initial.end_date      ?? '',
      status:        initial.status        ?? '',
      department_id: initial.department_id ?? '',
      priority:      initial.priority      ?? '',
    } : empty);
    setError('');
  }, [open, initial]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required');
    if (!form.department_id) return setError('Department is required');
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        operator_id:   form.operator_id   ? Number(form.operator_id)   : null,
        team:          form.team          || null,
        status:        form.status        || null,
        department_id: form.department_id ? Number(form.department_id) : undefined,
        priority:      form.priority || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const selectClass = 'w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent';

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">{error}</p>
        )}

        <div>
          <Label required>Project Name</Label>
          <Input value={form.name} onChange={set('name')} placeholder="e.g. Network Upgrade Q3" className="text-[13px]" />
        </div>

        <div>
          <Label required>Department</Label>
          <select value={form.department_id} onChange={set('department_id')} className={selectClass}>
            <option value="">— Select department —</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Priority</Label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, priority: f.priority === p.value ? '' : p.value }))}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] font-medium border transition-colors',
                  form.priority === p.value
                    ? p.active
                    : 'border-[#E8E6E0] text-[#6B7280] hover:bg-[#F3F2EF]'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', form.priority === p.value ? p.dot : 'bg-[#D1D5DB]')} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Team</Label>
            <select value={form.team} onChange={set('team')} className={selectClass}>
              <option value="">— No team —</option>
              {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Operator</Label>
            <select value={form.operator_id} onChange={set('operator_id')} className={selectClass}>
              <option value="">— Select operator —</option>
              {operators.map(op => (
                <option key={op.id} value={op.id}>{op.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={form.start_date} onChange={set('start_date')} className="text-[13px]" />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={form.end_date} onChange={set('end_date')} className="text-[13px]" />
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <select value={form.status} onChange={set('status')} className={selectClass}>
            <option value="">— No status —</option>
            {statuses.map(s => <option key={s.name} value={s.name}>{s.label}</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PlanForm;
