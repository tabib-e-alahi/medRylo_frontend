import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // proxied to backend via next.config.ts rewrites
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;