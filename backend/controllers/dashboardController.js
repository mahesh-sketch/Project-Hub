const Project = require("../models/Project");
const Task = require("../models/Task");

exports.getDashboardSummary = async (req, res) => {
  try {
    let projectFilter = {};
    let taskFilter = {};
    if (req.user.role !== "Admin") {
      projectFilter = { assignedUsers: req.user._id };
      taskFilter = { assignedTo: req.user._id };
    }
    // Projects
    const totalProjects = await Project.countDocuments(projectFilter);
    const projectsByStatus = await Project.aggregate([
      { $match: projectFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    // Tasks
    const totalTasks = await Task.countDocuments(taskFilter);
    const tasksByStatus = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const tasksByPriority = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    res.json({
      totalProjects,
      projectsByStatus,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
