import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award, 
  ListTodo, 
  BookOpen, 
  History 
} from "lucide-react";
import { FocusSession } from "../types";

interface AnalyticsViewProps {
  sessions: FocusSession[];
  dailyTargetHours: number;
}

export default function AnalyticsView({ sessions, dailyTargetHours }: AnalyticsViewProps) {
  // Aggregate stats
  const totalFocusedMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalFocusedHours = (totalFocusedMinutes / 60).toFixed(1);
  const totalSessionsCount = sessions.length;

  const targetMinutes = dailyTargetHours * 60;
  // Calculate focused minutes today (simulated or matching today's timestamp)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayMinutes = sessions
    .filter((s) => new Date(s.timestamp) >= todayStart)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const targetProgressPercentage = Math.min(Math.round((todayMinutes / targetMinutes) * 100), 100);

  // Group sessions by day for the chart data (last 7 days)
  const last7DaysData = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // Sum minutes for this exact day
    const dayStart = new Date(d);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23,59,59,999);

    const dayMinutes = sessions
      .filter((s) => {
        const ts = new Date(s.timestamp);
        return ts >= dayStart && ts <= dayEnd;
      })
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      name: dateStr,
      minutes: dayMinutes,
    };
  }).reverse(); // Sort old to new

  // Customize tooltip styles
  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      color: "#FFFFFF",
    },
    itemStyle: {
      color: "#818cf8",
    },
    labelStyle: {
      color: "#94a3b8",
    }
  };

  return (
    <div id="analytics-view-root" className="space-y-8 px-4 max-w-[1200px] mx-auto pb-16">
      
      {/* Analytics Scorecards Grid */}
      <div id="analytics-scorecards" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Cumulative focused hours card */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-[#8892B0]">
            <span className="text-[10px] font-mono tracking-widest uppercase">CUMULATIVE FOCUS</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 id="stat-total-hours" className="font-geist text-3xl font-bold text-white">{totalFocusedHours}h</h3>
            <p className="text-[10px] text-slate-400 mt-1">{totalFocusedMinutes} focus minutes logged</p>
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-[#8892B0]">
            <span className="text-[10px] font-mono tracking-widest uppercase">SESSIONS COMPLETED</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 id="stat-total-sessions" className="font-geist text-3xl font-bold text-white">{totalSessionsCount}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Deep work cycles locked</p>
          </div>
        </div>

        {/* Today's alignment */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-[#8892B0]">
            <span className="text-[10px] font-mono tracking-widest uppercase">TODAY'S WORK</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 id="stat-today-minutes" className="font-geist text-3xl font-bold text-white">{todayMinutes}m</h3>
            <p className="text-[10px] text-slate-400 mt-1">Goal: {targetMinutes}m ({dailyTargetHours}h)</p>
          </div>
        </div>

        {/* Target Progress */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-[#8892B0]">
            <span className="text-[10px] font-mono tracking-widest uppercase">GOAL PROGRESS</span>
            <span className="font-mono text-xs text-indigo-400 font-bold">{targetProgressPercentage}%</span>
          </div>
          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-white/5 rounded-full h-2">
              <div 
                className="bg-indigo-400 h-2 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]" 
                style={{ width: `${targetProgressPercentage}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 text-right">Daily Limit Target</p>
          </div>
        </div>

      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Chart Card (7 columns) */}
        <div className="lg:col-span-8 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 id="chart-title" className="font-geist text-lg font-bold text-white">Focus Duration Trends</h3>
              <p id="chart-desc" className="text-xs text-slate-400">Time spent in deep focus blocks across the last 7 days.</p>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 rounded-full font-bold">
              WEEKLY MONITOR
            </span>
          </div>

          {/* Interactive Chart Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Area type="monotone" dataKey="minutes" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMinutes)" name="Focused Minutes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Distribution breakdown (4 columns) */}
        <div className="lg:col-span-4 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <h3 className="font-geist text-lg font-bold text-white">Routine Distribution</h3>
            <p className="text-xs text-slate-400">Distribution of cycles completed across deep work blocks.</p>
            
            <div className="space-y-4 pt-2">
              {[
                { label: "Algorithms & Logic", count: sessions.filter(s => s.taskTitle.toLowerCase().includes("algorithm") || s.taskTitle.toLowerCase().includes("logic")).length, color: "bg-indigo-400" },
                { label: "Research & Writing", count: sessions.filter(s => s.taskTitle.toLowerCase().includes("thesis") || s.taskTitle.toLowerCase().includes("read") || s.taskTitle.toLowerCase().includes("research")).length, color: "bg-emerald-400" },
                { label: "Architecture & Code", count: sessions.filter(s => s.taskTitle.toLowerCase().includes("sync") || s.taskTitle.toLowerCase().includes("backend") || s.taskTitle.toLowerCase().includes("database")).length, color: "bg-purple-400" },
              ].map((cat, idx) => {
                const total = sessions.length || 1;
                const percent = Math.round((cat.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200 font-medium">{cat.label}</span>
                      <span className="text-slate-400 font-mono">{cat.count} blocks ({percent}%)</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className={`${cat.color} h-1.5 rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold">COMMAND STATS RECORD</p>
          </div>
        </div>

      </div>

      {/* Completed Sessions Logs Table */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 id="session-logs-title" className="font-geist text-lg font-bold text-white">Focus Session Logs</h3>
        </div>

        <div id="logs-container" className="overflow-x-auto font-sans">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                <th className="py-3 px-4">Cycle ID</th>
                <th className="py-3 px-4">Task Block Name</th>
                <th className="py-3 px-4">Duration Locked</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, idx) => {
                const sessionDate = new Date(session.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <tr key={session.id} id={`session-log-row-${session.id}`} className="border-b border-white/5 text-xs text-slate-200 hover:bg-white/5 transition-all">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      #{String(sessions.length - idx).padStart(3, "0")}
                    </td>
                    <td className="py-3 px-4 font-geist font-bold text-white">
                      {session.taskTitle}
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-300 font-semibold">
                      {session.durationMinutes} mins
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {sessionDate}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-mono font-bold tracking-wider text-[10px]">
                      ⚡ SECURE_SYNCED
                    </td>
                  </tr>
                );
              })}

              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No focus sessions logged yet. Activate a block to trigger cycles!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
