import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, updateProject, deleteProject } from '../../api/projects.api';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import ProjectForm from '../../components/projects/ProjectForm';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { priorityColor, statusColor } from '../../utils/priorityColor';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await getProject(id); setProject(r.data); }
    catch { setError('Failed to load project. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async (data) => {
    const res = await updateProject(id, data);
    setProject(prev => ({ ...prev, ...res.data }));
    setEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch {
      setConfirmDelete(false);
      setError('Failed to delete project. Please try again.');
    }
  };

  if (loading) return <Spinner />;
  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={load} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Retry</button>
    </div>
  );
  if (!project) return null;

  return (
    <div>
      <div className="flex items-start justify-between mb-2 gap-4">
        <div>
          <button onClick={() => navigate('/projects')} className="text-sm text-blue-600 hover:underline mb-1 block">← Projects</button>
          <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
        </div>
        {user.role === 'PMO' && (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">Edit</button>
            <button onClick={() => setConfirmDelete(true)} className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge label={project.priority} className={priorityColor(project.priority)} />
        <Badge label={project.status} className={statusColor(project.status)} />
        {project.deadline && <span className="text-xs text-gray-500">Due {formatDate(project.deadline)}</span>}
      </div>
      {project.description && <p className="text-sm text-gray-600 mb-6">{project.description}</p>}

      <KanbanBoard projectId={Number(id)} initialTasks={project.tasks || []} />

      {editing && (
        <Modal title="Edit Project" onClose={() => setEditing(false)}>
          <ProjectForm initial={project} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </Modal>
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete project "${project.title}"? All tasks will be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
