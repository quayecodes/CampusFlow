import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import {
  validateRegistrationInput,
  validateLoginInput,
} from "../src/lib/auth/validation";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function runTests() {
  console.log("=========================================");
  console.log("   CAMPUSFLOW PHASE 5: AUTH TEST SUITE   ");
  console.log("=========================================\n");

  // TEST 1: Password Hashing (bcrypt format)
  try {
    const raw = "SecureP@ssw0rd123!";
    const hash = await hashPassword(raw);
    const isBcrypt = hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$");
    const matches = await verifyPassword(raw, hash);
    const rejectsWrong = !(await verifyPassword("WrongPassword123!", hash));

    const passed = isBcrypt && matches && rejectsWrong;
    results.push({
      name: "T1: Bcrypt password hashing (12 salt rounds, correct verification, wrong rejection)",
      passed,
      error: passed ? undefined : "Bcrypt format or match verification failed",
    });
  } catch (err: any) {
    results.push({
      name: "T1: Bcrypt password hashing",
      passed: false,
      error: err.message,
    });
  }

  // TEST 2: Registration Validation - Valid Payload
  try {
    const valid = validateRegistrationInput({
      fullName: "Kwame Mensah",
      email: "kwame.mensah@campusflow.edu",
      password: "StrongPassw0rd!#",
      role: "STUDENT",
    });

    results.push({
      name: "T2: Registration input validation - accepts valid payload",
      passed: valid.isValid && valid.errors.length === 0,
      error: valid.isValid ? undefined : valid.errors.join(", "),
    });
  } catch (err: any) {
    results.push({
      name: "T2: Registration input validation",
      passed: false,
      error: err.message,
    });
  }

  // TEST 3: Registration Validation - Rejects Weak Passwords
  try {
    const weakShort = validateRegistrationInput({
      fullName: "Test User",
      email: "test@campusflow.edu",
      password: "short",
      role: "STUDENT",
    });
    const weakNoNum = validateRegistrationInput({
      fullName: "Test User",
      email: "test@campusflow.edu",
      password: "NoNumberHere!",
      role: "STUDENT",
    });
    const weakNoSpecial = validateRegistrationInput({
      fullName: "Test User",
      email: "test@campusflow.edu",
      password: "NoSpecialChar123",
      role: "STUDENT",
    });

    const passed =
      !weakShort.isValid && !weakNoNum.isValid && !weakNoSpecial.isValid;
    results.push({
      name: "T3: Password policy enforcement - rejects short, non-numeric, or symbol-free passwords",
      passed,
      error: passed ? undefined : "Weak passwords unexpectedly accepted",
    });
  } catch (err: any) {
    results.push({
      name: "T3: Password policy enforcement",
      passed: false,
      error: err.message,
    });
  }

  // TEST 4: Registration Validation - Invalid Email & Invalid Role
  try {
    const badEmail = validateRegistrationInput({
      fullName: "Test User",
      email: "not-an-email",
      password: "ValidPassw0rd!",
      role: "STUDENT",
    });
    const badRole = validateRegistrationInput({
      fullName: "Test User",
      email: "test@campusflow.edu",
      password: "ValidPassw0rd!",
      role: "SUPERUSER_HACKER",
    });

    const passed = !badEmail.isValid && !badRole.isValid;
    results.push({
      name: "T4: Input sanitization - rejects malformed emails and unauthorized roles",
      passed,
      error: passed ? undefined : "Malformed email or invalid role accepted",
    });
  } catch (err: any) {
    results.push({
      name: "T4: Input sanitization",
      passed: false,
      error: err.message,
    });
  }

  // TEST 5: Login Input Validation
  try {
    const validLogin = validateLoginInput({
      email: "student@campusflow.edu",
      password: "AnyPassword123",
    });
    const missingPwd = validateLoginInput({
      email: "student@campusflow.edu",
      password: "",
    });
    const emptyEmail = validateLoginInput({
      email: "",
      password: "AnyPassword123",
    });

    const passed = validLogin.isValid && !missingPwd.isValid && !emptyEmail.isValid;
    results.push({
      name: "T5: Login validation - requires non-empty email and password",
      passed,
      error: passed ? undefined : "Login validation logic failed",
    });
  } catch (err: any) {
    results.push({
      name: "T5: Login validation",
      passed: false,
      error: err.message,
    });
  }

  // Print Summary
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? "[PASS]" : "[FAIL]";
    console.log(`${status} ${r.name}`);
    if (r.error) {
      console.log(`       Reason: ${r.error}`);
      allPassed = false;
    }
  }

  console.log("\n-----------------------------------------");
  console.log(
    `OVERALL RESULT: ${allPassed ? "ALL 5/5 TESTS PASSED" : "TESTS FAILED"}`
  );
  console.log("-----------------------------------------\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runTests();
