import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";
import { validateRegistrationInput } from "../src/lib/auth/validation";

async function verifyRegistration() {
  console.log("Testing database connection and user registration...\n");

  const testEmail = `test.student.${Date.now()}@university.edu`;
  const rawPassword = "SecurePassword123!";

  // 1. Validation
  const validation = validateRegistrationInput({
    fullName: "Integration Test Student",
    email: testEmail,
    password: rawPassword,
    role: "STUDENT",
  });

  if (!validation.isValid) {
    console.error("Validation failed:", validation.errors);
    process.exit(1);
  }

  // 2. Hash password
  const passwordHash = await hashPassword(rawPassword);

  // 3. Insert into User table
  try {
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: "Integration Test Student",
        passwordHash,
        role: "STUDENT",
      },
    });

    console.log("Successfully created user in database:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Created At:", user.createdAt);

    // 4. Verify lookup
    const found = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (found) {
      console.log("\n[SUCCESS] User was successfully written to and retrieved from public.User table!");
    } else {
      console.error("\n[FAIL] User not found after insert.");
      process.exit(1);
    }

    // Clean up test user
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log("Cleaned up integration test record.");
  } catch (err: any) {
    console.error("Database registration failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRegistration();
