import React, { useState } from "react";
import { 
  ArrowRight, 
  Check, 
  Trash2, 
  Sparkles, 
  Send, 
  HelpCircle,
  FileText,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TaskBlock, RoutineAnchor } from "../types";

interface DashboardViewProps {
  tasks: TaskBlock[];
  routines: RoutineAnchor[];
  onAddTask: (title: string, duration: number, priority: string, notes: string) => Promise<void>;
  onToggleTaskComplete: (id: string, completed: boolean) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onAddRoutine: (title: string, duration: string) => Promise<void>;
  onToggleRoutineComplete: (id: string, completed: boolean) => Promise<void>;
  onDeleteRoutine: (id: string) => Promise<void>;
  onSubmitSignal: (name: string, email: string, content: string, priorityCheckbox: boolean) => Promise<boolean>;
  onStartFocus: (task: TaskBlock) => void;
}

export default function DashboardView({
  tasks,
  routines,
  onAddTask,
  onToggleTaskComplete,
  onDeleteTask,
  onAddRoutine,
  onToggleRoutineComplete,
  onDeleteRoutine,
  onSubmitSignal,
  onStartFocus,
}: DashboardViewProps) {
  // Forge New Task Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDuration, setTaskDuration] = useState("30");
  const [taskPriority, setTaskPriority] = useState("Focus Block");
  const [taskNotes, setTaskNotes] = useState("");
  const [isDeployingTask, setIsDeployingTask] = useState(false);
  const [taskFormError, setTaskFormError] = useState("");

  // Focus Signals Feedback form state
  const [signalName, setSignalName] = useState("");
  const [signalEmail, setSignalEmail] = useState("");
  const [signalContent, setSignalContent] = useState("");
  const [signalPriority, setSignalPriority] = useState(false);
  const [isTransmittingSignal, setIsTransmittingSignal] = useState(false);
  const [signalSuccess, setSignalSuccess] = useState(false);
  const [signalError, setSignalError] = useState("");

  // Handle deploying task block
  const handleDeployTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setTaskFormError("Task Title is required");
      return;
    }
    setTaskFormError("");
    setIsDeployingTask(true);
    try {
      await onAddTask(
        taskTitle,
        Number(taskDuration),
        taskPriority,
        taskNotes
      );
      // Reset form
      setTaskTitle("");
      setTaskDuration("30");
      setTaskPriority("Focus Block");
      setTaskNotes("");
      
      // Visual notification
      const successToast = document.createElement("div");
      successToast.className = "fixed bottom-5 right-5 bg-energy-blue text-[#020C1B] font-bold font-geist px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2";
      successToast.innerHTML = `<span>⚡ TASK BLOCK DEPLOYED</span>`;
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 3000);
    } catch (err) {
      setTaskFormError("Failed to deploy task block");
    } finally {
      setIsDeployingTask(false);
    }
  };

  // Handle transmitting Focus Signal
  const handleTransmitSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signalName.trim() || !signalEmail.trim() || !signalContent.trim()) {
      setSignalError("Please fill in all signal fields");
      return;
    }
    setSignalError("");
    setIsTransmittingSignal(true);
    try {
      const success = await onSubmitSignal(
        signalName,
        signalEmail,
        signalContent,
        signalPriority
      );
      if (success) {
        setSignalSuccess(true);
        setSignalName("");
        setSignalEmail("");
        setSignalContent("");
        setSignalPriority(false);
        setTimeout(() => setSignalSuccess(false), 5000);
      }
    } catch (err) {
      setSignalError("Failed to transmit signal");
    } finally {
      setIsTransmittingSignal(false);
    }
  };

  const activeBlocksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div id="dashboard-view-root" className="space-y-12 pb-16">
      
      {/* 1. Hero Quote Headline Section */}
      <section id="hero-quote-section" className="text-center pt-8 pb-4 flex flex-col items-center max-w-4xl mx-auto px-4">
        <motion.h2 
          id="hero-quote-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-geist text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
        >
          "When the world shoves you around, you've just gotta stand up and <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 animate-pulse font-black">shove back.</span>"
        </motion.h2>
        
        <motion.div 
          id="hero-subtext"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-2 mt-6"
        >
          <span className="h-[1px] w-6 bg-white/10" />
          <p className="font-mono text-xs text-slate-400 tracking-[0.25em] uppercase font-semibold">
            Disciplined • Intentional • Visionary
          </p>
          <span className="h-[1px] w-6 bg-white/10" />
        </motion.div>
      </section>

      {/* 2. Deep Focus Board Section */}
      <section id="deep-focus-board-section" className="space-y-4 px-4 max-w-[1200px] mx-auto">
        <div id="focus-board-header" className="flex items-center justify-between">
          <div>
            <p id="label-priorities" className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 uppercase font-bold">
              01. PRIORITIES
            </p>
            <h3 id="title-deep-focus-board" className="font-geist text-xl md:text-2xl font-bold text-white mt-1">
              Deep Focus Board
            </h3>
          </div>

          <div id="active-blocks-pill" className="bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-semibold tracking-wider text-indigo-300">
              {activeBlocksCount} Active Blocks
            </span>
          </div>
        </div>

        {/* Task Cards Container (horizontal scroll on desktop, vertical/flex wrap grid on larger screens) */}
        <div id="focus-board-cards-container" className="flex flex-nowrap md:grid md:grid-cols-5 gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-4 md:mx-0 select-none scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, idx) => {
              const isAccentHigh = task.priority === "Focus Block";
              return (
                <motion.div
                  key={task.id}
                  id={`task-card-wrapper-${task.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`flex-shrink-0 w-[240px] md:w-auto rounded-2xl glass-container p-4 flex flex-col justify-between h-[180px] relative transition-all group overflow-hidden ${
                    task.completed 
                      ? "opacity-40 border-white/5" 
                      : "hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10"
                  }`}
                >
                  {/* Left accent color bar */}
                  <div 
                    id={`task-accent-bar-${task.id}`}
                    className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                      task.completed 
                        ? "bg-slate-600" 
                        : isAccentHigh 
                          ? "bg-indigo-500" 
                          : "bg-emerald-400"
                    }`} 
                  />

                  {/* Card content top */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span id={`task-card-number-${task.id}`} className="text-[10px] font-mono text-slate-400 tracking-wider">
                        {task.blockNumber}
                      </span>
                      
                      {/* Close or Delete action on hover */}
                      <button
                        id={`btn-delete-task-${task.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 text-red-400 rounded transition-all cursor-pointer"
                        title="Delete block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 
                      id={`task-card-title-${task.id}`}
                      className={`font-geist font-bold text-[15px] leading-snug text-white tracking-wide truncate ${
                        task.completed ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {task.title}
                    </h4>

                    <p 
                      id={`task-card-notes-${task.id}`}
                      className="text-[11px] text-slate-400 leading-normal line-clamp-3 font-sans"
                    >
                      {task.notes || "No constraints specified."}
                    </p>
                  </div>

                  {/* Card footer bottom */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                    <span 
                      id={`task-card-duration-${task.id}`}
                      className="text-[10px] font-mono font-bold tracking-widest text-indigo-400"
                    >
                      {task.duration} MIN
                    </span>

                    {task.completed ? (
                      <div className="p-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <button
                        id={`btn-start-focus-${task.id}`}
                        onClick={() => onStartFocus(task)}
                        className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-400 hover:bg-indigo-500 text-indigo-400 hover:text-white transition-all cursor-pointer"
                        title="Launch Focus Session"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
            
            {tasks.length === 0 && (
              <div id="empty-tasks-placeholder" className="col-span-5 py-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/2">
                <p className="text-slate-400 text-sm">No active focus blocks. Create one below to begin!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. Daily Anchors & Forge New Task side-by-side Bento Section */}
      <section id="routine-and-forge-bento" className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 max-w-[1200px] mx-auto">
        
        {/* Left Column (Routine Anchors) - 7 cols */}
        <div id="routine-anchors-card-container" className="lg:col-span-7 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 id="title-daily-routine-anchors" className="font-geist text-lg md:text-xl font-bold text-white">
                  Daily Routine Anchors
                </h3>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 font-bold">
                Habit Board
              </span>
            </div>

            {/* List of routine items with customized checkboxes */}
            <div id="routine-anchors-list" className="space-y-3">
              <AnimatePresence mode="popLayout">
                {routines.map((routine, idx) => (
                  <motion.div
                    key={routine.id}
                    id={`routine-row-${routine.id}`}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border border-white/5 transition-all ${
                      routine.completed 
                        ? "bg-white/2 opacity-60 border-white/5" 
                        : "bg-white/5 hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <span id={`routine-row-number-${routine.id}`} className="text-xs font-mono text-slate-400 w-6 text-center">
                        {routine.blockNumber}
                      </span>
                      <h4 
                        id={`routine-row-title-${routine.id}`}
                        className={`text-sm font-geist text-white truncate ${
                          routine.completed ? "line-through text-slate-500" : ""
                        }`}
                      >
                        {routine.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <span 
                        id={`routine-row-duration-${routine.id}`}
                        className="text-[10px] font-mono tracking-widest text-slate-400"
                      >
                        {routine.duration}
                      </span>

                      {/* Custom styled checkbox indicator */}
                      <button
                        id={`btn-toggle-routine-${routine.id}`}
                        onClick={() => onToggleRoutineComplete(routine.id, !routine.completed)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                          routine.completed 
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                            : "border-slate-500 hover:border-emerald-400"
                        }`}
                      >
                        {routine.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Delete action */}
                      <button
                        id={`btn-delete-routine-${routine.id}`}
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="p-1 hover:bg-white/10 text-red-400 rounded hover:text-red-300 transition-all cursor-pointer"
                        title="Delete routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {routines.length === 0 && (
                <div id="empty-routines-placeholder" className="py-8 text-center text-slate-400 text-xs">
                  No routine anchors created. Use the Routine panel to establish anchors!
                </div>
              )}
            </div>
          </div>

          {/* Quick routine add form directly on bottom of card */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const title = f.get("title") as string;
              const duration = f.get("duration") as string;
              if (title) {
                onAddRoutine(title, duration || "30M");
                e.currentTarget.reset();
              }
            }}
            id="quick-routine-add-form"
            className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10"
          >
            <input
              name="title"
              id="input-quick-routine-title"
              type="text"
              placeholder="Add daily anchor..."
              className="flex-1 bg-white/3 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
              required
            />
            <input
              name="duration"
              id="input-quick-routine-duration"
              type="text"
              placeholder="15M"
              defaultValue="15M"
              className="w-20 bg-white/3 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 text-center placeholder-slate-500"
            />
            <button
              id="btn-submit-quick-routine"
              type="submit"
              className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ADD
            </button>
          </form>
        </div>

        {/* Right Column (Forge New Task) - 5 cols */}
        <div id="forge-new-task-card-container" className="lg:col-span-5 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <h3 id="title-forge-new-task" className="font-geist text-lg md:text-xl font-bold text-white">
                Forge New Task
              </h3>
              <p id="desc-forge-new-task" className="text-xs text-slate-400 mt-1">
                Translate intention into execution blocks.
              </p>
            </div>

            <form onSubmit={handleDeployTask} id="forge-new-task-form" className="space-y-4">
              {taskFormError && (
                <div id="forge-task-error-msg" className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{taskFormError}</span>
                </div>
              )}

              {/* Task Title */}
              <div className="space-y-1">
                <label id="label-task-title" className="text-[10px] font-mono tracking-wider text-indigo-300 uppercase font-bold">
                  Task Title
                </label>
                <input
                  id="input-task-title"
                  type="text"
                  placeholder="e.g. Distributed Systems Lab"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder-slate-500"
                  required
                />
              </div>

              {/* Duration & Priority Side-by-Side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label id="label-task-duration" className="text-[10px] font-mono tracking-wider text-indigo-300 uppercase font-bold">
                    Duration
                  </label>
                  <select
                    id="select-task-duration"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  >
                    <option value="15" className="bg-slate-900">15 mins</option>
                    <option value="30" className="bg-slate-900">30 mins</option>
                    <option value="45" className="bg-slate-900">45 mins</option>
                    <option value="60" className="bg-slate-900">60 mins</option>
                    <option value="90" className="bg-slate-900">90 mins</option>
                    <option value="120" className="bg-slate-900">120 mins</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label id="label-task-priority" className="text-[10px] font-mono tracking-wider text-indigo-300 uppercase font-bold">
                    Priority
                  </label>
                  <select
                    id="select-task-priority"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  >
                    <option value="Focus Block" className="bg-slate-900">Focus Block</option>
                    <option value="Routine Task" className="bg-slate-900">Routine Task</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label id="label-task-notes" className="text-[10px] font-mono tracking-wider text-indigo-300 uppercase font-bold">
                  Notes / Constraints
                </label>
                <textarea
                  id="textarea-task-notes"
                  rows={3}
                  placeholder="Specify constraints..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder-slate-500 resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                id="btn-deploy-task-submit"
                type="submit"
                disabled={isDeployingTask}
                className="w-full py-3 bg-gradient-to-br from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl font-geist font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeployingTask ? "DEPLOYING..." : "DEPLOY TASK BLOCK"}
              </button>
            </form>
          </div>
        </div>

      </section>

      {/* 4. Focus Signals Radar Section */}
      <section id="focus-signals-section" className="pt-12 border-t border-white/10 px-4 max-w-[800px] mx-auto flex flex-col items-center space-y-8">
        
        {/* Signal Radar Beacon Header */}
        <div id="radar-icon-container" className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <span className="absolute inset-0 rounded-full border border-indigo-500/40 animate-ping opacity-60" />
            <Sparkles className="w-5 h-5 animate-spin-slow text-indigo-400" />
          </div>
          <h3 id="title-focus-signals" className="font-geist text-xl font-bold text-white">
            Focus Signals
          </h3>
          <p id="desc-focus-signals" className="text-xs text-slate-400 max-w-md">
            Have feedback or a request for the workspace? Send a priority signal below.
          </p>
        </div>

        {/* Signals Form */}
        <div id="signals-form-card" className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleTransmitSignal} id="focus-signals-form" className="space-y-4">
            
            {signalSuccess && (
              <motion.div
                id="signal-success-alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-950/20 border border-green-500/30 rounded-xl text-green-300 text-xs flex items-center gap-2"
              >
                <Check className="w-4 h-4 shrink-0 text-green-400" />
                <span>SIGNAL TRANSMITTED successfully! Our command center has received your coordinates.</span>
              </motion.div>
            )}

            {signalError && (
              <div id="signal-error-alert" className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signalError}</span>
              </div>
            )}

            {/* Identification & Channel inputs side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label id="label-signal-identification" className="text-[10px] font-mono tracking-wider text-indigo-300 uppercase font-bold">
                  Identification
                </label>
                <input
                  id="input-signal-name"
                  type="text"
                  placeholder="Your Name"
                  value={signalName}
                  onChange={(e) => setSignalName(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder-slate-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label id="label-signal-channel" className="text-[10px] font-mono tracking-wider text-indigo-300 uppercase font-bold">
                  Comms Channel
                </label>
                <input
                  id="input-signal-email"
                  type="email"
                  placeholder="email@address.com"
                  value={signalEmail}
                  onChange={(e) => setSignalEmail(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder-slate-500"
                  required
                />
              </div>
            </div>

            {/* Signal Content */}
            <div className="space-y-1">
              <label id="label-signal-content" className="text-[10px] font-mono tracking-wider text-indigo-300 uppercase font-bold">
                Signal Content
              </label>
              <textarea
                id="textarea-signal-content"
                rows={4}
                placeholder="Detail your observation..."
                value={signalContent}
                onChange={(e) => setSignalContent(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder-slate-500 resize-none"
                required
              />
            </div>

            {/* Micro-checkbox info label */}
            <div className="flex items-start gap-3 pt-2">
              <button
                type="button"
                id="btn-toggle-signal-priority"
                onClick={() => setSignalPriority(!signalPriority)}
                className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                  signalPriority 
                    ? "bg-indigo-500/20 border-indigo-400 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.3)]" 
                    : "border-slate-500 hover:border-indigo-400"
                }`}
              >
                {signalPriority && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <span id="signal-checkbox-info" className="text-[11px] text-slate-400 select-none leading-normal">
                I understand this signal will be prioritized based on system availability.
              </span>
            </div>

            {/* Submit Transmitter */}
            <div className="pt-2">
              <button
                id="btn-transmit-signal-submit"
                type="submit"
                disabled={isTransmittingSignal}
                className="px-6 py-2.5 bg-white/5 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 border border-white/10 hover:border-transparent text-indigo-300 hover:text-white rounded-xl font-geist font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isTransmittingSignal ? "TRANSMITTING..." : "TRANSMIT SIGNAL"}
              </button>
            </div>

          </form>
        </div>
      </section>

    </div>
  );
}
