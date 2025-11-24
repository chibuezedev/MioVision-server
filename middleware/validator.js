const { body, query, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules
const signupValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("name").notEmpty().withMessage("Name is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const patientValidation = [
  body("name").notEmpty().withMessage("Patient name is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  body("dateOfBirth").isISO8601().withMessage("Invalid date of birth"),
  body("email").optional().isEmail().withMessage("Invalid email"),
];

module.exports = {
  validate,
  signupValidation,
  loginValidation,
  patientValidation,
};
