import express from "express";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

app.use(express.json());

// Type declarations
interface Preferences {
  workspaceName: string;
  tagline: string;
  dailyTargetHours: number;
  focusSound: string;
  timerDuration: number;
}

interface TaskBlock {
  id: string;
  title: string;
  notes: string;
  duration: number; // in minutes
  priority: string; // "Focus Block" | "Routine Task"
  blockNumber: string; // e.g. "BLOCK_01"
  completed: boolean;
  createdAt: string;
}

interface RoutineAnchor {
  id: string;
  title: string;
  duration: string; // e.g., "15M", "ALL DAY"
  completed: boolean;
  blockNumber: string; // e.g. "01"
}

interface FocusSignal {
  id: string;
  name: string;
  email: string;
  content: string;
  priorityCheckbox: boolean;
  createdAt: string;
}

interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  durationMinutes: number;
  timestamp: string;
}

interface AppData {
  preferences: Preferences;
  tasks: TaskBlock[];
  routines: RoutineAnchor[];
  signals: FocusSignal[];
  sessions: FocusSession[];
}

// Initial default seed data matching the mock layout
const DEFAULT_DATA: AppData = {
  preferences: {
    workspaceName: "Command Center",
    tagline: "STAY DISCIPLINED.",
    dailyTargetHours: 6,
    focusSound: "none",
    timerDuration: 25,
  },
  tasks: [
    {
      id: "t1",
      title: "Algorithm Lab",
      notes: "Complete graph traversal exercises.",
      duration: 90,
      priority: "Focus Block",
      blockNumber: "BLOCK_01",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "t2",
      title: "Thesis Review",
      notes: "Refine methodology section Chapter 3.",
      duration: 120,
      priority: "Focus Block",
      blockNumber: "BLOCK_02",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "t3",
      title: "Backend Sync",
      notes: "Optimize database query throughput.",
      duration: 45,
      priority: "Focus Block",
      blockNumber: "BLOCK_03",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "t4",
      title: "Logic Design",
      notes: "Prototype the user authentication flow.",
      duration: 60,
      priority: "Focus Block",
      blockNumber: "BLOCK_04",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "t5",
      title: "Research Call",
      notes: "Sync with Dr. Aris regarding data sets.",
      duration: 30,
      priority: "Focus Block",
      blockNumber: "BLOCK_05",
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ],
  routines: [
    {
      id: "r1",
      title: "Morning Mindfulness Scan",
      duration: "15M",
      completed: false,
      blockNumber: "01",
    },
    {
      id: "r2",
      title: "Hydration Baseline (1.5L)",
      duration: "ALL DAY",
      completed: true,
      blockNumber: "02",
    },
    {
      id: "r3",
      title: "Academic Reading (20pp)",
      duration: "45M",
      completed: false,
      blockNumber: "03",
    },
    {
      id: "r4",
      title: "Physical Prime Training",
      duration: "60M",
      completed: false,
      blockNumber: "04",
    },
  ],
  signals: [],
  sessions: [
    // Pre-seed some sessions from the past few days to make analytics look real and gorgeous!
    {
      id: "s1",
      taskTitle: "Algorithm Lab",
      durationMinutes: 90,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 days ago
    },
    {
      id: "s2",
      taskTitle: "Logic Design",
      durationMinutes: 60,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: "s3",
      taskTitle: "Academic Reading (20pp)",
      durationMinutes: 45,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ],
};

// Helper to read database
async function getDbData(): Promise<AppData> {
  try {
    if (existsSync(DB_PATH)) {
      const content = await fs.readFile(DB_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading db.json, returning defaults", error);
  }
  // If file doesn't exist or is corrupted, write and return defaults
  await saveDbData(DEFAULT_DATA);
  return DEFAULT_DATA;
}

// Helper to write database
async function saveDbData(data: AppData): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to db.json", error);
  }
}

// REST API Routes

// 1. Get all application data
app.get("/api/data", async (req, res) => {
  const data = await getDbData();
  res.json(data);
});

// 2. Save user preferences
app.post("/api/preferences", async (req, res) => {
  const db = await getDbData();
  db.preferences = { ...db.preferences, ...req.body };
  await saveDbData(db);
  res.json({ success: true, preferences: db.preferences });
});

// 3. Add a new task block
app.post("/api/tasks", async (req, res) => {
  const db = await getDbData();
  const { title, notes, duration, priority } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // Calculate block number
  const blockCount = db.tasks.length + 1;
  const blockNumber = `BLOCK_${String(blockCount).padStart(2, "0")}`;

  const newTask: TaskBlock = {
    id: `task_${Date.now()}`,
    title,
    notes: notes || "",
    duration: Number(duration) || 30,
    priority: priority || "Focus Block",
    blockNumber,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  db.tasks.push(newTask);
  await saveDbData(db);
  res.json({ success: true, task: newTask });
});

// 4. Update task (toggle complete, rename, etc.)
app.put("/api/tasks/:id", async (req, res) => {
  const db = await getDbData();
  const { id } = req.params;
  const index = db.tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  db.tasks[index] = { ...db.tasks[index], ...req.body };
  await saveDbData(db);
  res.json({ success: true, task: db.tasks[index] });
});

// 5. Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  const db = await getDbData();
  const { id } = req.params;
  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter((t) => t.id !== id);

  if (db.tasks.length === initialLength) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Re-index block numbers for visual cleanliness
  db.tasks = db.tasks.map((t, idx) => ({
    ...t,
    blockNumber: `BLOCK_${String(idx + 1).padStart(2, "0")}`,
  }));

  await saveDbData(db);
  res.json({ success: true, tasks: db.tasks });
});

// 6. Add daily routine anchor
app.post("/api/routines", async (req, res) => {
  const db = await getDbData();
  const { title, duration } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const index = db.routines.length + 1;
  const blockNumber = String(index).padStart(2, "0");

  const newRoutine: RoutineAnchor = {
    id: `routine_${Date.now()}`,
    title,
    duration: duration || "30M",
    completed: false,
    blockNumber,
  };

  db.routines.push(newRoutine);
  await saveDbData(db);
  res.json({ success: true, routine: newRoutine });
});

// 7. Toggle routine status
app.put("/api/routines/:id", async (req, res) => {
  const db = await getDbData();
  const { id } = req.params;
  const index = db.routines.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Routine not found" });
  }

  db.routines[index] = { ...db.routines[index], ...req.body };
  await saveDbData(db);
  res.json({ success: true, routine: db.routines[index] });
});

// 8. Delete a routine anchor
app.delete("/api/routines/:id", async (req, res) => {
  const db = await getDbData();
  const { id } = req.params;
  const initialLength = db.routines.length;
  db.routines = db.routines.filter((r) => r.id !== id);

  if (db.routines.length === initialLength) {
    return res.status(404).json({ error: "Routine not found" });
  }

  // Re-index block numbers for routine anchors
  db.routines = db.routines.map((r, idx) => ({
    ...r,
    blockNumber: String(idx + 1).padStart(2, "0"),
  }));

  await saveDbData(db);
  res.json({ success: true, routines: db.routines });
});

// 9. Submit a Focus Signal (feedback/support)
app.post("/api/signals", async (req, res) => {
  const db = await getDbData();
  const { name, email, content, priorityCheckbox } = req.body;

  if (!name || !email || !content) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newSignal: FocusSignal = {
    id: `signal_${Date.now()}`,
    name,
    email,
    content,
    priorityCheckbox: !!priorityCheckbox,
    createdAt: new Date().toISOString(),
  };

  db.signals.push(newSignal);
  await saveDbData(db);
  res.json({ success: true, signal: newSignal });
});

// 10. Log a completed focus session
app.post("/api/sessions", async (req, res) => {
  const db = await getDbData();
  const { taskId, taskTitle, durationMinutes } = req.body;

  if (!taskTitle || !durationMinutes) {
    return res.status(400).json({ error: "Task title and duration are required" });
  }

  const newSession: FocusSession = {
    id: `session_${Date.now()}`,
    taskId,
    taskTitle,
    durationMinutes: Number(durationMinutes),
    timestamp: new Date().toISOString(),
  };

  db.sessions.push(newSession);

  // If a taskId was provided and it matches a task in our board, let's mark that task completed!
  if (taskId) {
    const idx = db.tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      db.tasks[idx].completed = true;
    }
  }

  await saveDbData(db);
  res.json({ success: true, session: newSession, tasks: db.tasks });
});

// 11. Reset database to defaults immediately
app.post("/api/reset", async (req, res) => {
  await saveDbData(DEFAULT_DATA);
  res.json({ success: true, message: "Database reset successfully", data: DEFAULT_DATA });
});


// Express server entry point setup
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
