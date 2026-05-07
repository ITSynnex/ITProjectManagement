import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/plans');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fill = (email) => setForm({ email, password: 'password123' });

  const inputBase = {
    border: '1px solid #E8E6E0',
    color: '#1A1A1A',
    backgroundColor: 'white',
    width: '100%',
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F7F6F3' }}>

      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-center items-center flex-1 p-12 text-white"
        style={{ backgroundColor: '#4F46E5' }}
      >
        <div className="max-w-sm w-full">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            IT Project<br />Management
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Track, manage and deliver IT projects with your team efficiently.
          </p>
          <div className="mt-10 space-y-3">
            {[
              'Plan projects with visual boards',
              'Assign tasks to team members',
              'Track progress in real-time',
            ].map(feat => (
              <div key={feat} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <ChevronRight className="w-3 h-3" />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-white"
        style={{ borderLeft: '1px solid #E8E6E0' }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#4F46E5' }}
            >
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold" style={{ color: '#1A1A1A' }}>IT Project Management</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-1" style={{ color: '#1A1A1A' }}>Welcome back</h2>
            <p className="text-[13px]" style={{ color: '#6B7280' }}>Sign in to continue to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-[13px] px-3 py-2.5 rounded-lg"
                style={{ color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#374151' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: '#9CA3AF' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  className="rounded-md pl-9 pr-3 py-2 text-[13px] focus:outline-none transition-shadow"
                  style={inputBase}
                  placeholder="you@company.com"
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#374151' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: '#9CA3AF' }} />
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                  className="rounded-md pl-9 pr-3 py-2 text-[13px] focus:outline-none transition-shadow"
                  style={inputBase}
                  placeholder="••••••••"
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors duration-150 disabled:opacity-50 mt-1"
              style={{ backgroundColor: '#4F46E5' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#4338CA')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4F46E5')}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-7 pt-6" style={{ borderTop: '1px solid #E8E6E0' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
              Demo accounts
            </p>
            <div className="space-y-1">
              {[
                { email: 'admin@company.com', label: 'IT Manager',    color: '#7C3AED', bg: '#F3E8FF' },
                { email: 'pmo@company.com',   label: 'PMO',           color: '#4F46E5', bg: '#EEF2FF' },
                { email: 'dev@company.com',   label: 'Dev Operation', color: '#4B5563', bg: '#F3F4F6' },
              ].map(({ email, label, color, bg }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fill(email)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors duration-150"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F6F3'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: bg, color }}>
                    {label}
                  </span>
                  <span className="text-[11px]" style={{ color: '#9CA3AF' }}>{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
