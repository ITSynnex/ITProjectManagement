import { useState, useEffect } from 'react';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../api/teams.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { TEAM_COLOR_PALETTE, getTeamColors } from '../../lib/teamColors';

const empty = { name: '', color: 'indigo', status: 'active' };

const Label = ({ children, required }) => (
  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const SetupTeamPage = () => {
  const { user } = useAuth();
  const [teams, setTeams]               = useState([]);
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
    getTeams()
      .then(r => setTeams(r.data))
      .catch(() => setError('Failed to load teams.'))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditTarget(null);
    setForm(empty);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (team) => {
    setEditTarget(team);
    setForm({ name: team.name, color: team.color, status: team.status });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Team name is required');
    setSaving(true);
    setFormError('');
    try {
      if (editTarget) {
        const r = await updateTeam(editTarget.id, form);
        setTeams(prev => prev.map(t => t.id === editTarget.id ? r.data : t));
      } else {
        const r = await createTeam(form);
        setTeams(prev => [...prev, r.data]);
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
      await deleteTeam(deleteTarget.id);
      setTeams(prev => prev.filter(t => t.id !== deleteTarget.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete team.');
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
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">Teams Management</h1>
              <p className="text-[13px] text-[#6B7280] mt-0.5">Manage teams used across projects</p>
            </div>
          </div>
          {canEdit && (
            <Button variant="default" size="sm" onClick={openNew}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Team
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
          <div
            className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}>
                  {['#', 'Team Name', 'Color', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((team, idx) => {
                  const colors = getTeamColors(team.color);
                  return (
                    <tr key={team.id}
                      className="group border-b border-[#E8E6E0] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-4 py-3 text-[12px] text-[#9CA3AF]">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {team.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] text-[#6B7280] capitalize">{team.color}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={team.status === 'active' ? 'completed' : 'default'}>
                          {team.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#6B7280]">{formatDate(team.created_at)}</td>
                      <td className="px-4 py-3">
                        {canEdit && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(team)}
                              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(team)}
                              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {teams.length === 0 && (
              <div className="text-center py-10 text-[13px] text-[#9CA3AF]">
                No teams yet. {canEdit && 'Create your first team.'}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={editTarget ? 'Edit Team' : 'New Team'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
                {formError}
              </p>
            )}
            <div>
              <Label required>Team Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. NETWORK"
                className="text-[13px]"
                autoFocus
              />
            </div>
            <div>
              <Label>Color</Label>
              <select
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className={selectClass}
              >
                {Object.keys(TEAM_COLOR_PALETTE).map(key => (
                  <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                ))}
              </select>
              {form.color && (
                <div className="mt-2">
                  <span
                    className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: TEAM_COLOR_PALETTE[form.color]?.bg, color: TEAM_COLOR_PALETTE[form.color]?.text }}
                  >
                    {form.name || 'Preview'}
                  </span>
                </div>
              )}
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
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete team "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default SetupTeamPage;
