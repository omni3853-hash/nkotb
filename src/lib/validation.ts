export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex - at least 8 characters, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return "Email is required";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }
  return null;
};

export const validateFullName = (fullName: string): string | null => {
  if (!fullName.trim()) {
    return "Full name is required";
  }
  if (fullName.trim().length < 2) {
    return "Full name must be at least 2 characters long";
  }
  if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
    return "Full name can only contain letters and spaces";
  }
  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

export const validateLoginForm = (data: LoginFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignupForm = (data: SignupFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  const fullNameError = validateFullName(data.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    data.password,
    data.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  if (!data.agreeToTerms) {
    errors.agreeToTerms = "You must agree to the terms and conditions";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateForgotPasswordForm = (
  data: ForgotPasswordFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateResetPasswordForm = (
  data: ResetPasswordFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    data.password,
    data.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
