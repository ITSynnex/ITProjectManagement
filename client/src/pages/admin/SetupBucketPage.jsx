import { useState, useEffect } from 'react';
import { getPlanBuckets, createPlanBucket, updatePlanBucket, deletePlanBucket } from '../../api/planBuckets.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';

const COLOR_OPTIONS = [
  { value: 'not_started', label: 'Gray' },
  { value: 'ongoing',     label: 'Indigo' },
  { value: 'on_track',    label: 'Green' },
  { value: 'at_risk',     label: 'Red' },
  { value: 'suspended',   label: 'Orange' },
  { value: 'closed',      label: 'Blue' },
  { value: 'in_progress', label: 'Yellow' },
  { value: 'default',     label: 'Default (Gray)' },
];

const empty = { name: '', color: 'not_started', sort_order: 0 };

const Label = ({ children, required }) => (
  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const SetupBucketPage = () => {
  const { user } = useAuth();
  const [buckets, setBuckets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]               = useState(empty);
  const [formError, setFormError]     = useState('');
  const [saving, setSaving]           = useState(false);

  const canEdit = user?.role === 'it_manager' || user?.role === 'pmo';

  const selectClass = 'w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent';

  useEffect(() => {
    getPlanBuckets()
      .then(r => setBuckets(r.data))
      .catch(() => setError('Failed to load buckets.'))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditTarget(null);
    setForm({ ...empty, sort_order: buckets.length + 1 });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditTarget(b);
    setForm({ name: b.name, color: b.color, sort_order: b.sort_order });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Bucket name is required');
    setSaving(true);
    setFormError('');
    try {
      if (editTarget) {
        const r = await updatePlanBucket(editTarget.id, form);
        setBuckets(prev => prev.map(b => b.id === editTarget.id ? r.data : b));
      } else {
        const r = await createPlanBucket(form);
        setBuckets(prev => [...prev, r.data].sort((a, b) => a.sort_order - b.sort_order));
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
      await deletePlanBucket(deleteTarget.id);
      setBuckets(prev => prev.filter(b => b.id !== deleteTarget.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete bucket.');
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
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">Bucket Management</h1>
              <p className="text-[13px] text-[#6B7280] mt-0.5">Manage project workflow buckets</p>
            </div>
          </div>
          {canEdit && (
            <Button variant="default" size="sm" onClick={openNew}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Bucket
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
                  {['#', 'Name', 'Color', 'Order', 'Active', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buckets.map((b, idx) => (
                  <tr key={b.id} className="group border-b border-[#E8E6E0] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 text-[12px] text-[#9CA3AF]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <Badge variant={b.color}>{b.name}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280] capitalize">
                      {COLOR_OPTIONS.find(c => c.value === b.color)?.label ?? b.color}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{b.sort_order}</td>
                    <td className="px-4 py-3">
                      <Badge variant={b.is_active ? 'on_track' : 'default'}>
                        {b.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{formatDate(b.created_at)}</td>
                    <td className="px-4 py-3">
                      {canEdit && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(b)}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                            title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(b)}
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
            {buckets.length === 0 && (
              <div className="text-center py-10 text-[13px] text-[#9CA3AF]">
                No buckets yet. {canEdit && 'Create your first bucket.'}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <Modal open={showForm} onClose={() => setShowForm(false)} title={editTarget ? 'Edit Bucket' : 'New Bucket'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">{formError}</p>
            )}
            <div>
              <Label required>Bucket Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. UAT"
                className="text-[13px]"
                autoFocus
                disabled={!!editTarget}
              />
              <p className="text-[11px] text-[#9CA3AF] mt-1">Cannot be changed after creation.</p>
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
              {form.name && (
                <div className="mt-2">
                  <Badge variant={form.color}>{form.name || 'Preview'}</Badge>
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
          message={`Delete bucket "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default SetupBucketPage;
