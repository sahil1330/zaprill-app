import {
  adminClient,
  anonymousClient,
  emailOTPClient,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    adminClient(),
    anonymousClient(),
    phoneNumberClient(),
    emailOTPClient(),
  ],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
