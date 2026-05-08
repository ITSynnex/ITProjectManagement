import { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';

const empty = { name: '', status: 'active' };

const Label = ({ children, required }) => (
  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const DepartmentSetupPage = () => {
  const { user } = useAuth();
  const [depts, setDepts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]           = useState(empty);
  const [formError, setFormError] = useState('');
  const [saving, setSaving]       = useState(false);

  const canEdit = user?.role === 'it_manager' || user?.role === 'pmo';

  const selectClass = 'w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent';

  useEffect(() => {
    getDepartments()
      .then(r => setDepts(r.data))
      .catch(() => setError('Failed to load departments.'))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditTarget(null);
    setForm(empty);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (dept) => {
    setEditTarget(dept);
    setForm({ name: dept.name, status: dept.status });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Department name is required');
    setSaving(true);
    setFormError('');
    try {
      if (editTarget) {
        const r = await updateDepartment(editTarget.id, form);
        setDepts(prev => prev.map(d => d.id === editTarget.id ? r.data : d));
      } else {
        const r = await createDepartment(form);
        setDepts(prev => [...prev, r.data]);
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
      await deleteDepartment(deleteTarget.id);
      setDepts(prev => prev.filter(d => d.id !== deleteTarget.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete department.');
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
              <Building2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">Department Setup</h1>
              <p className="text-[13px] text-[#6B7280] mt-0.5">Manage departments for project assignment</p>
            </div>
          </div>
          {canEdit && (
            <Button variant="default" size="sm" onClick={openNew}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Department
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
                  {['#', 'Department Name', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {depts.map((dept, idx) => (
                  <tr key={dept.id}
                    className="group border-b border-[#E8E6E0] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 text-[12px] text-[#9CA3AF]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-medium text-[#1A1A1A]">{dept.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={dept.status === 'active' ? 'completed' : 'default'}>
                        {dept.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{formatDate(dept.created_at)}</td>
                    <td className="px-4 py-3">
                      {canEdit && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(dept)}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                            title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(dept)}
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
            {depts.length === 0 && (
              <div className="text-center py-10 text-[13px] text-[#9CA3AF]">
                No departments yet. {canEdit && 'Create your first department.'}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <Modal open={showForm} onClose={() => setShowForm(false)} title={editTarget ? 'Edit Department' : 'New Department'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">{formError}</p>
            )}
            <div>
              <Label required>Department Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Information Technology"
                className="text-[13px]"
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className={selectClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
          message={`Delete department "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default DepartmentSetupPage;
