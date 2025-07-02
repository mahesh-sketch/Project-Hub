const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.use(auth);
router.get("/summary", getDashboardSummary);

module.exports = router;
