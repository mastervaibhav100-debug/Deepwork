export interface Preferences {
  workspaceName: string;
  tagline: string;
  dailyTargetHours: number;
  focusSound: string;
  timerDuration: number;
}

export interface TaskBlock {
  id: string;
  title: string;
  notes: string;
  duration: number; // in minutes
  priority: string; // "Focus Block" | "Routine Task"
  blockNumber: string; // e.g. "BLOCK_01"
  completed: boolean;
  createdAt: string;
}

export interface RoutineAnchor {
  id: string;
  title: string;
  duration: string; // e.g., "15M", "ALL DAY"
  completed: boolean;
  blockNumber: string; // e.g. "01"
}

export interface FocusSignal {
  id: string;
  name: string;
  email: string;
  content: string;
  priorityCheckbox: boolean;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  durationMinutes: number;
  timestamp: string;
}

export interface AppData {
  preferences: Preferences;
  tasks: TaskBlock[];
  routines: RoutineAnchor[];
  signals: FocusSignal[];
  sessions: FocusSession[];
}
