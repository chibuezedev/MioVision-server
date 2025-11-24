const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  signupValidation,
  loginValidation,
  validate,
} = require("../middleware/validator");

router.post("/signup", signupValidation, validate, signup);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
