const express = require("express");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignUsersToProject,
} = require("../controllers/projectController");
const { auth, isAdmin } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET all projects (Admin: all, Member: assigned)
router.get("/", getProjects);

// GET project by ID
router.get("/:id", getProjectById);

// CREATE project (Admin only)
router.post("/", isAdmin, createProject);

// UPDATE project (Admin only)
router.put("/:id", isAdmin, updateProject);

// DELETE project (Admin only)
router.delete("/:id", isAdmin, deleteProject);

// ASSIGN users to project (Admin only)
router.put("/:id/assign", isAdmin, assignUsersToProject);

module.exports = router;
