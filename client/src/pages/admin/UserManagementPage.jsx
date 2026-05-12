import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../../api/users.api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import { Plus, Users, Trash2 } from 'lucide-react';

const ROLES = ['it_manager', 'pmo', 'dev_operation'];
const ROLE_LABELS = { it_manager: 'IT Manager', pmo: 'PMO', dev_operation: 'Dev Operation' };
const ROLE_VARIANTS = { it_manager: 'default', pmo: 'primary', dev_operation: 'outline' };

const empty = { display_name: '', email: '', password: '', role: 'pmo' };

const Label = ({ children, required }) => (
  <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#374151' }}>
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const selectClass = 'w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent';

const UserManagementPage = () => {
  const { user: me } = useAuth();
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]                 = useState(empty);
  const [formError, setFormError]       = useState('');
  const [saving, setSaving]             = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try { const r = await getUsers(); setUsers(r.data); }
    catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    const { display_name, email, password, role } = form;
    if (!display_name || !email || !password || !role) return setFormError('All fields are required');
    setSaving(true);
    setFormError('');
    try {
      const res = await createUser(form);
      setUsers(prev => [...prev, res.data]);
      setShowForm(false);
      setForm(empty);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
    } catch {
      setError('Failed to delete user.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <Spinner text="Loading users…" />;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Sticky header */}
      <div className="bg-white border-b border-[#E8E6E0] px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">User Management</h1>
              <p className="text-[13px] text-[#6B7280] mt-0.5">
                {users.length} user{users.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => { setShowForm(true); setFormError(''); setForm(empty); }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add User
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <p className="text-[13px] px-3 py-2.5 rounded-lg mb-4"
            style={{ color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
            {error}
          </p>
        )}

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: '#EEF2FF' }}>
              <Users className="w-7 h-7" style={{ color: '#4F46E5' }} />
            </div>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: '#1A1A1A' }}>No users yet</h3>
            <p className="text-[13px]" style={{ color: '#6B7280' }}>Add your first user to get started.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden"
            style={{ backgroundColor: 'white', border: '1px solid #E8E6E0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F7F6F3', borderBottom: '1px solid #E8E6E0' }}>
                  {['Name', 'Email', 'Role', 'Created', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide ${i < 4 ? 'text-left' : ''}`}
                      style={{ color: '#9CA3AF' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isMe = u.id === me?.id;
                  return (
                    <tr
                      key={u.id}
                      className="border-b transition-colors duration-100"
                      style={{ borderColor: '#F3F2EF' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F6F3'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.display_name} size="sm" />
                          <span className="text-[13px] font-medium" style={{ color: '#1A1A1A' }}>{u.display_name}</span>
                          {isMe && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[13px]" style={{ color: '#6B7280' }}>{u.email}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={ROLE_VARIANTS[u.role] ?? 'outline'}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-[13px]" style={{ color: '#6B7280' }}>
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {!isMe && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-lg transition-colors duration-150"
                            style={{ color: '#9CA3AF' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.color = '#DC2626';
                              e.currentTarget.style.backgroundColor = '#FEF2F2';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = '#9CA3AF';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showForm && (
        <Modal title="Add New User" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <p className="text-[13px] px-3 py-2.5 rounded-lg"
                style={{ color: '#B91C1C', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                {formError}
              </p>
            )}
            <div>
              <Label required>Display Name</Label>
              <Input value={form.display_name} onChange={set('display_name')} placeholder="John Smith" className="text-[13px]" />
            </div>
            <div>
              <Label required>Email</Label>
              <Input type="email" value={form.email} onChange={set('email')} placeholder="john@company.com" className="text-[13px]" />
            </div>
            <div>
              <Label required>Password</Label>
              <Input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" className="text-[13px]" />
            </div>
            <div>
              <Label required>Role</Label>
              <select value={form.role} onChange={set('role')} className={selectClass}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? 'Saving…' : 'Add User'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete user "${deleteTarget.display_name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
