import { 
  LayoutDashboard, 
  Flame, 
  Clock, 
  BarChart3, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  workspaceName: string;
  tagline: string;
  onAddClick: () => void;
  onResetAll: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  workspaceName,
  tagline,
  onAddClick,
  onResetAll,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "deep-work", label: "Deep Work", icon: Flame },
    { id: "routine", label: "Routine", icon: Clock },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside id="sidebar-container" className="w-64 backdrop-blur-xl bg-white/3 border-r border-white/10 flex flex-col h-screen sticky top-0 shrink-0 text-white select-none">
      {/* Brand Logo Header */}
      <div id="sidebar-logo-section" className="p-6 border-b border-white/10 flex items-center gap-3">
        <div id="logo-icon-container" className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <Sparkles id="logo-icon-svg" className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 id="logo-brand-title" className="font-geist font-bold text-lg tracking-wider text-white">
            Deep<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-extrabold">Work</span>
          </h1>
          <p id="logo-version" className="text-[10px] text-slate-400 tracking-widest font-mono">v2.4</p>
        </div>
      </div>

      {/* User / Profile Panel */}
      <div id="sidebar-profile-card" className="m-4 p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 flex items-center gap-3 shadow-lg">
        <div id="avatar-circle" className="relative w-10 h-10 rounded-full overflow-hidden bg-indigo-500/20 border border-indigo-400 flex items-center justify-center">
          <span id="avatar-initials" className="font-geist text-sm font-bold text-indigo-300">ST</span>
          <span id="avatar-online-dot" className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>
        <div className="overflow-hidden">
          <h3 id="profile-workspace-name" className="text-sm font-geist font-medium text-white truncate">
            {workspaceName}
          </h3>
          <p id="profile-tagline" className="text-[10px] text-indigo-400 font-mono tracking-wider truncate uppercase font-bold">
            {tagline}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav id="sidebar-navigation" className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                isActive 
                  ? "text-indigo-300 font-medium bg-indigo-500/10 border-l-2 border-indigo-500" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span className="text-sm font-geist">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-y-0 right-0 w-1 bg-indigo-500 rounded-l-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Add Task Quick Trigger */}
      <div id="sidebar-add-task-container" className="px-4 py-3">
        <button
          id="btn-sidebar-add-task"
          onClick={onAddClick}
          className="w-full py-3 px-4 bg-gradient-to-br from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl font-geist font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          ADD TASK
        </button>
      </div>

      {/* Footer Utility buttons */}
      <div id="sidebar-footer" className="p-4 border-t border-white/10 space-y-1">
        <button
          id="btn-sidebar-support"
          onClick={() => setActiveTab("settings")}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="font-geist">Support Center</span>
        </button>
        <button
          id="btn-sidebar-reset-data"
          onClick={onResetAll}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600/20 border border-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-geist">Reset All Data</span>
        </button>
      </div>
    </aside>
  );
}
