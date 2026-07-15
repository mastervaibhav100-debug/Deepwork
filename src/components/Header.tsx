import { Bell, Settings, Search, Sparkles } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  workspaceName: string;
}

export default function Header({ activeTab, setActiveTab, workspaceName }: HeaderProps) {
  // Map our sub-sections to the header tabs
  const tabs = [
    { id: "dashboard", label: "Focus" },
    { id: "routine", label: "Routine" },
    { id: "analytics", label: "Progress" },
    { id: "settings", label: "Archive" },
  ];

  return (
    <header id="app-header" className="h-16 sticky top-0 z-40 backdrop-blur-xl bg-slate-950/40 border-b border-white/10 px-8 flex items-center justify-between">
      {/* Horizontal Nav Tabs */}
      <nav id="header-tabs" className="flex items-center space-x-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`header-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`h-16 relative flex items-center justify-center font-geist text-sm tracking-wide transition-all ${
                isActive 
                  ? "text-indigo-400 font-bold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
              {isActive && (
                <span
                  id={`header-tab-active-line-${tab.id}`}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-400 to-emerald-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Side Icons & Quick Info */}
      <div id="header-right-utilities" className="flex items-center gap-5">
        {/* Search bar decoration or active focus signal pulse */}
        <div id="status-tag" className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full py-1.5 px-3.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider text-indigo-300 uppercase font-bold">
            SECURE LINK ACTIVE
          </span>
        </div>

        {/* Notifications Button */}
        <button
          id="btn-header-bell"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-indigo-300 transition-all border border-white/10 relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Quick Settings Icon */}
        <button
          id="btn-header-settings"
          onClick={() => setActiveTab("settings")}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-indigo-300 transition-all border border-white/10 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Small Profile Widget */}
        <div id="header-avatar-container" className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500/15 border border-indigo-400/50 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-300">ST</span>
          </div>
        </div>
      </div>
    </header>
  );
}
