const express = require("express");
const router = express.Router();
const {
  createExamination,
  getExaminations,
  getExamination,
  updateExamination,
  deleteExamination,
  uploadImage,
} = require("../controllers/examinationController");
const { protect } = require("../middleware/auth");
const upload = require("../utils/multer");

router.use(protect);

router
  .route("/")
  .post(upload.single("image"), createExamination)
  .get(getExaminations);

router
  .route("/:id")
  .get(getExamination)
  .put(updateExamination)
  .delete(deleteExamination);

router.post("/:id/upload-image", upload.single("image"), uploadImage);

module.exports = router;
