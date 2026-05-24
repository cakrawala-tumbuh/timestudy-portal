import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: string;
    user: DefaultSession["user"] & {
      username: string;
      is_superuser: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiry?: number;
    username?: string;
    is_superuser?: boolean;
    error?: string;
  }
}
