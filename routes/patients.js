const express = require("express");
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");
const { protect } = require("../middleware/auth");
const { patientValidation, validate } = require("../middleware/validator");

router.use(protect);

router
  .route("/")
  .post(patientValidation, validate, createPatient)
  .get(getPatients);

router.route("/:id").get(getPatient).put(updatePatient).delete(deletePatient);

module.exports = router;
