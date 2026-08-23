import { NavLink } from 'react-router-dom';
import { X, Radio } from 'lucide-react';
import { MAIN_NAVIGATION } from '../../config/navigation.js';
import { cn } from '../../lib/utils.js';

export function MobileNav({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile Drawer (When Open) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-card p-6 shadow-2xl flex flex-col justify-between border-r animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold tracking-wider text-sm font-mono">
                      ERROR <span className="text-cyan-400">404</span>
                    </span>
                    <div className="text-[10px] text-muted-foreground">Severe Weather Nowcast</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {MAIN_NAVIGATION.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all',
                          isActive
                            ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t text-[10px] font-mono text-muted-foreground text-center">
              Smart India Hackathon • ERROR 404
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Fixed Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 border-t bg-card/90 backdrop-blur-xl px-2 flex items-center justify-around select-none">
        {MAIN_NAVIGATION.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-14 h-12 rounded-lg text-[10px] font-medium transition-all',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-4 h-4 mb-1', isActive && 'text-primary scale-110')} />
                  <span className="truncate max-w-[50px]">{item.title}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
