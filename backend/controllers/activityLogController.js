const ActivityLog = require("../models/ActivityLog");

// Get activity logs (Admin: all, Member: own)
exports.getActivityLogs = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== "Admin") {
      filter.user = req.user._id;
    }
    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .populate("user", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};