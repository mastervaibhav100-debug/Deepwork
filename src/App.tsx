import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import DeepWorkView from "./components/DeepWorkView";
import RoutineView from "./components/RoutineView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import { AppData, TaskBlock, RoutineAnchor, Preferences } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [appData, setAppData] = useState<AppData | null>(null);

  // Deep work active focus synchronization
  const [selectedTaskForFocus, setSelectedTaskForFocus] = useState<TaskBlock | null>(null);

  // Load data from Express backend on mount and sync with local storage if necessary
  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/data");
      if (!response.ok) {
        throw new Error("Failed to sync workspace telemetry");
      }
      const data: AppData = await response.json();
      setAppData(data);

      // Save to local storage as fallback/cache representation
      localStorage.setItem("deepwork_workspace_cache", JSON.stringify(data));
    } catch (err: any) {
      console.warn("Express backend connection failure, loading from local cache fallback...", err);
      // Fallback to local storage if server is waking up or temporarily unavailable
      const cached = localStorage.getItem("deepwork_workspace_cache");
      if (cached) {
        try {
          setAppData(JSON.parse(cached));
        } catch (parseErr) {
          setError("Incompatible workspace registry state. Please perform a full reset.");
        }
      } else {
        setError("Unable to initialize command center. Ensure your dev server is active on port 3000.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  // API Call: Add new task block
  const handleAddTask = async (title: string, duration: number, priority: string, notes: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, duration, priority, notes }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
    } catch (err) {
      console.error("Failed to deploy task block to backend", err);
      throw err;
    }
  };

  // API Call: Toggle task complete
  const handleToggleTaskComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
    } catch (err) {
      console.error("Failed to update task state on backend", err);
    }
  };

  // API Call: Delete task
  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
    } catch (err) {
      console.error("Failed to delete task block on backend", err);
    }
  };

  // API Call: Add routine anchor
  const handleAddRoutine = async (title: string, duration: string) => {
    try {
      const response = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, duration }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
    } catch (err) {
      console.error("Failed to add routine anchor", err);
    }
  };

  // API Call: Toggle routine status
  const handleToggleRoutineComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
    } catch (err) {
      console.error("Failed to toggle routine anchor", err);
    }
  };

  // API Call: Delete routine anchor
  const handleDeleteRoutine = async (id: string) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
    } catch (err) {
      console.error("Failed to delete routine anchor", err);
    }
  };

  // API Call: Submit Focus Signal Feedback
  const handleSubmitSignal = async (name: string, email: string, content: string, priorityCheckbox: boolean): Promise<boolean> => {
    try {
      const response = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, content, priorityCheckbox }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
      return true;
    } catch (err) {
      console.error("Failed to transmit focus signal feedback", err);
      return false;
    }
  };

  // API Call: Log Completed Focus Session
  const handleLogSession = async (taskId: string | undefined, taskTitle: string, durationMinutes: number) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, taskTitle, durationMinutes }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
    } catch (err) {
      console.error("Failed to lock focus session into registry", err);
    }
  };

  // API Call: Save preferences
  const handleSavePreferences = async (prefs: Partial<Preferences>) => {
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!response.ok) throw new Error();
      await loadWorkspaceData();
    } catch (err) {
      console.error("Failed to sync workspace configuration", err);
    }
  };

  // Clear all local storage immediately AND reset backend database data instantly!
  const handleResetAllData = async () => {
    try {
      setLoading(true);
      // 1. Clear all localStorage keys immediately
      localStorage.clear();

      // 2. Clear backend session database state to seed defaults
      const response = await fetch("/api/reset", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to clear backend state");
      
      // 3. Re-fetch clean template representations
      await loadWorkspaceData();

      // 4. Force default navigation reset
      setActiveTab("dashboard");

      // 5. Visual notification
      const toast = document.createElement("div");
      toast.className = "fixed bottom-5 right-5 bg-red-600 text-white font-bold font-geist px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 border border-red-500 animate-pulse";
      toast.innerHTML = `<span>🛑 LOCAL CACHE & BACKEND RESET SUCCESSFULLY</span>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    } catch (err) {
      console.error("Error resetting workspace registry:", err);
      setError("Failed to execute immediate reset command.");
    } finally {
      setLoading(false);
    }
  };

  // Transition to focus view when starting a block from dashboard
  const handleStartFocus = (task: TaskBlock) => {
    setSelectedTaskForFocus(task);
    setActiveTab("deep-work");
  };

  const handleSidebarAddClick = () => {
    setActiveTab("dashboard");
    setTimeout(() => {
      const element = document.getElementById("input-task-title");
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Render correct active tab view
  const renderActiveView = () => {
    if (!appData) return null;
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            tasks={appData.tasks}
            routines={appData.routines}
            onAddTask={handleAddTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDeleteTask={handleDeleteTask}
            onAddRoutine={handleAddRoutine}
            onToggleRoutineComplete={handleToggleRoutineComplete}
            onDeleteRoutine={handleDeleteRoutine}
            onSubmitSignal={handleSubmitSignal}
            onStartFocus={handleStartFocus}
          />
        );
      case "deep-work":
        return (
          <DeepWorkView
            tasks={appData.tasks}
            defaultTimerDuration={appData.preferences.timerDuration}
            onLogSession={handleLogSession}
            selectedTaskFromDashboard={selectedTaskForFocus}
            clearSelectedTask={() => setSelectedTaskForFocus(null)}
          />
        );
      case "routine":
        return (
          <RoutineView
            routines={appData.routines}
            onAddRoutine={handleAddRoutine}
            onToggleRoutineComplete={handleToggleRoutineComplete}
            onDeleteRoutine={handleDeleteRoutine}
          />
        );
      case "analytics":
        return (
          <AnalyticsView
            sessions={appData.sessions}
            dailyTargetHours={appData.preferences.dailyTargetHours}
          />
        );
      case "settings":
        return (
          <SettingsView
            preferences={appData.preferences}
            onSavePreferences={handleSavePreferences}
            onResetAllData={handleResetAllData}
          />
        );
      default:
        return (
          <div className="text-center py-12 text-text-secondary">
            Section is under active deployment.
          </div>
        );
    }
  };

  // Loading indicator matching command center aesthetic
  if (loading && !appData) {
    return (
      <div id="loading-state-wrapper" className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center space-y-4 font-mono select-none relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin z-10" />
        <span className="text-xs tracking-[0.2em] text-indigo-300 uppercase z-10 font-bold">Initializing DeepWork Board...</span>
      </div>
    );
  }

  // Error boundary representation
  if (error && !appData) {
    return (
      <div id="error-state-wrapper" className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center space-y-6 font-mono select-none relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <AlertCircle className="w-12 h-12 text-red-500 animate-pulse z-10" />
        <div className="space-y-2 max-w-md z-10">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">Workspace Link Interrupted</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        </div>
        <button
          id="btn-error-retry"
          onClick={loadWorkspaceData}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold font-geist text-xs tracking-wider transition-all cursor-pointer z-10"
        >
          RECONNECT TERMINAL
        </button>
      </div>
    );
  }

  const workspaceName = appData?.preferences.workspaceName || "Command Center";
  const tagline = appData?.preferences.tagline || "STAY DISCIPLINED.";

  return (
    <div id="application-container" className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden relative">
      
      {/* Frosted Glass Background Mesh Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Dynamic Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workspaceName={workspaceName}
        tagline={tagline}
        onAddClick={handleSidebarAddClick}
        onResetAll={handleResetAllData}
      />

      {/* Main Board Content Frame */}
      <div id="main-content-wrapper" className="flex-1 flex flex-col h-screen overflow-y-auto bg-transparent z-10">
        
        {/* Dynamic Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          workspaceName={workspaceName} 
        />

        {/* Content container viewport */}
        <main id="main-viewport-pane" className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer id="app-footer" className="border-t border-white/10 backdrop-blur-md bg-slate-950/40 py-6 px-8 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-400 font-mono tracking-wider space-y-3 md:space-y-0">
          <div>
            <span id="footer-version-tag" className="text-indigo-400 font-bold">DEEPWORK_SPACE_v2.4</span> | © 2026 DeepWork Space. Visionary Productivity.
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-indigo-400 transition-all">Privacy Policy</a>
            <a href="#terms" className="hover:text-indigo-400 transition-all">Terms of Service</a>
            <a href="#support" className="hover:text-indigo-400 transition-all">Contact Support</a>
          </div>
        </footer>

      </div>

    </div>
  );
}
