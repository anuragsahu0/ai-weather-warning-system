import { NavLink } from 'react-router-dom';
import {
  CloudSun,
  Radio,
  Wind,
  Heart,
  MoreHorizontal,
  MapPin,
  ShieldAlert,
  Award,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { useLocation } from '../../context/LocationContext.js';

export function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const { currentLocation } = useLocation();

  const navItems = [
    { title: 'Forecasts', path: '/', icon: CloudSun },
    { title: 'Radar (1.1km)', path: '/radar', icon: Radio },
    { title: 'Air Quality Index', path: '/analytics', icon: Wind },
    { title: 'Allergy & Health', path: '/settings', icon: Heart },
    { title: 'SIH Judge Control', path: '/sih/judge', icon: Award },
    { title: 'Active Alerts', path: '/alerts', icon: ShieldAlert },
    { title: 'More Intelligence', path: '/sih/architecture', icon: MoreHorizontal },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-white border-r border-slate-200/90 transition-all duration-300 z-30 sticky top-0 h-screen select-none shadow-[1px_0_10px_rgba(0,0,0,0.02)]',
        collapsed ? 'w-20' : 'w-56'
      )}
    >
      {/* Brand Header: Blue Logo like The Weather Channel in SS */}
      <div className="p-4 pb-6 border-b border-slate-100 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center p-1 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="text-[10px] font-black tracking-tighter leading-none uppercase">ERROR</span>
            <span className="text-sm font-extrabold tracking-tight leading-none">404</span>
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 font-sans">
                ERROR 404
              </span>
              <span className="text-[10px] text-blue-600 font-semibold tracking-tight">
                Severe Weather AI
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all group',
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
              title={collapsed ? item.title : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'
                    )}
                  />

                  {!collapsed && (
                    <span className="flex-1 truncate">{item.title}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom User / Location Capsule Pill */}
      <div className="p-3 border-t border-slate-100 bg-white">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-sm">
            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin className="w-3 h-3 text-blue-600" />
            </div>
            <span className="truncate flex-1 font-semibold text-slate-800">
              {currentLocation.district}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-mono">
              GPS
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
