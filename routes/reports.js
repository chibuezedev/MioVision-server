const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getMonthlyTrends,
  getAgeGroupAnalysis,
  getExaminedPatients,
  getAllPatients,
} = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/dashboard-stats", getDashboardStats);
router.get("/monthly-trends", getMonthlyTrends);
router.get("/age-group-analysis", getAgeGroupAnalysis);
router.get("/examined-patients", getExaminedPatients);
router.get("/all-patients", getAllPatients);

module.exports = router;
