const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");

// Create Project (Admin only)
exports.createProject = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status, assignedUsers } =
      req.body;
    const project = new Project({
      title,
      description,
      startDate,
      endDate,
      status,
      assignedUsers,
    });
    await project.save();
    await ActivityLog.create({
      user: req.user._id,
      action: "created project",
      targetType: "Project",
      targetId: project._id,
      details: { title, status },
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Projects (Admin: all, Member: assigned)
exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === "Admin") {
      projects = await Project.find().populate(
        "assignedUsers",
        "name email role"
      );
    } else {
      projects = await Project.find({ assignedUsers: req.user._id }).populate(
        "assignedUsers",
        "name email role"
      );
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Project by ID (Admin: any, Member: assigned)
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "assignedUsers",
      "name email role"
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (
      req.user.role !== "Admin" &&
      !project.assignedUsers.some((u) => u._id.equals(req.user._id))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Project (Admin only)
exports.updateProject = async (req, res) => {
  try {
    const oldProject = await Project.findById(req.params.id);
    if (!oldProject)
      return res.status(404).json({ message: "Project not found" });
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    // Track changes for activity log
    const changedFields = {};
    const updatableFields = [
      "title",
      "description",
      "startDate",
      "endDate",
      "status",
      "assignedUsers",
    ];
    updatableFields.forEach((field) => {
      if (
        Object.prototype.hasOwnProperty.call(req.body, field) &&
        oldProject[field]?.toString() !== req.body[field]?.toString()
      ) {
        changedFields[field] = {
          from: oldProject[field],
          to: req.body[field],
        };
      }
    });
    await ActivityLog.create({
      user: req.user._id,
      action: "updated project",
      targetType: "Project",
      targetId: project._id,
      details: changedFields,
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Project (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    await ActivityLog.create({
      user: req.user._id,
      action: "deleted project",
      targetType: "Project",
      targetId: project._id,
      details: { title: project.title },
    });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign Users to Project (Admin only)
exports.assignUsersToProject = async (req, res) => {
  try {
    const { userIds } = req.body; // array of user IDs
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedUsers: { $each: userIds } } },
      { new: true }
    ).populate("assignedUsers", "name email role");
    if (!project) return res.status(404).json({ message: "Project not found" });
    await ActivityLog.create({
      user: req.user._id,
      action: "assigned users to project",
      targetType: "Project",
      targetId: project._id,
      details: { userIds },
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
