import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { admin, anonymous, emailOTP, phoneNumber } from "better-auth/plugins";
import db from "@/db";
import * as schema from "@/db/schema";
import { sendResetPasswordMail } from "./emails/reset-password";
import { sendVerificationEmail } from "./emails/verification-email";

// const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "lvh.me:3000",
      "hq.lvh.me:3000",
      "app.zaprill.com",
      "hq.zaprill.com",
      "*.vercel.app",
      "*.zaprill.com",
    ],
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain:
        process.env.VERCEL_ENV === "preview"
          ? undefined
          : process.env.NODE_ENV === "production"
            ? "zaprill.com"
            : "localhost",
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      jwks: schema.jwks,
    },
  }),

  // ── Email + Password ──────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 30,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendResetPasswordMail({ user, url });
    },
  },

  // ── Email Verification ────────────────────────────────────────────
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ user, url });
    },
  },

  // ── Social Providers ──────────────────────────────────────────────
  socialProviders: {
    github: {
      prompt: "select_account consent",
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    },
  },

  // ── Plugins ───────────────────────────────────────────────────────
  plugins: [
    admin(),
    anonymous(),
    phoneNumber(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const { sendOTPMail } = await import("./emails/otp-email");
        void sendOTPMail({ email, otp, type });
      },
    }),
  ],

  // ── Hooks ─────────────────────────────────────────────────────────
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Check for sign-in and sign-up endpoints (email/password, social, etc.)
      if (
        ctx.path === "/sign-in/email" ||
        ctx.path === "/sign-up/email" ||
        ctx.path.startsWith("/callback") || // OAuth callbacks (e.g., /callback/google)
        ctx.path === "/sign-in/anonymous" ||
        ctx.path === "/sign-in/phone-number"
      ) {
        const newSession = ctx.context.newSession;
        if (newSession?.user?.id) {
          // Update the user's lastSignInAt field
          await ctx.context.internalAdapter.updateUser(newSession.user.id, {
            lastSignInAt: new Date(),
          });
        }
      }
    }),
  },

  // ── User additional fields ────────────────────────────────────────
  user: {
    additionalFields: {
      userMetadata: { type: "json", required: false, input: false },
      appMetadata: { type: "json", required: false, input: false },
      invitedAt: { type: "date", required: false, input: false },
      lastSignInAt: { type: "date", required: false, input: false },
      role: { type: "string", required: false, input: false },
      banned: { type: "boolean", required: false, input: false },
    },
  },
});
