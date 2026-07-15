import React, { useState } from "react";
import { 
  Check, 
  Trash2, 
  Clock, 
  Sparkles, 
  Flame, 
  CheckSquare, 
  Square,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RoutineAnchor } from "../types";

interface RoutineViewProps {
  routines: RoutineAnchor[];
  onAddRoutine: (title: string, duration: string) => Promise<void>;
  onToggleRoutineComplete: (id: string, completed: boolean) => Promise<void>;
  onDeleteRoutine: (id: string) => Promise<void>;
}

export default function RoutineView({
  routines,
  onAddRoutine,
  onToggleRoutineComplete,
  onDeleteRoutine,
}: RoutineViewProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("15M");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const completedCount = routines.filter((r) => r.completed).length;
  const totalCount = routines.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Streak simulation or memory calculation
  const routineStreak = totalCount > 0 && completionPercentage === 100 ? 5 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onAddRoutine(newTitle, newDuration);
      setNewTitle("");
      setNewDuration("15M");
    } catch (err) {
      setError("Failed to create routine anchor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="routine-view-root" className="space-y-8 px-4 max-w-[1200px] mx-auto pb-16">
      
      {/* View Header with stats */}
      <div id="routine-view-header" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div>
            <span id="routine-board-tag" className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">02. SYNCED ANCHORS</span>
            <h2 id="routine-board-title" className="font-geist text-2xl font-bold text-white mt-1">Daily Routine Anchors</h2>
            <p id="routine-board-desc" className="text-xs text-slate-400 mt-1">
              Routines are stable anchors that ground your focus. Differentiate habit maintenance from intense focus blocks.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">Achieved</span>
              <span id="routine-achieved-val" className="font-mono text-xl font-bold text-emerald-400">{completedCount}/{totalCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">Percentage</span>
              <span id="routine-percent-val" className="font-mono text-xl font-bold text-emerald-400">{completionPercentage}%</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">Current Streak</span>
              <span id="routine-streak-val" className="font-mono text-xl font-bold text-emerald-400 flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400 fill-current" />
                {routineStreak} Days
              </span>
            </div>
          </div>
        </div>

        {/* Routine Anchor Progress Gauge */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-xl">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-3 font-bold">Today's Alignment</span>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-white/5 fill-none"
                strokeWidth="6"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-emerald-400 fill-none"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 46}
                initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 46 - (completionPercentage / 100) * 2 * Math.PI * 46 }}
                transition={{ duration: 0.8 }}
                strokeLinecap="round"
              />
            </svg>
            <span id="routine-progress-percent" className="absolute font-mono text-lg font-bold text-white">
              {completionPercentage}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">
            {completionPercentage === 100 ? "Perfect Routine Alignment!" : "Stabilize remaining anchors."}
          </p>
        </div>
      </div>

      {/* Routine Core Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form to establish new routine (5 columns) */}
        <div className="lg:col-span-5 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl h-fit shadow-xl">
          <div className="space-y-4">
            <div>
              <h3 id="routine-form-title" className="font-geist text-lg font-bold text-white">Establish Daily Anchor</h3>
              <p id="routine-form-desc" className="text-xs text-slate-400">Commit to structured habit building.</p>
            </div>

            <form onSubmit={handleSubmit} id="routine-anchor-creation-form" className="space-y-4">
              {error && (
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-bold">Anchor Name</label>
                <input
                  id="routine-input-title"
                  type="text"
                  placeholder="e.g. Physical Prime Training"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-bold">Duration Anchor</label>
                <select
                  id="routine-select-duration"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="10M" className="bg-slate-900">10 mins (10M)</option>
                  <option value="15M" className="bg-slate-900">15 mins (15M)</option>
                  <option value="30M" className="bg-slate-900">30 mins (30M)</option>
                  <option value="45M" className="bg-slate-900">45 mins (45M)</option>
                  <option value="60M" className="bg-slate-900">60 mins (60M)</option>
                  <option value="90M" className="bg-slate-900">90 mins (90M)</option>
                  <option value="ALL DAY" className="bg-slate-900">All Day Anchor (ALL DAY)</option>
                </select>
              </div>

              <button
                id="btn-routine-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl font-geist font-bold text-sm tracking-wide hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? "ESTABLISHING..." : "ESTABLISH HABIT ANCHOR"}
              </button>
            </form>
          </div>
        </div>

        {/* Complete interactive manager (7 columns) */}
        <div className="lg:col-span-7 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
          <div className="space-y-4">
            <h3 id="routine-list-title" className="font-geist text-lg font-bold text-white">Active Habit Anchor Registry</h3>
            
            <div id="routine-registry-list" className="space-y-3">
              <AnimatePresence mode="popLayout">
                {routines.map((routine) => (
                  <motion.div
                    key={routine.id}
                    id={`routine-manager-row-${routine.id}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      routine.completed 
                        ? "bg-white/2 border-white/5 opacity-60" 
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-3">
                      {/* Interactive toggle block */}
                      <button
                        id={`btn-toggle-routine-manager-${routine.id}`}
                        onClick={() => onToggleRoutineComplete(routine.id, !routine.completed)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                          routine.completed 
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                            : "border-slate-500 hover:border-emerald-400"
                        }`}
                      >
                        {routine.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <h4 
                          id={`routine-manager-title-${routine.id}`}
                          className={`text-sm font-geist font-bold text-white truncate ${
                            routine.completed ? "line-through text-slate-500" : ""
                          }`}
                        >
                          {routine.title}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase font-semibold">
                          Anchor ID: {routine.blockNumber} • ACTIVE SCHEDULE
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1">
                        {routine.duration}
                      </span>

                      <button
                        id={`btn-delete-routine-manager-${routine.id}`}
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="p-2 hover:bg-white/10 text-red-400 hover:text-red-300 rounded transition-all cursor-pointer"
                        title="Delete anchor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {routines.length === 0 && (
                <div id="routine-manager-empty-placeholder" className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-slate-400 text-sm bg-white/2">
                  No routine anchors created. Use the form on the left to establish your first habit block!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
