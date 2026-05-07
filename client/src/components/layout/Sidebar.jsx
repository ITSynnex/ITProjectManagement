import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, BarChart2, Users, Settings, ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const TEAMS = ['DEV1', 'DEV2', 'INFRA', 'AI', 'PRODUCT'];

const TEAM_COLORS = {
  DEV1:    { bg: '#EEF2FF', text: '#4F46E5' },
  DEV2:    { bg: '#F0FDF4', text: '#16A34A' },
  INFRA:   { bg: '#FFF7ED', text: '#EA580C' },
  AI:      { bg: '#FDF4FF', text: '#9333EA' },
  PRODUCT: { bg: '#FFF1F2', text: '#E11D48' },
};

const NavItem = ({ to, icon: Icon, label, end, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) => cn(
      'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors duration-100',
      isActive
        ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
        : 'text-[#374151] hover:bg-[#F3F2EF]'
    )}
  >
    {({ isActive }) => (
      <>
        <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#4F46E5]' : 'text-[#9CA3AF]')} />
        <span className="flex-1 truncate">{label}</span>
      </>
    )}
  </NavLink>
);

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTeam = searchParams.get('team');

  const handleTeamClick = (team) => {
    if (activeTeam === team) {
      navigate('/plans');
    } else {
      navigate(`/plans?team=${team}`);
    }
    onClose?.();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-200',
        'w-56 bg-white border-r border-[#E8E6E0]',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:z-auto'
      )}>

        {/* Workspace logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[#E8E6E0] flex-shrink-0">
          <div className="w-7 h-7 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#1A1A1A] truncate leading-tight">IT Workspace</p>
            <p className="text-[11px] text-[#9CA3AF] leading-tight">Project Management</p>
          </div>
        </div>

        {/* Nav content */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">

          {/* Top menu */}
          <NavItem to="/plans" end icon={FolderKanban} label="Projects" onClick={onClose} />
          {user?.role === 'it_manager' && (
            <NavItem to="/admin/users" icon={Users} label="Users" onClick={onClose} />
          )}

          {/* Separator */}
          <div className="my-2 border-t border-[#E8E6E0]" />

          {/* Teams section */}
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1 mb-1">
              <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Teams</span>
            </div>

            <div className="space-y-0.5">
              {TEAMS.map(team => {
                const isActive = activeTeam === team;
                const colors = TEAM_COLORS[team];
                return (
                  <button
                    key={team}
                    onClick={() => handleTeamClick(team)}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-sm transition-colors text-left',
                      isActive ? 'font-medium' : 'text-[#374151] hover:bg-[#F3F2EF]'
                    )}
                    style={isActive ? { backgroundColor: colors.bg, color: colors.text } : {}}
                  >
                    <span
                      className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {team[0]}
                    </span>
                    <span className="flex-1 truncate text-[13px]">{team}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Settings footer */}
        <div className="px-2 py-3 border-t border-[#E8E6E0] flex-shrink-0">
          <button className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-sm text-[#6B7280] hover:bg-[#F3F2EF] transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
