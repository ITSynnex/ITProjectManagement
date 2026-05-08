import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const TEAMS    = ['DEV1', 'DEV2', 'INFRA', 'AI', 'PRODUCT'];
const STATUSES = ['not_started', 'ongoing', 'completed', 'suspended', 'on_track', 'at_risk', 'closed'];
const STATUS_LABELS = {
  not_started: 'Not Started',
  ongoing:     'Ongoing',
  completed:   'Completed',
  suspended:   'Suspended',
  on_track:    'On Track',
  at_risk:     'At Risk',
  closed:      'Closed',
};

const empty = { name: '', team: '', owner_id: '', start_date: '', end_date: '', status: '' };

const Label = ({ children, required }) => (
  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const PlanForm = ({ open, onClose, onSave, initial, users = [] }) => {
  const [form, setForm]     = useState(empty);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial ? {
      name:       initial.name       ?? '',
      team:       initial.team       ?? '',
      owner_id:   initial.owner_id   ?? '',
      start_date: initial.start_date ?? '',
      end_date:   initial.end_date   ?? '',
      status:     initial.status     ?? '',
    } : empty);
    setError('');
  }, [open, initial]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required');
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        owner_id: form.owner_id ? Number(form.owner_id) : undefined,
        team:     form.team   || null,
        status:   form.status || null,
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Team</Label>
            <select value={form.team} onChange={set('team')} className={selectClass}>
              <option value="">— No team —</option>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label>Owner</Label>
            <select value={form.owner_id} onChange={set('owner_id')} className={selectClass}>
              <option value="">— Select owner —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.display_name}</option>
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
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
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
