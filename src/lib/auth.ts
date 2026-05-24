/**
 * NextAuth v4 configuration for the TimeStudy YPII admin portal.
 *
 * Uses the Credentials provider backed by the backend JWT login endpoint
 * (`POST /api/v1/auth/login`). The access token and refresh token are stored
 * inside the encrypted NextAuth JWT cookie.
 *
 * @module auth
 */

import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const tokenData = await res.json();

          // Fetch user info
          const meRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (!meRes.ok) return null;
          const user = await meRes.json();

          return {
            id: String(user.id),
            name: user.full_name ?? user.username,
            email: user.email,
            username: user.username,
            is_superuser: user.is_superuser,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            // Store expiry as a Unix timestamp (ms) so JWT callback can refresh
            accessTokenExpiry: Date.now() + (tokenData.expires_in as number) * 1000,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: copy all fields from the User object into the JWT
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.accessToken = u.accessToken as string;
        token.refreshToken = u.refreshToken as string;
        token.accessTokenExpiry = u.accessTokenExpiry as number;
        token.username = u.username as string;
        token.is_superuser = u.is_superuser as boolean;
        return token;
      }

      // Subsequent calls: refresh the access token if it has expired or is
      // within 60 seconds of expiring.
      const expiry = token.accessTokenExpiry as number | undefined;
      if (expiry && Date.now() < expiry - 60_000) {
        return token; // still valid
      }

      // Access token expired — exchange refresh token for a new pair
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: token.refreshToken }),
        });
        if (!res.ok) throw new Error(`refresh failed: ${res.status}`);
        const refreshed = await res.json();
        token.accessToken = refreshed.access_token as string;
        token.refreshToken = refreshed.refresh_token as string;
        token.accessTokenExpiry = Date.now() + (refreshed.expires_in as number) * 1000;
      } catch (err) {
        console.error("[auth] token refresh failed:", err);
        // Return token with error flag — session callback will propagate it
        token.error = "RefreshTokenError";
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.username = token.username as string;
      session.user.is_superuser = token.is_superuser as boolean;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
