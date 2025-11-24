const express = require("express");
const router = express.Router();
const {
  createPrediction,
  getPredictions,
  getPrediction,
  getPatientPredictions,
} = require("../controllers/predictionController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/examinations/:examinationId/predict", createPrediction);
router.get("/", getPredictions);
router.get("/:id", getPrediction);
router.get("/patient/:patientId", getPatientPredictions);

module.exports = router;
