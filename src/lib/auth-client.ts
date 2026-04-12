import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  anonymousClient,
  phoneNumberClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [adminClient(), anonymousClient(), phoneNumberClient()],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
