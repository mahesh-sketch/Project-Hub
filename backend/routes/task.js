const express = require("express");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
} = require("../controllers/taskController");
const { auth, isAdmin } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET all tasks (Admin: all, Member: assigned)
router.get("/", getTasks);

// GET task by ID
router.get("/:id", getTaskById);

// CREATE task (Admin only)
router.post("/", isAdmin, createTask);

// UPDATE task (Admin: any, Member: only assigned)
router.put("/:id", updateTask);

// DELETE task (Admin only)
router.delete("/:id", isAdmin, deleteTask);

// ASSIGN task to user (Admin only)
router.put("/:id/assign", isAdmin, assignTask);

module.exports = router;
