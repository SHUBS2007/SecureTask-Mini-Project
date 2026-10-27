import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Something went wrong");
    return data;
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTasks(await request("/api/tasks"));
    } catch (err) {
      setError(`${err.message}. Check that the backend and database are running.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const addTask = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setError("");
    try {
      const newTask = await request("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description })
      });
      setTasks((previous) => [newTask, ...previous]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTask = async (task) => {
    setError("");
    try {
      const updatedTask = await request(`/api/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed })
      });
      setTasks((previous) => previous.map((item) =>
        item._id === updatedTask._id ? updatedTask : item
      ));
    } catch (err) { setError(err.message); }
  };

  const deleteTask = async (id) => {
    setError("");
    try {
      await request(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((previous) => previous.filter((task) => task._id !== id));
    } catch (err) { setError(err.message); }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });
  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-icon">✓</span>SecureTask</a>
        <span className="status"><span className="status-dot"></span>Task workspace</span>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
        <h1>Make today <span>count.</span></h1>
        <p className="subtitle">Organize your priorities. Track your progress. Get things done.</p>
      </section>

      <section className="stats">
        <article className="stat-card"><span>Total tasks</span><strong>{tasks.length}</strong></article>
        <article className="stat-card"><span>Pending</span><strong>{pendingCount}</strong></article>
        <article className="stat-card"><span>Completed</span><strong>{completedCount}</strong></article>
      </section>

      <section className="workspace">
        <div className="panel create-panel">
          <h2>Create a task</h2>
          <p className="panel-description">Add something you want to accomplish.</p>
          <form onSubmit={addTask}>
            <label htmlFor="task-title">Task title</label>
            <input id="task-title" type="text" maxLength={100}
              placeholder="e.g. Complete cloud security lab" value={title}
              onChange={(event) => setTitle(event.target.value)} required />
            <label htmlFor="task-description">Description</label>
            <textarea id="task-description" maxLength={500}
              placeholder="Add a few details (optional)" value={description}
              onChange={(event) => setDescription(event.target.value)} rows={4} />
            <button className="primary-button" type="submit">+ Add task</button>
          </form>
        </div>

        <div className="panel task-panel">
          <div className="task-heading">
            <div><h2>Your tasks</h2><p className="panel-description">Your next step starts here.</p></div>
            <button className="refresh-button" type="button" onClick={loadTasks} aria-label="Refresh tasks">↻</button>
          </div>

          <div className="filters" aria-label="Filter tasks">
            {["all", "pending", "completed"].map((item) => (
              <button key={item} className={filter === item ? "filter active" : "filter"}
                onClick={() => setFilter(item)} type="button">
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          {error && <div className="error-message" role="alert">{error}</div>}
          {loading ? <p className="empty-state">Loading tasks...</p> :
            filteredTasks.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">✦</span>
                <h3>No tasks here yet</h3><p>Add a task to get started.</p></div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task) => (
                  <article className="task-item" key={task._id}>
                    <button type="button" className={task.completed ? "checkbox checked" : "checkbox"}
                      onClick={() => toggleTask(task)}
                      aria-label={task.completed ? "Mark task as pending" : "Mark task as completed"}>
                      {task.completed ? "✓" : ""}
                    </button>
                    <div className="task-content">
                      <h3 className={task.completed ? "done" : ""}>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                      <span className={task.completed ? "task-badge completed" : "task-badge pending"}>
                        {task.completed ? "Completed" : "In progress"}
                      </span>
                    </div>
                    <button type="button" className="delete-button"
                      onClick={() => deleteTask(task._id)} aria-label={`Delete ${task.title}`}>Delete</button>
                  </article>
                ))}
              </div>
            )}
        </div>
      </section>
      <footer><span>SecureTask</span><span>Built with React, Express &amp; MongoDB</span></footer>
    </main>
  );
}

export default App;
