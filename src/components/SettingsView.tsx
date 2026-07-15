import React, { useState } from "react";
import { 
  Settings, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Save, 
  HelpCircle,
  Volume2,
  Sliders,
  User,
  Activity,
  AlertCircle
} from "lucide-react";
import { Preferences } from "../types";

interface SettingsViewProps {
  preferences: Preferences;
  onSavePreferences: (prefs: Partial<Preferences>) => Promise<void>;
  onResetAllData: () => void;
}

export default function SettingsView({
  preferences,
  onSavePreferences,
  onResetAllData,
}: SettingsViewProps) {
  // Form states
  const [workspaceName, setWorkspaceName] = useState(preferences.workspaceName);
  const [tagline, setTagline] = useState(preferences.tagline);
  const [dailyTargetHours, setDailyTargetHours] = useState(preferences.dailyTargetHours);
  const [timerDuration, setTimerDuration] = useState(preferences.timerDuration);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSavePreferences({
        workspaceName,
        tagline,
        dailyTargetHours: Number(dailyTargetHours),
        timerDuration: Number(timerDuration),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save preferences", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="settings-view-root" className="space-y-8 px-4 max-w-[800px] mx-auto pb-16">
      
      {/* 1. Preferences Configuration Panel */}
      <div id="preferences-card" className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 id="settings-card-title" className="font-geist text-lg font-bold text-white">Workspace Configuration</h3>
            <p id="settings-card-desc" className="text-xs text-slate-400">Customize your environment and goal targets.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} id="preferences-form" className="space-y-6">
          {saveSuccess && (
            <div id="preferences-success-msg" className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Workspace preferences synced and applied successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workspace Name */}
            <div className="space-y-1">
              <label id="label-settings-workspace-name" className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                Workspace Identity / Name
              </label>
              <input
                id="input-settings-workspace-name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder-slate-500"
                required
              />
            </div>

            {/* Tagline */}
            <div className="space-y-1">
              <label id="label-settings-tagline" className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                Workspace Tagline / Motto
              </label>
              <input
                id="input-settings-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                required
              />
            </div>

            {/* Daily Target Hours */}
            <div className="space-y-1">
              <label id="label-settings-daily-target" className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                Daily Focus Target (Hours)
              </label>
              <input
                id="input-settings-daily-target"
                type="number"
                min="1"
                max="24"
                value={dailyTargetHours}
                onChange={(e) => setDailyTargetHours(Number(e.target.value))}
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                required
              />
            </div>

            {/* Default Timer Duration */}
            <div className="space-y-1">
              <label id="label-settings-timer-duration" className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                Default Cycle Duration (Minutes)
              </label>
              <input
                id="input-settings-timer-duration"
                type="number"
                min="5"
                max="180"
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                required
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Workspace Profile Status: Admin</span>
            </div>
            <button
              id="btn-settings-save"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl font-geist font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "SAVING..." : "SAVE CONFIGURATION"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Destruction / Reset Workspace Panel */}
      <div id="destruction-card" className="backdrop-blur-md bg-white/5 border border-red-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <div>
            <h3 id="danger-card-title" className="font-geist text-lg font-bold text-white">Danger Zone</h3>
            <p id="danger-card-desc" className="text-xs text-slate-400">Wipe database memory state and clear configuration cache.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p id="danger-card-text" className="text-xs text-slate-400 leading-relaxed">
            The reset button below will immediately format your workspace. It will clear all browser cache storage (`localStorage`) immediately, wipe all logged focus sessions, submitted signals feedback, customized priorities list, and routines registry from the Express backend, and restore default templates. This action is irreversible.
          </p>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-red-300 leading-normal">
              <span className="font-bold uppercase block">Confirm Impact:</span>
              <ul className="list-disc list-inside space-y-1">
                <li>All customized focus blocks will be replaced with defaults</li>
                <li>All habit routine logs will be reformatted</li>
                <li>Focus telemetry logs and analytics data will be purged</li>
                <li>All local storage data will be cleared immediately</li>
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-dangerous-reset-all"
              onClick={() => {
                if (window.confirm("ARE YOU ABSOLUTELY SURE? This will wipe all database content and local storage immediately.")) {
                  onResetAllData();
                }
              }}
              className="py-3 px-6 bg-red-500/10 hover:bg-red-600/85 border border-red-500/25 text-red-300 hover:text-white rounded-xl font-geist font-bold text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/5 hover:shadow-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              RESET WORKSPACE DATA IMMEDIATELY
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
