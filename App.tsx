import React, { useState, useEffect, useContext, createContext, useRef, useCallback } from "react";
import "./styles.css";

const SEED_TASKS = [
  { id: "1", title: "Redesign onboarding flow", description: "Revamp the user onboarding experience with new illustrations and simplified steps to improve conversion.", priority: "high", status: "in-progress", tags: ["design", "ux", "onboarding"], dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "2", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment to production and staging environments.", priority: "high", status: "pending", tags: ["devops", "automation"], dueDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "3", title: "Write Q3 product spec", description: "Document the feature roadmap and success metrics for the next quarter's development sprint.", priority: "medium", status: "pending", tags: ["planning", "documentation"], dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "4", title: "Fix login page bug", description: "Users on Safari are experiencing a session timeout issue after 5 minutes of inactivity. Investigate and patch.", priority: "high", status: "completed", tags: ["bug", "frontend", "auth"], dueDate: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: "5", title: "Database indexing audit", description: "Review slow query logs and add missing indexes. Target: bring P95 query time under 100ms.", priority: "medium", status: "in-progress", tags: ["backend", "performance", "database"], dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "6", title: "Create component library", description: "Build a shared Storybook with all reusable UI components documented and tested across breakpoints.", priority: "medium", status: "pending", tags: ["design", "frontend", "storybook"], dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "7", title: "Accessibility audit", description: "Run WCAG 2.1 AA audit across all pages. Fix all critical violations and document the remediation plan.", priority: "low", status: "pending", tags: ["accessibility", "ux", "compliance"], dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "8", title: "Migrate to PostgreSQL", description: "Plan and execute the migration from MySQL to PostgreSQL. Include rollback procedure and zero-downtime strategy.", priority: "high", status: "completed", tags: ["backend", "database", "devops"], dueDate: new Date(Date.now() - 2 * 86400000).toISOString(), createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "9", title: "Launch email campaign", description: "Design and schedule the re-engagement email sequence for churned users from the past 90 days.", priority: "low", status: "pending", tags: ["marketing", "email", "growth"], dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "10", title: "Mobile app performance", description: "Profile the React Native app and reduce bundle size by at least 30%. Focus on removing unused dependencies.", priority: "medium", status: "in-progress", tags: ["mobile", "performance", "frontend"], dueDate: new Date(Date.now() + 4 * 86400000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const TaskContext = createContext(null);
const ThemeContext = createContext(null);
const RouterContext = createContext(null);

function useRouter() { return useContext(RouterContext); }
function useTasks() { return useContext(TaskContext); }
function useTheme() { return useContext(ThemeContext); }

function RouterProvider({ children }) {
  const [route, setRoute] = useState("/");
  const [params, setParams] = useState({});
  const navigate = useCallback((path) => {
    setRoute(path);
    setParams({});
    if (path.startsWith("/task/") && path !== "/task/new") setParams({ id: path.split("/task/")[1] });
    window.scrollTo(0, 0);
  }, []);
  return <RouterContext.Provider value={{ route, params, navigate }}>{children}</RouterContext.Provider>;
}

function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    try { const s = localStorage.getItem("taskify_tasks"); return s ? JSON.parse(s) : SEED_TASKS; } catch { return SEED_TASKS; }
  });
  useEffect(() => { localStorage.setItem("taskify_tasks", JSON.stringify(tasks)); }, [tasks]);
  const addTask = (task) => { const n = { ...task, id: Date.now().toString(), createdAt: new Date().toISOString() }; setTasks(p => [n, ...p]); return n.id; };
  const updateTask = (id, updates) => setTasks(p => p.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTask = (id) => setTasks(p => p.filter(t => t.id !== id));
  const getTask = (id) => tasks.find(t => t.id === id);
  const clearAll = () => { setTasks([]); localStorage.removeItem("taskify_tasks"); };
  return <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTask, clearAll }}>{children}</TaskContext.Provider>;
}

const BG_PRESETS = { default: null, cream: "#F5F0E8", sage: "#E8F0EB", peach: "#F5EDE8", rose: "#F5E8EE", sand: "#F0EDE5" };

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem("taskify_theme") === "dark"; } catch { return false; } });
  const [bgColor, setBgColor] = useState(() => { try { return localStorage.getItem("taskify_bg_color") || "default"; } catch { return "default"; } });
  const [defaultSort, setDefaultSort] = useState(() => { try { return localStorage.getItem("taskify_sort") || "recent"; } catch { return "recent"; } });
  const toggleDark = () => setDark(d => { localStorage.setItem("taskify_theme", !d ? "dark" : "light"); return !d; });
  const setPreset = (key) => { setBgColor(key); localStorage.setItem("taskify_bg_color", key); };
  return <ThemeContext.Provider value={{ dark, toggleDark, bgColor, setPreset, defaultSort, setDefaultSort }}>{children}</ThemeContext.Provider>;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No date";
const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "No date";
const dueDotClass = (iso) => { if (!iso) return "dot-grey"; const d = new Date(iso) - Date.now(); if (d < 0) return "dot-red"; if (d < 2 * 86400000) return "dot-amber"; if (d < 7 * 86400000) return "dot-green"; return "dot-grey"; };
const isOverdue = (iso) => iso && new Date(iso) < Date.now();
const SUGGESTED_TAGS = ["design", "frontend", "backend", "devops", "bug", "feature", "docs", "mobile", "testing", "marketing"];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast ${type === "error" ? "error" : ""}`}>
      <i className={`ri-${type === "error" ? "error-warning" : "checkbox-circle"}-fill`}></i>
      {msg}
    </div>
  );
}

function Modal({ title, body, onConfirm, onCancel, confirmLabel = "Confirm", danger = false }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card glass" onClick={e => e.stopPropagation()}>
        <div className="modal-icon"><i className="ri-alert-line"></i></div>
        <div className="modal-title">{title}</div>
        <div className="modal-body">{body}</div>
        <div className="btn-group">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function TagInput({ tags, setTags, max = 10 }) {
  const [val, setVal] = useState("");
  const inputRef = useRef(null);
  const addTag = (tag) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < max) setTags([...tags, t]);
    setVal("");
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(val); }
    if (e.key === "Backspace" && !val && tags.length) setTags(tags.slice(0, -1));
  };
  return (
    <>
      <div className="tag-input-wrap" onClick={() => inputRef.current?.focus()}>
        {tags.map(t => (
          <span key={t} className="tag-pill">
            {t}
            <button type="button" onClick={() => setTags(tags.filter(x => x !== t))}><i className="ri-close-line"></i></button>
          </span>
        ))}
        <input ref={inputRef} className="tag-raw-input" value={val} onChange={e => setVal(e.target.value)} onKeyDown={onKeyDown}
          placeholder={tags.length < max ? "Type + Enter" : "Max reached"} disabled={tags.length >= max} />
      </div>
      <div className="field-hint">{tags.length}/{max} tags · Enter to add</div>
      <div className="suggested-tags">
        {SUGGESTED_TAGS.filter(s => !tags.includes(s)).slice(0, 8).map(s => (
          <button key={s} type="button" className="suggest-chip" onClick={() => addTag(s)}>+ {s}</button>
        ))}
      </div>
    </>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ searchRef }) {
  const { navigate } = useRouter();
  const { dark, toggleDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const goSearch = () => { navigate("/"); setMobileOpen(false); setTimeout(() => searchRef?.current?.focus(), 100); };
  return (
    <>
      <nav className="navbar">
        <div className="nav-logo" onClick={() => { navigate("/"); setMobileOpen(false); }}>
          <i className="ri-checkbox-multiple-line"></i> Taskify
        </div>
        {/* Desktop */}
        <div className="nav-actions nav-desktop">
          <button className="nav-btn" onClick={goSearch} title="Search"><i className="ri-search-line"></i></button>
          <button className="nav-btn" onClick={() => navigate("/profile")} title="Profile"><i className="ri-user-line"></i></button>
          <button className="nav-btn" onClick={toggleDark} title="Toggle theme"><i className={`ri-${dark ? "sun" : "moon"}-line`}></i></button>
          <button className="nav-cta" onClick={() => navigate("/task/new")}><i className="ri-add-line"></i> New Task</button>
        </div>
        {/* Mobile hamburger */}
        <button className="nav-btn hamburger" onClick={() => setMobileOpen(o => !o)}>
          <i className={`ri-${mobileOpen ? "close" : "menu"}-line`}></i>
        </button>
      </nav>
      {mobileOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-item" onClick={() => { navigate("/"); setMobileOpen(false); }}><i className="ri-dashboard-line"></i> Dashboard</button>
          <button className="mobile-menu-item" onClick={() => { navigate("/task/new"); setMobileOpen(false); }}><i className="ri-add-circle-line"></i> New Task</button>
          <button className="mobile-menu-item" onClick={() => { navigate("/profile"); setMobileOpen(false); }}><i className="ri-user-line"></i> Profile & Settings</button>
          <button className="mobile-menu-item" onClick={goSearch}><i className="ri-search-line"></i> Search Tasks</button>
          <button className="mobile-menu-item" onClick={() => { toggleDark(); setMobileOpen(false); }}><i className={`ri-${dark ? "sun" : "moon"}-line`}></i> {dark ? "Light Mode" : "Dark Mode"}</button>
        </div>
      )}
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ searchRef }) {
  const { tasks, updateTask } = useTasks();
  const { defaultSort } = useTheme();
  const { navigate } = useRouter();
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [sort, setSort] = useState(defaultSort || "recent");
  const [selectedTags, setSelectedTags] = useState([]);

  const allTags = [...new Set(tasks.flatMap(t => t.tags || []))].sort();
  const toggleTag = (tag) => setSelectedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    "in-progress": tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  const filtered = tasks
    .filter(t => {
      if (statusTab !== "all" && t.status !== statusTab) return false;
      if (search) { const q = search.toLowerCase(); if (!t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q) && !(t.tags || []).some(tag => tag.includes(q))) return false; }
      if (selectedTags.length > 0 && !selectedTags.every(tag => (t.tags || []).includes(tag))) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "dueDate") return new Date(a.dueDate) - new Date(b.dueDate);
      if (sort === "priority") { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority]; }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-title">Task Board</div>
        <div className="page-header-sub">Manage and track all your work in one place</div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: "Total Tasks", val: counts.all, icon: "ri-task-line", color: "#6366F1" },
          { label: "Pending", val: counts.pending, icon: "ri-time-line", color: "#F59E0B" },
          { label: "In Progress", val: counts["in-progress"], icon: "ri-loader-line", color: "#3B82F6" },
          { label: "Completed", val: counts.completed, icon: "ri-checkbox-circle-line", color: "#10B981" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ color: s.color }}><i className={s.icon}></i></div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {/* Row 1: search + status tabs */}
        <div className="filter-row-1" style={{ width: "100%" }}>
          <div className="search-wrap">
            <i className="ri-search-line"></i>
            <input ref={searchRef} className="search-input" placeholder="Search tasks, tags…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="status-tabs">
            {[
              { id: "all", label: "All", icon: "ri-list-check" },
              { id: "pending", label: "Pending", icon: "ri-time-line" },
              { id: "in-progress", label: "Active", icon: "ri-loader-line" },
              { id: "completed", label: "Done", icon: "ri-checkbox-circle-line" },
            ].map(tab => (
              <button key={tab.id} className={`tab-btn ${statusTab === tab.id ? "active" : ""}`} onClick={() => setStatusTab(tab.id)}>
                <i className={`${tab.icon} tab-icon`}></i>
                <span className="tab-label">{tab.label}</span>
                <span className="tab-count">{counts[tab.id]}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Row 2: sort */}
        <div className="filter-row-2" style={{ width: "100%" }}>
          <div className="sort-toggle">
            {[{ id: "dueDate", label: "Due Date" }, { id: "priority", label: "Priority" }, { id: "recent", label: "Recent" }].map(s => (
              <button key={s.id} className={`sort-btn ${sort === s.id ? "active" : ""}`} onClick={() => setSort(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="tag-filter-row">
          <span className="tag-filter-label">Tags</span>
          {allTags.map(tag => (
            <span key={tag} className={`tag-chip ${selectedTags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>
              {tag}
              {selectedTags.includes(tag) && <i className="ri-close-line close-icon"></i>}
            </span>
          ))}
          {selectedTags.length > 0 && <button className="tag-clear" onClick={() => setSelectedTags([])}>Clear all</button>}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><i className="ri-inbox-line"></i></div>
          <div className="empty-title">No tasks found</div>
          <div className="empty-sub">Try adjusting your filters or create a new task</div>
        </div>
      ) : (
        <div className="task-grid">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task}
              onComplete={() => updateTask(task.id, { status: "completed" })}
              onClick={() => navigate(`/task/${task.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onComplete, onClick }) {
  const done = task.status === "completed";
  return (
    <div className={`task-card ${done ? "completed-card" : ""}`} onClick={onClick} style={{ perspective: "600px" }}>
      <div className="card-header">
        <div className="badge-row">
          <span className={`badge badge-${task.priority}`}>
            <i className={`ri-arrow-${task.priority === "high" ? "up" : task.priority === "medium" ? "subtract" : "down"}-line`}></i>
            {task.priority}
          </span>
          <span className={`badge badge-${task.status}`}>{task.status.replace("-", " ")}</span>
          {isOverdue(task.dueDate) && !done && <span className="badge badge-overdue">Overdue</span>}
        </div>
        <button className={`check-btn ${done ? "done" : ""}`}
          onClick={e => { e.stopPropagation(); onComplete(); }} title={done ? "Completed" : "Mark complete"}>
          <i className="ri-check-line"></i>
        </button>
      </div>
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-desc">{task.description}</div>}
      {task.tags?.length > 0 && (
        <div className="card-tags">
          {task.tags.slice(0, 4).map(t => <span key={t} className="card-tag">{t}</span>)}
          {task.tags.length > 4 && <span className="card-tag">+{task.tags.length - 4}</span>}
        </div>
      )}
      <div className="card-footer">
        <span className={`due-dot ${dueDotClass(task.dueDate)}`}></span>
        <i className="ri-calendar-line" style={{ fontSize: 12 }}></i>
        {fmtDate(task.dueDate)}
      </div>
    </div>
  );
}

// ─── ADD TASK ─────────────────────────────────────────────────────────────────
function AddTask() {
  const { addTask } = useTasks();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", dueDate: "", tags: [] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 2) e.title = "Title must be at least 2 characters";
    if (!form.dueDate) e.dueDate = "Due date is required";
    else if (new Date(form.dueDate) < new Date()) e.dueDate = "Due date cannot be in the past";
    if (form.description.length > 500) e.description = "Max 500 characters";
    return e;
  };

  const submit = () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      addTask({ title: form.title.trim(), description: form.description.trim(), priority: form.priority, dueDate: new Date(form.dueDate).toISOString(), tags: form.tags, status: "pending" });
      setLoading(false); setSuccess(true);
      setTimeout(() => navigate("/"), 900);
    }, 800);
  };

  if (success) return (
    <div className="page">
      <div className="form-card glass">
        <div className="success-state">
          <div className="success-icon"><i className="ri-checkbox-circle-fill"></i></div>
          <div className="success-title">Task Created!</div>
          <div className="success-sub">Redirecting to dashboard…</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="form-card glass">
        <div className="form-title">New Task</div>
        <div className="form-sub">Fill in the details to add a new task</div>

        <div className="field">
          <label className="field-label">Title *</label>
          <input className={`field-input ${errors.title ? "error" : ""}`} value={form.title} onChange={e => set("title", e.target.value)} placeholder="What needs to be done?" />
          {errors.title && <div className="field-error"><i className="ri-error-warning-line"></i>{errors.title}</div>}
        </div>

        <div className="field">
          <label className="field-label">Description</label>
          <textarea className={`field-textarea ${errors.description ? "error" : ""}`} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Add more context (optional)" />
          <div className="field-hint" style={{ textAlign: "right" }}>{form.description.length}/500</div>
          {errors.description && <div className="field-error"><i className="ri-error-warning-line"></i>{errors.description}</div>}
        </div>

        <div className="field">
          <label className="field-label">Priority</label>
          <div className="seg-ctrl">
            {[{ id: "high", icon: "ri-arrow-up-line" }, { id: "medium", icon: "ri-subtract-line" }, { id: "low", icon: "ri-arrow-down-line" }].map(p => (
              <button key={p.id} type="button" className={`seg-btn ${form.priority === p.id ? "active" : ""}`} onClick={() => set("priority", p.id)}>
                <i className={p.icon}></i>{p.id.charAt(0).toUpperCase() + p.id.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Due Date *</label>
          <input type="datetime-local" className={`field-input ${errors.dueDate ? "error" : ""}`} value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
          {errors.dueDate && <div className="field-error"><i className="ri-error-warning-line"></i>{errors.dueDate}</div>}
        </div>

        <div className="field">
          <label className="field-label">Tags</label>
          <TagInput tags={form.tags} setTags={v => set("tags", v)} />
        </div>

        <div className="btn-group" style={{ justifyContent: "flex-end", marginTop: 6 }}>
          <button className="btn-secondary" onClick={() => navigate("/")}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? <><div className="spinner"></div>Saving…</> : <><i className="ri-add-line"></i>Create Task</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TASK DETAIL ──────────────────────────────────────────────────────────────
function TaskDetail({ id }) {
  const { getTask, updateTask, deleteTask } = useTasks();
  const { navigate } = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const task = getTask(id);
  const [form, setForm] = useState(task ? {
    title: task.title, description: task.description || "",
    priority: task.priority, status: task.status,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
    tags: task.tags || [],
  } : {});
  const [errors, setErrors] = useState({});
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (!task) return (
    <div className="page">
      <div className="not-found">
        <div className="not-found-code">404</div>
        <div className="not-found-title">Task not found</div>
        <div className="not-found-sub">This task doesn't exist or was deleted.</div>
        <button className="btn-primary" onClick={() => navigate("/")}>Back to Dashboard</button>
      </div>
    </div>
  );

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 2) e.title = "Min 2 characters";
    if (!form.dueDate) e.dueDate = "Due date is required";
    if (form.description.length > 500) e.description = "Max 500 characters";
    return e;
  };

  const save = () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      updateTask(id, { ...form, dueDate: new Date(form.dueDate).toISOString() });
      setLoading(false); setEditing(false); setToast("Task updated");
    }, 700);
  };

  return (
    <div className="page">
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {deleteModal && <Modal title="Delete Task?" body={`Delete "${task.title}"? This cannot be undone.`}
        onConfirm={() => { deleteTask(id); navigate("/"); }} onCancel={() => setDeleteModal(false)}
        confirmLabel="Yes, Delete" danger />}

      <button className="btn-secondary" style={{ marginBottom: 18 }} onClick={() => navigate("/")}>
        <i className="ri-arrow-left-line"></i>Back
      </button>

      <div className="detail-card glass">
        {!editing ? (
          <>
            <div className="detail-header">
              <div className="badge-row">
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                <span className={`badge badge-${task.status}`}>{task.status.replace("-", " ")}</span>
                {isOverdue(task.dueDate) && task.status !== "completed" && <span className="badge badge-overdue">Overdue</span>}
              </div>
            </div>
            <div className="detail-title">{task.title}</div>
            <div className="detail-meta">
              <div className="meta-item"><i className="ri-calendar-line"></i>Due: {fmtDateTime(task.dueDate)}</div>
              <div className="meta-item"><i className="ri-time-line"></i>Created: {fmtDate(task.createdAt)}</div>
            </div>
            {task.description && <div className="detail-desc">{task.description}</div>}
            {task.tags?.length > 0 && <div className="detail-tags">{task.tags.map(t => <span key={t} className="detail-tag">{t}</span>)}</div>}
            <div className="btn-group">
              <button className="btn-primary" onClick={() => setEditing(true)}><i className="ri-edit-line"></i>Edit</button>
              <button className="btn-danger" onClick={() => setDeleteModal(true)}><i className="ri-delete-bin-line"></i>Delete</button>
            </div>
          </>
        ) : (
          <>
            <div className="form-title" style={{ fontSize: 20, marginBottom: 4 }}>Edit Task</div>
            <div className="form-sub">Update and save your changes</div>

            <div className="field">
              <label className="field-label">Title *</label>
              <input className={`field-input ${errors.title ? "error" : ""}`} value={form.title} onChange={e => setF("title", e.target.value)} />
              {errors.title && <div className="field-error"><i className="ri-error-warning-line"></i>{errors.title}</div>}
            </div>
            <div className="field">
              <label className="field-label">Description</label>
              <textarea className="field-textarea" value={form.description} onChange={e => setF("description", e.target.value)} />
              <div className="field-hint" style={{ textAlign: "right" }}>{form.description.length}/500</div>
            </div>
            <div className="field">
              <label className="field-label">Priority</label>
              <div className="seg-ctrl">
                {["high", "medium", "low"].map(p => (
                  <button key={p} type="button" className={`seg-btn ${form.priority === p ? "active" : ""}`} onClick={() => setF("priority", p)}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="field-label">Status</label>
              <select className="field-select" value={form.status} onChange={e => setF("status", e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Due Date *</label>
              <input type="datetime-local" className={`field-input ${errors.dueDate ? "error" : ""}`} value={form.dueDate} onChange={e => setF("dueDate", e.target.value)} />
              {errors.dueDate && <div className="field-error"><i className="ri-error-warning-line"></i>{errors.dueDate}</div>}
            </div>
            <div className="field">
              <label className="field-label">Tags</label>
              <TagInput tags={form.tags} setTags={v => setF("tags", v)} />
            </div>
            <div className="btn-group" style={{ justifyContent: "flex-end", marginTop: 6 }}>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={loading}>
                {loading ? <><div className="spinner"></div>Saving…</> : <><i className="ri-save-line"></i>Save Changes</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function Profile() {
  const { tasks, clearAll } = useTasks();
  const { dark, toggleDark, bgColor, setPreset, defaultSort, setDefaultSort } = useTheme();
  const { navigate } = useRouter();
  const [toast, setToast] = useState(null);
  const [clearModal, setClearModal] = useState(false);

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("taskify_profile")) || { name: "Leroi Asante", email: "leroi@atu.edu.gh", address: "Accra, Ghana" }; }
    catch { return { name: "Leroi Asante", email: "leroi@atu.edu.gh", address: "Accra, Ghana" }; }
  });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [editErrors, setEditErrors] = useState({});

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    pending: tasks.filter(t => t.status === "pending").length,
  };
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const saveProfile = () => {
    const e = {};
    if (!editForm.name.trim()) e.name = "Name is required";
    if (!editForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) e.email = "Valid email required";
    setEditErrors(e);
    if (Object.keys(e).length) return;
    const updated = { name: editForm.name.trim(), email: editForm.email.trim(), address: editForm.address.trim() };
    setProfile(updated); localStorage.setItem("taskify_profile", JSON.stringify(updated));
    setEditing(false); setToast("Profile saved!");
  };

  return (
    <div className="page">
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {clearModal && <Modal title="Clear All Tasks?" body={`Permanently delete all ${stats.total} tasks. Cannot be undone.`}
        onConfirm={() => { clearAll(); setClearModal(false); navigate("/"); }}
        onCancel={() => setClearModal(false)} confirmLabel="Yes, Clear All" danger />}

      <div className="page-header">
        <div className="page-header-title">Profile & Settings</div>
        <div className="page-header-sub">Manage your account and preferences</div>
      </div>

      {/* Profile + Stats: 2-col on desktop, stacked on mobile */}
      <div className="profile-grid">
        {/* Profile card */}
        <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
          <div className="section-title">Your Profile</div>
          {!editing ? (
            <>
              <div className="profile-avatar"><i className="ri-user-line"></i></div>
              <div className="profile-name">{profile.name}</div>
              <div className="profile-email">{profile.email}</div>
              {profile.address && <div className="profile-email" style={{ marginBottom: 12 }}><i className="ri-map-pin-line" style={{ marginRight: 3 }}></i>{profile.address}</div>}
              <div className="profile-badges">
                <span className="profile-badge">Pro Plan</span>
                <span className="profile-badge teal">Joined Jan 2025</span>
              </div>
              <button className="btn-secondary" onClick={() => { setEditForm(profile); setEditing(true); }}>
                <i className="ri-edit-line"></i>Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="field">
                <label className="field-label">Name *</label>
                <input className={`field-input ${editErrors.name ? "error" : ""}`} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                {editErrors.name && <div className="field-error">{editErrors.name}</div>}
              </div>
              <div className="field">
                <label className="field-label">Email *</label>
                <input type="email" className={`field-input ${editErrors.email ? "error" : ""}`} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                {editErrors.email && <div className="field-error">{editErrors.email}</div>}
              </div>
              <div className="field">
                <label className="field-label">Address</label>
                <input className="field-input" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="btn-group">
                <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn-primary" onClick={saveProfile}>Save</button>
              </div>
            </>
          )}
        </div>

        {/* Stats card */}
        <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
          <div className="section-title">Task Stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { l: "Total", v: stats.total, c: "#6366F1" },
              { l: "Completed", v: stats.completed, c: "#10B981" },
              { l: "In Progress", v: stats.inProgress, c: "#3B82F6" },
              { l: "Pending", v: stats.pending, c: "#F59E0B" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center", padding: 14, borderRadius: 10, background: "rgba(0,0,0,0.04)" }}>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13 }}>
            <span>Completion Rate</span>
            <span style={{ fontWeight: 700, color: "var(--teal)" }}>{completionRate}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass mt-6" style={{ padding: 24, borderRadius: 16 }}>
        <div className="section-title">Preferences</div>

        <div className="pref-row">
          <div className="pref-left">
            <div className="pref-label">Default Sort Order</div>
            <div className="pref-sub">How tasks are sorted on your dashboard</div>
          </div>
          <div className="seg-ctrl" style={{ width: "auto" }}>
            {[{ id: "dueDate", l: "Due Date" }, { id: "priority", l: "Priority" }, { id: "recent", l: "Recent" }].map(s => (
              <button key={s.id} type="button" className={`seg-btn ${defaultSort === s.id ? "active" : ""}`}
                onClick={() => { setDefaultSort(s.id); localStorage.setItem("taskify_sort", s.id); }}>{s.l}</button>
            ))}
          </div>
        </div>

        <div className="pref-row">
          <div className="pref-left">
            <div className="pref-label">Appearance</div>
            <div className="pref-sub">Switch between light and dark mode</div>
          </div>
          <button className={`theme-toggle ${dark ? "on" : ""}`} onClick={toggleDark}>
            <div className="theme-toggle-knob">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="pref-row">
          <div className="pref-left">
            <div className="pref-label">Background Color</div>
            <div className="pref-sub">Choose your preferred background</div>
          </div>
          <div className="color-grid">
            {Object.entries(BG_PRESETS).map(([key, val]) => (
              <div key={key}
                className={`color-swatch ${key === "default" ? "default" : ""} ${bgColor === key ? "selected" : ""}`}
                style={val ? { background: val } : {}}
                onClick={() => setPreset(key)} title={key} />
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 danger-zone">
        <div className="danger-title"><i className="ri-alert-line"></i> Danger Zone</div>
        <div className="danger-sub">Permanently removes all {stats.total} tasks from local storage. Cannot be undone.</div>
        <button className="btn-danger" onClick={() => setClearModal(true)}>
          <i className="ri-delete-bin-line"></i>Clear All Task Data
        </button>
      </div>
    </div>
  );
}

// ─── NOT FOUND ────────────────────────────────────────────────────────────────
function NotFound() {
  const { navigate } = useRouter();
  return (
    <div className="page">
      <div className="not-found">
        <div className="not-found-code">404</div>
        <div className="not-found-title">Page not found</div>
        <div className="not-found-sub">The page you're looking for doesn't exist.</div>
        <button className="btn-primary" onClick={() => navigate("/")}><i className="ri-home-line"></i>Back to Dashboard</button>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell() {
  const { route, params } = useRouter();
  const { dark, bgColor } = useTheme();
  const searchRef = useRef(null);
  const bgStyle = bgColor !== "default" && BG_PRESETS[bgColor] ? { background: BG_PRESETS[bgColor] } : {};
  const renderPage = () => {
    if (route === "/") return <Dashboard searchRef={searchRef} />;
    if (route === "/task/new") return <AddTask />;
    if (route.startsWith("/task/") && params.id) return <TaskDetail id={params.id} />;
    if (route === "/profile") return <Profile />;
    return <NotFound />;
  };
  return (
    <div className={`app ${dark ? "dark" : ""}`} style={bgStyle}>
      <Navbar searchRef={searchRef} />
      {renderPage()}
    </div>
  );
}

export default function Taskify() {
  return (
    <RouterProvider>
      <ThemeProvider>
        <TaskProvider>
          <AppShell />
        </TaskProvider>
      </ThemeProvider>
    </RouterProvider>
  );
}
