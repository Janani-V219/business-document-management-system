import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Package,
  Palette,
  Building2,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Quotations', path: '/quotations', icon: FileText },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Products & Services', path: '/products', icon: Package },
    { name: 'Templates', path: '/templates', icon: Palette },
    { name: 'Company Profile', path: '/company', icon: Building2 },
  ];

  const adminItems = [
    { name: 'Numbering Settings', path: '/settings/numbering', icon: Settings },
    { name: 'User Management', path: '/settings/users', icon: ShieldAlert },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Invoicify</h1>
            <p className="text-xs text-slate-400">Quotes & Invoicing</p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Main Menu
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {isAdmin && (
            <div>
              <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Administration
              </div>
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose?.()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Active user footer */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 border border-slate-700">
            {user?.username?.slice(0, 2)?.toUpperCase() || 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-emerald-400' : 'bg-blue-400'}`} />
              <span>{user?.role === 'ADMIN' ? 'Administrator' : 'Staff Member'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
