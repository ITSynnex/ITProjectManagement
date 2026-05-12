import { useState, useEffect } from 'react';
import { getPlanHealth, createPlanHealth, updatePlanHealth, deletePlanHealth } from '../../api/planHealth.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import { Plus, Pencil, Trash2, Heart } from 'lucide-react';

const COLOR_OPTIONS = [
  { value: 'on_track',         label: 'Green',    preview: 'bg-green-50 text-green-700 ring-green-200' },
  { value: 'at_risk',          label: 'Red',      preview: 'bg-red-50 text-red-700 ring-red-200' },
  { value: 'off_track',        label: 'Orange',   preview: 'bg-orange-50 text-orange-700 ring-orange-200' },
  { value: 'priority_critical',label: 'Dark Red', preview: 'bg-red-100 text-red-700 ring-red-300' },
  { value: 'default',          label: 'Gray',     preview: 'bg-gray-100 text-gray-700 ring-gray-200' },
  { value: 'in_progress',      label: 'Yellow',   preview: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
  { value: 'closed',           label: 'Blue',     preview: 'bg-blue-50 text-blue-700 ring-blue-200' },
];

const empty = { name: '', label: '', color: 'on_track', sort_order: 0 };

const Label = ({ children, required }) => (
  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const SetupHealthPage = () => {
  const { user } = useAuth();
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]                 = useState(empty);
  const [formError, setFormError]       = useState('');
  const [saving, setSaving]             = useState(false);

  const canEdit = user?.role === 'it_manager' || user?.role === 'pmo';

  const selectClass = 'w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent';

  useEffect(() => {
    getPlanHealth()
      .then(r => setItems(r.data))
      .catch(() => setError('Failed to load health options.'))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditTarget(null);
    setForm({ ...empty, sort_order: items.length + 1 });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (h) => {
    setEditTarget(h);
    setForm({ name: h.name, label: h.label, color: h.color, sort_order: h.sort_order });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())  return setFormError('Health key is required');
    if (!form.label.trim()) return setFormError('Display label is required');
    setSaving(true);
    setFormError('');
    try {
      if (editTarget) {
        const r = await updatePlanHealth(editTarget.id, form);
        setItems(prev => prev.map(h => h.id === editTarget.id ? r.data : h));
      } else {
        const r = await createPlanHealth(form);
        setItems(prev => [...prev, r.data].sort((a, b) => a.sort_order - b.sort_order));
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlanHealth(deleteTarget.id);
      setItems(prev => prev.filter(h => h.id !== deleteTarget.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete health option.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">

      <div className="bg-white border-b border-[#E8E6E0] px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">Health Management</h1>
              <p className="text-[13px] text-[#6B7280] mt-0.5">Manage project health values</p>
            </div>
          </div>
          {canEdit && (
            <Button variant="default" size="sm" onClick={openNew}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Health
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 min-h-0">
        {error && (
          <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? <Spinner /> : (
          <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                  {['#', 'Key', 'Display Label', 'Color', 'Order', 'Active', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((h, idx) => (
                  <tr key={h.id} className="group border-b border-[#E8E6E0] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 text-[12px] text-[#9CA3AF]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-mono text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded">{h.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={h.color}>{h.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280] capitalize">
                      {COLOR_OPTIONS.find(c => c.value === h.color)?.label ?? h.color}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{h.sort_order}</td>
                    <td className="px-4 py-3">
                      <Badge variant={h.is_active ? 'on_track' : 'default'}>
                        {h.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{formatDate(h.created_at)}</td>
                    <td className="px-4 py-3">
                      {canEdit && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(h)}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                            title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(h)}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <div className="text-center py-10 text-[13px] text-[#9CA3AF]">
                No health options yet. {canEdit && 'Create your first health option.'}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <Modal open={showForm} onClose={() => setShowForm(false)} title={editTarget ? 'Edit Health' : 'New Health'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">{formError}</p>
            )}
            <div>
              <Label required>Health Key</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                placeholder="e.g. off_track"
                className="text-[13px] font-mono"
                autoFocus
                disabled={!!editTarget}
              />
              <p className="text-[11px] text-[#9CA3AF] mt-1">Lowercase with underscores. Cannot be changed after creation.</p>
            </div>
            <div>
              <Label required>Display Label</Label>
              <Input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Off Track"
                className="text-[13px]"
              />
            </div>
            <div>
              <Label>Color</Label>
              <select
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className={selectClass}
              >
                {COLOR_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {form.label && (
                <div className="mt-2">
                  <Badge variant={form.color}>{form.label || 'Preview'}</Badge>
                </div>
              )}
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="text-[13px]"
                min={0}
              />
            </div>
            {editTarget && (
              <div>
                <Label>Active</Label>
                <select
                  value={form.is_active === undefined ? 1 : form.is_active ? 1 : 0}
                  onChange={e => setForm(f => ({ ...f, is_active: Number(e.target.value) }))}
                  className={selectClass}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete health "${deleteTarget.label}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default SetupHealthPage;
