import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, History, UserCircle, LogOut, Cross } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const memberLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/payment', label: 'Make Payment', icon: CreditCard },
  { to: '/transactions', label: 'Transactions', icon: History },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export const MemberSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-primary flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-2">
        <Cross className="h-5 w-5 text-accent" />
        <span className="font-serif text-xl text-accent font-bold">BlessPay</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4">
        {memberLinks.map(link => {
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
