import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, ClipboardList, LayoutDashboard } from 'lucide-react';

const Item = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center flex-1 py-2 ${
      active ? 'text-blue-600' : 'text-gray-600'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

const MobileNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 md:hidden">
      <div className="max-w-7xl mx-auto px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-between" style={{ height: 64 }}>
          <Item to="/" icon={Home} label="Home" active={pathname === '/'} />
          <Item to="/results" icon={Search} label="Search" active={pathname.startsWith('/results')} />
          <Item to="/sms" icon={MessageSquare} label="SMS" active={pathname.startsWith('/sms')} />
          <Item to="/feedback" icon={ClipboardList} label="Feedback" active={pathname.startsWith('/feedback')} />
          <Item to="/admin" icon={LayoutDashboard} label="Admin" active={pathname.startsWith('/admin')} />
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;
