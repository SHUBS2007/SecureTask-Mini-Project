const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Permit tools such as curl/Postman that do not send an Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "20kb" }));

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: "", maxlength: 500 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

app.get("/", (_req, res) => {
  res.json({ message: "SecureTask API is running", status: "healthy" });
});

app.get("/api/tasks", async (_req, res) => {
  try {
    res.json(await Task.find().sort({ createdAt: -1 }));
  } catch (error) {
    console.error("Fetch tasks failed:", error.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  const { title, description = "" } = req.body || {};
  if (typeof title !== "string" || !title.trim() || title.trim().length > 100) {
    return res.status(400).json({ error: "Title must contain 1–100 characters" });
  }
  if (typeof description !== "string" || description.length > 500) {
    return res.status(400).json({ error: "Description must contain at most 500 characters" });
  }
  try {
    const task = await Task.create({ title: title.trim(), description: description.trim() });
    res.status(201).json(task);
  } catch (error) {
    console.error("Create task failed:", error.message);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  if (typeof req.body?.completed !== "boolean") {
    return res.status(400).json({ error: "A boolean completed value is required" });
  }
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    const invalidId = error.name === "CastError" || error.name === "BSONError";
    res.status(invalidId ? 400 : 500).json({
      error: invalidId ? "Invalid task ID" : "Failed to update task"
    });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    const invalidId = error.name === "CastError" || error.name === "BSONError";
    res.status(invalidId ? 400 : 500).json({
      error: invalidId ? "Invalid task ID" : "Failed to delete task"
    });
  }
});

app.use((error, _req, res, _next) => {
  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({ error: "This frontend origin is not allowed" });
  }
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Create backend/.env using backend/.env.example.");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`SecureTask API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
