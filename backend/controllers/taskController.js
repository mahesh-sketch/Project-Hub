const Task = require("../models/Task");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");

// Create Task (Admin only)
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      status,
      priority,
      assignedTo,
      subTasks,
      project,
    } = req.body;
    const task = new Task({
      title,
      description,
      dueDate,
      status,
      priority,
      assignedTo,
      subTasks,
      project,
    });
    await task.save();
    await ActivityLog.create({
      user: req.user._id,
      action: "created task",
      targetType: "Task",
      targetId: task._id,
      details: { title, project },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Tasks (Admin: all, Member: assigned)
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, dueDate, search, sortBy, sortOrder } = req.query;
    let filter = {};
    if (req.user.role !== "Admin") {
      filter.assignedTo = req.user._id;
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    let sort = {};
    if (sortBy) sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    const tasks = await Task.find(filter)
      .sort(sort)
      .populate("assignedTo", "name email")
      .populate("project", "title");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Task by ID (Admin: any, Member: assigned)
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("project", "title");
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (
      req.user.role !== "Admin" &&
      (!task.assignedTo || !task.assignedTo._id.equals(req.user._id))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Task (Admin: any, Member: only assigned)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (
      req.user.role !== "Admin" &&
      (!task.assignedTo || !task.assignedTo._id.equals(req.user._id))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // For members, only allow status updates
    if (req.user.role !== "Admin") {
      const { status } = req.body;
      if (status && ["Todo", "In Progress", "Completed"].includes(status)) {
        task.status = status;
      } else {
        return res.status(400).json({
          message: "Members can only update task status",
        });
      }
    } else {
      // Admin can update all fields
      // Track changes for activity log
      const changedFields = {};
      const updatableFields = [
        "title",
        "description",
        "dueDate",
        "status",
        "priority",
        "assignedTo",
        "project",
      ];
      updatableFields.forEach((field) => {
        if (
          Object.prototype.hasOwnProperty.call(req.body, field) &&
          task[field]?.toString() !== req.body[field]?.toString()
        ) {
          changedFields[field] = {
            from: task[field],
            to: req.body[field],
          };
        }
      });
      Object.assign(task, req.body);
      req._changedFields = changedFields;
    }

    await task.save();
    await ActivityLog.create({
      user: req.user._id,
      action: "updated task",
      targetType: "Task",
      targetId: task._id,
      details:
        req.user.role === "Admin"
          ? req._changedFields
          : { status: task.status },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Task (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await ActivityLog.create({
      user: req.user._id,
      action: "deleted task",
      targetType: "Task",
      targetId: task._id,
      details: { title: task.title },
    });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign Task to User (Admin only)
exports.assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true }
    ).populate("assignedTo", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });
    await ActivityLog.create({
      user: req.user._id,
      action: "assigned user to task",
      targetType: "Task",
      targetId: task._id,
      details: { userId },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
