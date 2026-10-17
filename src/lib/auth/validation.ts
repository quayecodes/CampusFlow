import { Role } from "@prisma/client";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// RFC 5322 compliant simplified email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates user registration payload.
 * Enforces strong password policy (min 8 chars, mixed case, number, symbol)
 * to prevent weak credential vulnerabilities.
 */
export function validateRegistrationInput(data: {
  email?: unknown;
  password?: unknown;
  fullName?: unknown;
  role?: unknown;
  departmentId?: unknown;
  programId?: unknown;
}): ValidationResult {
  const errors: string[] = [];

  // 1. Email validation
  if (!data.email || typeof data.email !== "string" || !EMAIL_REGEX.test(data.email.trim())) {
    errors.push("A valid email address is required.");
  } else if (data.email.length > 255) {
    errors.push("Email address cannot exceed 255 characters.");
  }

  // 2. Full Name validation
  if (!data.fullName || typeof data.fullName !== "string" || data.fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long.");
  } else if (data.fullName.trim().length > 100) {
    errors.push("Full name cannot exceed 100 characters.");
  }

  // 3. Password strength validation
  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required.");
  } else {
    const pwd = data.password;
    if (pwd.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (pwd.length > 128) {
      errors.push("Password cannot exceed 128 characters.");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) {
      errors.push("Password must contain at least one special character.");
    }
  }

  // 4. Role validation
  const validRoles = Object.values(Role);
  if (!data.role || typeof data.role !== "string" || !validRoles.includes(data.role as Role)) {
    errors.push(`Role must be one of: ${validRoles.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates login payload.
 */
export function validateLoginInput(data: {
  email?: unknown;
  password?: unknown;
}): ValidationResult {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== "string" || !EMAIL_REGEX.test(data.email.trim())) {
    errors.push("A valid email address is required.");
  }

  if (!data.password || typeof data.password !== "string" || data.password.length === 0) {
    errors.push("Password is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
