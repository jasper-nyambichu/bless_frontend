import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, History, BarChart3, LogOut, Cross, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/transactions', label: 'Transactions', icon: History },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-primary flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <Cross className="h-5 w-5 text-accent" />
          <span className="font-serif text-xl text-accent font-bold">BlessPay</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs font-medium text-accent">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        {adminLinks.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-md mb-1 text-sm font-medium ${
                isActive
                  ? 'bg-navy-light text-primary-foreground border-l-[3px] border-accent'
                  : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-navy-light/50'
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-navy-light/50 w-full"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
