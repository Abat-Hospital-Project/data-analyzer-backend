import { check, validationResult } from "express-validator";

const symptomValidation = [
  check("name").notEmpty().withMessage("Symptom name is required"),
  check("severity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Severity must be an integer between 1 and 10"),
];

// for registration
export const validateSymptomFields = [...symptomValidation];

// middleware to handle validation result errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
