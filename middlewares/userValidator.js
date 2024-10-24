import { check, validationResult } from "express-validator";

// common validation rule for registration and login
const commonValidation = [
  check("email").isEmail().withMessage("Valid email is required"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .withMessage(
      "Passwords must contain at least 1 digit, 1 special character, 1 letter, and must have a minimum length of 8 characters"
    ),
];

// validation for registration
const registerSpecificValidation = [
  check("firstName").notEmpty().withMessage("First name is required"),
  check("lastName").notEmpty().withMessage("Last name is required"),
  check("gender").notEmpty().withMessage("Gender is required"),
  check("age").isInt({ min: 1 }).withMessage("Valid age is required"),
  check("phoneNumber").notEmpty().withMessage("Phone number is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("subCity").notEmpty().withMessage("Sub-city is required"),
  check("kebele").notEmpty().withMessage("Kebele is required"),
  check("maritalStatus").notEmpty().withMessage("Marital status is required"),
  check("disabilityStatus")
    .notEmpty()
    .withMessage("Disability status is required"),
  check("drugUsageStatus")
    .notEmpty()
    .withMessage("Drug usage status is required"),
  check("mentalHealthStatus")
    .notEmpty()
    .withMessage("Mental health status is required"),
  check("cardNumber").notEmpty().withMessage("Card number is required"),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

const emailValidation = [
  check("email").isEmail().withMessage("Valid email is required"),
  check("verificationCode")
    .notEmpty()
    .withMessage("Verification code is required"),
];

const forgotPasswordValidation = [
  check("email").isEmail().withMessage("Valid email is required"),
];

const resetPasswordValidation = [
  check("newPassword")
    .notEmpty()
    .withMessage("Password is required")
    .matches(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .withMessage(
      "Passwords must contain at least 1 digit, 1 special character, 1 letter, and must have a minimum length of 8 characters"
    ),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// for registration
export const validateRegister = [
  ...commonValidation,
  ...registerSpecificValidation,
];
// login validation
export const validateLogin = [...commonValidation];

// for email verification
export const validateEmail = [...emailValidation];

// for forgot password
export const validateForgotPassword = [...forgotPasswordValidation];

// for password reset
export const validateResetPassword = [...resetPasswordValidation];

// middleware to handle validation result errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
