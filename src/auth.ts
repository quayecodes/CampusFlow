import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { validateLoginInput } from "@/lib/auth/validation";

/**
 * Pre-computed bcrypt dummy hash used when an email is not found.
 * Running bcrypt verification on failed lookups ensures uniform execution time (~250ms),
 * preventing timing attacks from determining whether an email exists in the database.
 */
const DUMMY_HASH =
  "$2a$12$e8kZ1qW8qYtY/Y7tC7iRuuO4nOzq6L3V3C8n0F3W2K4Q1Y8P5L6O2";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validation = validateLoginInput(credentials ?? {});
        if (
          !validation.isValid ||
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Timing attack mitigation: still perform hash comparison
          await verifyPassword(credentials.password as string, DUMMY_HASH);
          return null;
        }

        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          departmentId: user.departmentId,
          programId: user.programId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days expiry
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId;
        token.programId = user.programId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id || "") as string;
        if (token.role) {
          session.user.role = token.role;
        }
        session.user.departmentId = token.departmentId ?? null;
        session.user.programId = token.programId ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
