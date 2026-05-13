import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';

const ROLE_LABELS = { it_manager: 'IT Manager', pmo: 'PMO', operator: 'Operator', user: 'User' };
const ROLE_COLORS = {
  it_manager: { bg: '#F5F3FF', text: '#7C3AED' },
  pmo:        { bg: '#EEF2FF', text: '#4F46E5' },
  operator:   { bg: '#F0FDF4', text: '#16A34A' },
  user:       { bg: '#F3F4F6', text: '#6B7280' },
};

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const rc = ROLE_COLORS[user?.role] ?? ROLE_COLORS.user;

  return (
    <header className="h-14 bg-white border-b border-[#E8E6E0] flex items-center px-4 gap-3 flex-shrink-0">
      <button
        className="md:hidden p-1.5 rounded-md text-[#6B7280] hover:bg-[#F3F2EF] transition-colors"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold select-none flex-shrink-0"
          style={{ backgroundColor: '#4F46E5' }}
          title={user?.display_name}
        >
          {initials(user?.display_name)}
        </div>

        <div className="hidden sm:block leading-tight">
          <p className="text-[13px] font-medium text-[#1A1A1A]">{user?.display_name}</p>
          <span
            className="text-[11px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: rc.bg, color: rc.text }}
          >
            {ROLE_LABELS[user?.role] ?? user?.role}
          </span>
        </div>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline text-[13px]">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
