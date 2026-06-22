import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import ThemeToggle from '@/components/common/ThemeToggle';
import Logo from '@/components/common/Logo';

const NAV = [
  { icon: '⊞',  label: 'Dashboard',       to: ROUTES.BRAND_DASHBOARD      },
  { icon: '◎',  label: 'Search Creators',  to: ROUTES.BRAND_SEARCH         },
  { icon: '◈',  label: 'Campaigns',        to: ROUTES.BRAND_CAMPAIGNS      },
  { icon: '◉',  label: 'Collaborations',   to: ROUTES.BRAND_COLLABORATIONS },
  { icon: '💬', label: 'Messages',         to: ROUTES.BRAND_MESSAGES       },
  { icon: '🪪', label: 'Brand Portfolio',  to: ROUTES.BRAND_MY_PORTFOLIO   },
  { icon: '⚡', label: 'Activity',         to: ROUTES.BRAND_ACTIVITY       },
  { icon: '⚙',  label: 'Settings',         to: ROUTES.BRAND_SETTINGS       },
];

export default function BrandSidebar() {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotification();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'BR';

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col min-h-screen border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Logo size={24} />
      </div>

      {/* User pill */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-fg truncate">{user?.email ?? 'Brand User'}</p>
            <p className="text-[10px] text-fg-muted">Brand account</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-fg-muted uppercase tracking-widest px-2 mb-2 mt-1">Menu</p>
        {NAV.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="text-base w-5 flex-shrink-0 leading-none">{icon}</span>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
        <ThemeToggle />
        <NavLink
          to={ROUTES.BRAND_NOTIFICATIONS}
          className={({ isActive }) => `sidebar-link w-full relative${isActive ? ' active' : ''}`}
        >
          <span className="text-base w-5 flex-shrink-0">🔔</span>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span
              className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ background: 'var(--brand-500)' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>
        <button
          onClick={logout}
          className="sidebar-link w-full !text-danger hover:!bg-danger/10"
        >
          <span className="text-base w-5 flex-shrink-0">←</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
