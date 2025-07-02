const express = require("express");
const { getActivityLogs } = require("../controllers/activityLogController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.use(auth);
router.get("/", getActivityLogs);

module.exports = router;
