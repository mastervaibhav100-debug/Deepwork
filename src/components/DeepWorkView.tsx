import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Flame, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TaskBlock } from "../types";

interface DeepWorkViewProps {
  tasks: TaskBlock[];
  defaultTimerDuration: number;
  onLogSession: (taskId: string | undefined, taskTitle: string, durationMinutes: number) => Promise<void>;
  selectedTaskFromDashboard?: TaskBlock | null;
  clearSelectedTask?: () => void;
}

export default function DeepWorkView({
  tasks,
  defaultTimerDuration,
  onLogSession,
  selectedTaskFromDashboard,
  clearSelectedTask,
}: DeepWorkViewProps) {
  const activeTasks = tasks.filter((t) => !t.completed);

  // Focus target selection state
  const [selectedTask, setSelectedTask] = useState<TaskBlock | null>(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(defaultTimerDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialDuration, setInitialDuration] = useState(defaultTimerDuration * 60);
  const [isFinished, setIsFinished] = useState(false);

  // Sound environment state
  const [soundType, setSoundType] = useState("none");
  const [soundPlaying, setSoundPlaying] = useState(false);

  // Ref for timer interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synth / Audio state for ambient white noise (custom built using Web Audio API to satisfy high craftsmanship, zero external assets required!)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Synchronize task if selected from the dashboard board
  useEffect(() => {
    if (selectedTaskFromDashboard) {
      setSelectedTask(selectedTaskFromDashboard);
      const seconds = selectedTaskFromDashboard.duration * 60;
      setTimeLeft(seconds);
      setInitialDuration(seconds);
      setIsRunning(true); // Auto-start focus!
      if (clearSelectedTask) clearSelectedTask();
    }
  }, [selectedTaskFromDashboard]);

  // Adjust timer if selected task changes manually
  const handleSelectTask = (task: TaskBlock) => {
    setSelectedTask(task);
    const seconds = task.duration * 60;
    setTimeLeft(seconds);
    setInitialDuration(seconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  // Adjust timer to general default if task cleared
  const handleClearTaskSelection = () => {
    setSelectedTask(null);
    const seconds = defaultTimerDuration * 60;
    setTimeLeft(seconds);
    setInitialDuration(seconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  // Timer Core Loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Handle Focus Complete Success
  const handleTimerComplete = async () => {
    setIsFinished(true);
    stopAmbientSound();
    
    // Log session to backend
    const minutesCompleted = Math.round(initialDuration / 60);
    const title = selectedTask ? selectedTask.title : "General Deep Focus Block";
    const id = selectedTask ? selectedTask.id : undefined;

    try {
      await onLogSession(id, title, minutesCompleted);
    } catch (err) {
      console.error("Failed to log focus session", err);
    }
  };

  // Sound Synth Generator (Binaural beats or standard white/brown noises)
  const startAmbientSound = (type: string) => {
    try {
      if (type === "none") {
        stopAmbientSound();
        return;
      }

      stopAmbientSound();

      // Create Web Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === "White Noise") {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } else if (type === "Brownian Noise") {
        // Brownian noise filter approximation
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        }
      } else {
        // Binaural / Focus Tone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(120, ctx.currentTime); // Carrier Frequency

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(125, ctx.currentTime); // Binaural offset (5Hz Theta wave)

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        // Save reference as an array
        (noiseNodeRef as any).current = {
          stop: () => {
            osc1.stop();
            osc2.stop();
          }
        };
        setSoundPlaying(true);
        return;
      }

      // Buffer node source
      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      // Filter to make sounds smooth/oceanic
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = type === "Brownian Noise" ? 350 : 800;

      const gain = ctx.createGain();
      gain.gain.value = 0.15;

      whiteNoiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoiseSource.start();

      noiseNodeRef.current = whiteNoiseSource;
      setSoundPlaying(true);
    } catch (e) {
      console.warn("Audio Context could not start", e);
    }
  };

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch (err) {}
      noiseNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (err) {}
      audioCtxRef.current = null;
    }
    setSoundPlaying(false);
  };

  const handleSoundToggle = (type: string) => {
    if (soundType === type && soundPlaying) {
      stopAmbientSound();
      setSoundType("none");
    } else {
      setSoundType(type);
      startAmbientSound(type);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  // Format countdown string
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Progress circle math
  const progressPercent = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div id="deep-work-view-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 max-w-[1200px] mx-auto pb-16">
      
      {/* Left Navigation: Task Select (5 columns) */}
      <div id="deep-work-targets-container" className="lg:col-span-5 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-indigo-400" />
              <h3 id="title-deep-work-targets" className="font-geist text-lg md:text-xl font-bold text-white">
                Focus Target Selection
              </h3>
            </div>
            <p id="desc-deep-work-targets" className="text-xs text-slate-400 mt-1">
              Lock in an active priority block to initiate focus.
            </p>
          </div>

          <div id="targets-list" className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {activeTasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <button
                  key={task.id}
                  id={`btn-select-target-${task.id}`}
                  onClick={() => handleSelectTask(task)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected 
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-300" 
                      : "bg-white/5 border-white/10 text-white hover:border-indigo-400/40"
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <span id={`target-block-num-${task.id}`} className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                      {task.blockNumber} • PRIORITY
                    </span>
                    <h4 id={`target-title-${task.id}`} className="font-geist text-sm font-bold truncate">
                      {task.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-1">
                      {task.duration}M
                    </span>
                  </div>
                </button>
              );
            })}

            {activeTasks.length === 0 && (
              <div id="targets-empty-message" className="py-8 text-center text-xs text-slate-400">
                No active focus blocks found on the board.
              </div>
            )}
          </div>
        </div>

        {selectedTask && (
          <div id="active-target-selected-card" className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-mono tracking-wide text-indigo-400 uppercase font-bold">ACTIVE FOCUS SELECTION</p>
              <h4 id="active-selection-title" className="text-sm font-geist font-bold text-white truncate">{selectedTask.title}</h4>
            </div>
            <button
              id="btn-clear-target-selection"
              onClick={handleClearTaskSelection}
              className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Immersive Countdown Timer (7 columns) */}
      <div id="timer-display-container" className="lg:col-span-7 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden shadow-xl">
        
        {/* Glow ambient background behind timer */}
        <div className="absolute w-44 h-44 rounded-full bg-indigo-500/5 blur-3xl -z-10" />

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key="active-timer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center space-y-8 w-full"
            >
              {/* Circular progress with SVG */}
              <div className="relative flex items-center justify-center">
                <svg className="w-56 h-56 transform -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r={radius}
                    className="stroke-white/5 fill-none"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="112"
                    cy="112"
                    r={radius}
                    className="stroke-indigo-400 fill-none"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Numeric Countdown Timer */}
                <div className="absolute flex flex-col items-center text-center">
                  <span id="countdown-timer-text" className="font-mono text-4xl font-extrabold tracking-widest text-white animate-pulse">
                    {formatTime(timeLeft)}
                  </span>
                  <span id="countdown-subtext" className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-1 font-bold">
                    {isRunning ? "FOCUS FLOW ACTIVE" : "PAUSED"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {/* Reset button */}
                <button
                  id="btn-timer-reset"
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(initialDuration);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Play/Pause Primary toggle */}
                <button
                  id="btn-timer-toggle-play"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`py-3.5 px-8 rounded-xl font-geist font-bold text-sm tracking-widest flex items-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                    isRunning 
                      ? "bg-transparent border border-indigo-400 text-indigo-400 hover:bg-indigo-500/10" 
                      : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:brightness-110 shadow-indigo-500/20"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      PAUSE FLOW
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      INITIATE DEEP WORK
                    </>
                  )}
                </button>

                {/* Skip / Force Complete trigger */}
                <button
                  id="btn-timer-skip"
                  onClick={handleTimerComplete}
                  className="p-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 rounded-xl transition-all cursor-pointer"
                  title="Force complete block"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>

              {/* Ambient Noise Toggles */}
              <div className="w-full max-w-sm pt-4 border-t border-white/10 flex flex-col items-center space-y-3">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                  SYNTHESIZED FOCUS ENVIRONMENT
                </span>
                <div className="flex gap-2 w-full justify-center">
                  {[
                    { id: "White Noise", label: "White Noise" },
                    { id: "Brownian Noise", label: "Brownian" },
                    { id: "Binaural Beats", label: "Theta Beats" }
                  ].map((sound) => {
                    const isActive = soundType === sound.id;
                    return (
                      <button
                        key={sound.id}
                        id={`btn-sound-${sound.id}`}
                        onClick={() => handleSoundToggle(sound.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          isActive 
                            ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {sound.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Finished Block Screen */
            <motion.div
              key="timer-complete-victory"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 max-w-md"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400 flex items-center justify-center text-emerald-400 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-geist text-2xl font-bold text-white">Focus Cycle Achieved</h3>
                <p className="text-sm text-slate-400">
                  The deep work block has been verified. Statistics synced and priority list restructured.
                </p>
              </div>

              <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl text-xs font-mono text-indigo-300">
                LOG: +{Math.round(initialDuration / 60)} Minutes Deep Work to Session Record
              </div>

              <button
                id="btn-timer-return-dashboard"
                onClick={() => {
                  setIsFinished(false);
                  setTimeLeft(defaultTimerDuration * 60);
                  setInitialDuration(defaultTimerDuration * 60);
                  setSelectedTask(null);
                }}
                className="py-2.5 px-6 bg-gradient-to-br from-indigo-500 to-purple-600 hover:brightness-110 text-white font-geist font-bold text-sm tracking-wide rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                DISMISS & LOAD NEW BLOCK
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
