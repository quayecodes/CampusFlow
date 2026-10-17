import bcrypt from "bcryptjs";

/**
 * Number of salt rounds for bcrypt key derivation.
 * 12 rounds provides a strong balance of computational cost (~250-300ms on modern hardware)
 * to resist offline dictionary/brute-force attacks while maintaining fast user login response.
 */
const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with an automatically generated salt.
 * Never stores or returns plaintext passwords.
 *
 * @param password The plaintext password to hash
 * @returns The resulting bcrypt hash string (contains algorithm, cost factor, salt, and digest)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a candidate plaintext password with an existing bcrypt hash.
 * Uses constant-time comparison internally to prevent timing attacks.
 *
 * @param password The candidate plaintext password
 * @param hash The stored bcrypt hash
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
