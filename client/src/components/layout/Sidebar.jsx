import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, Users, Settings,
  ChevronLeft, ChevronRight, UserCircle, Building2, UsersRound, Tag, Heart, BarChart2, Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getActiveDepartments } from '../../api/departments.api';
import { getActiveTeams } from '../../api/teams.api';
import { getTeamColors } from '../../lib/teamColors';

const DEPT_COLORS = [
  { bg: '#EEF2FF', text: '#4F46E5' },
  { bg: '#F0FDF4', text: '#16A34A' },
  { bg: '#FFF7ED', text: '#EA580C' },
  { bg: '#FDF4FF', text: '#9333EA' },
  { bg: '#FFF1F2', text: '#E11D48' },
  { bg: '#ECFEFF', text: '#0891B2' },
  { bg: '#FEFCE8', text: '#CA8A04' },
];

/* ── Tooltip wrapper ── */
const Tooltip = ({ label, show, children }) => {
  if (!show) return children;
  return (
    <div className="relative group/tip w-full">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60] opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
          {label}
        </div>
      </div>
    </div>
  );
};

/* ── Nav item ── */
const NavItem = ({ to, icon: Icon, label, end, onClick, collapsed }) => (
  <Tooltip label={label} show={collapsed}>
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => cn(
        'flex items-center rounded-md text-sm transition-colors duration-100 w-full',
        collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5',
        isActive
          ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
          : 'text-[#374151] hover:bg-[#F3F2EF]'
      )}
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#4F46E5]' : 'text-[#9CA3AF]')} />
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
        </>
      )}
    </NavLink>
  </Tooltip>
);

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTeam = searchParams.get('team');
  const activeDept = searchParams.get('department');

  const [teams, setTeams]           = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    getActiveTeams()
      .then(r => setTeams(r.data))
      .catch(() => {});
    getActiveDepartments()
      .then(r => setDepartments(r.data))
      .catch(() => {});
  }, []);

  const handleTeamClick = (teamName) => {
    navigate(activeTeam === teamName ? '/plans' : `/plans?team=${teamName}`);
    onClose?.();
  };

  const handleDeptClick = (id) => {
    navigate(String(activeDept) === String(id) ? '/plans' : `/plans?department=${id}`);
    onClose?.();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full z-30 flex flex-col',
        'bg-white border-r border-[#E8E6E0]',
        'transition-all duration-200 ease-in-out',
        collapsed ? 'w-14' : 'w-56',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:z-auto'
      )}>

        {/* Workspace logo */}
        <div className={cn(
          'flex items-center h-14 border-b border-[#E8E6E0] flex-shrink-0 overflow-hidden',
          collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'
        )}>
          <div className="w-7 h-7 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1A1A1A] truncate leading-tight">Project Management</p>
              <p className="text-[11px] text-[#9CA3AF] leading-tight">Project Management</p>
            </div>
          )}
        </div>

        {/* Nav content */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 overflow-x-hidden">

          {/* Top menu */}
          <NavItem to="/plans" end icon={FolderKanban} label="Projects" onClick={onClose} collapsed={collapsed} />
          {user?.role === 'it_manager' && (
            <NavItem to="/admin/users" icon={Users} label="Users" onClick={onClose} collapsed={collapsed} />
          )}
          {(user?.role === 'it_manager' || user?.role === 'pmo') && (
            <NavItem to="/admin/operators" icon={UserCircle} label="Operator" onClick={onClose} collapsed={collapsed} />
          )}
          {(user?.role === 'it_manager' || user?.role === 'pmo') && (
            <NavItem to="/admin/departments" icon={Building2} label="Department" onClick={onClose} collapsed={collapsed} />
          )}
          {(user?.role === 'it_manager' || user?.role === 'pmo') && (
            <NavItem to="/admin/teams" icon={UsersRound} label="Teams" onClick={onClose} collapsed={collapsed} />
          )}
          {(user?.role === 'it_manager' || user?.role === 'pmo') && (
            <NavItem to="/admin/statuses" icon={Tag} label="Status" onClick={onClose} collapsed={collapsed} />
          )}
          {(user?.role === 'it_manager' || user?.role === 'pmo') && (
            <NavItem to="/admin/buckets" icon={Layers} label="Buckets" onClick={onClose} collapsed={collapsed} />
          )}
          {(user?.role === 'it_manager' || user?.role === 'pmo') && (
            <NavItem to="/admin/health" icon={Heart} label="Health" onClick={onClose} collapsed={collapsed} />
          )}

          {/* Separator */}
          <div className="my-2 border-t border-[#E8E6E0]" />

          {/* Overview section */}
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-3 py-1 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Overview</span>
            </div>
          )}
          <NavItem to="/overview/team"       icon={BarChart2} label="By IT Team"    onClick={onClose} collapsed={collapsed} />
          <NavItem to="/overview/department" icon={BarChart2} label="By Department" onClick={onClose} collapsed={collapsed} />
          <NavItem to="/overview/bucket"     icon={Layers}    label="By Bucket"     onClick={onClose} collapsed={collapsed} />

          {/* Separator */}
          <div className="my-2 border-t border-[#E8E6E0]" />

          {/* Teams section */}
          <div>
            {!collapsed && (
              <div className="flex items-center gap-1.5 px-3 py-1 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Teams</span>
              </div>
            )}
            <div className="space-y-0.5">
              {!collapsed && teams.length === 0 && (
                <p className="px-3 py-1 text-[12px] text-[#C4C0B8]">No teams</p>
              )}
              {teams.map(team => {
                const isActive = activeTeam === team.name;
                const colors   = getTeamColors(team.color);
                return (
                  <Tooltip key={team.id} label={team.name} show={collapsed}>
                    <button
                      onClick={() => handleTeamClick(team.name)}
                      className={cn(
                        'flex items-center w-full rounded-md text-sm transition-colors text-left',
                        collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5',
                        isActive ? 'font-medium' : 'text-[#374151] hover:bg-[#F3F2EF]'
                      )}
                      style={isActive ? { backgroundColor: colors.bg, color: colors.text } : {}}
                    >
                      <span
                        className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {team.name[0]}
                      </span>
                      {!collapsed && (
                        <span className="flex-1 truncate text-[13px]">{team.name}</span>
                      )}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Separator */}
          <div className="my-2 border-t border-[#E8E6E0]" />

          {/* Department section */}
          <div>
            {!collapsed && (
              <div className="flex items-center gap-1.5 px-3 py-1 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Department</span>
              </div>
            )}
            <div className="space-y-0.5">
              {!collapsed && departments.length === 0 && (
                <p className="px-3 py-1 text-[12px] text-[#C4C0B8]">No departments</p>
              )}
              {departments.map((dept, idx) => {
                const isActive = String(activeDept) === String(dept.id);
                const colors   = DEPT_COLORS[idx % DEPT_COLORS.length];
                const initial  = [...dept.name][0].toUpperCase();
                return (
                  <Tooltip key={dept.id} label={dept.name} show={collapsed}>
                    <button
                      onClick={() => handleDeptClick(dept.id)}
                      className={cn(
                        'flex items-center w-full rounded-md text-sm transition-colors text-left',
                        collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5',
                        isActive ? 'font-medium' : 'text-[#374151] hover:bg-[#F3F2EF]'
                      )}
                      style={isActive ? { backgroundColor: colors.bg, color: colors.text } : {}}
                    >
                      <span
                        className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {initial}
                      </span>
                      {!collapsed && (
                        <span className="flex-1 truncate text-[13px]">{dept.name}</span>
                      )}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

        </nav>

        {/* Footer: collapse toggle + settings */}
        <div className="px-2 py-3 border-t border-[#E8E6E0] flex-shrink-0 space-y-0.5">
          <Tooltip label="Settings" show={collapsed}>
            <button className={cn(
              'flex items-center w-full rounded-md text-sm text-[#6B7280] hover:bg-[#F3F2EF] transition-colors',
              collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5'
            )}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Settings</span>}
            </button>
          </Tooltip>

          <Tooltip label={collapsed ? 'Expand sidebar' : ''} show={collapsed}>
            <button
              onClick={onToggleCollapse}
              className={cn(
                'flex items-center w-full rounded-md text-sm text-[#6B7280] hover:bg-[#F3F2EF] transition-colors',
                collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5'
              )}
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4 flex-shrink-0" />
                : (
                  <>
                    <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                    <span>Collapse</span>
                  </>
                )
              }
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
