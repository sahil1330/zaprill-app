import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous, phoneNumber } from "better-auth/plugins";
import { Resend } from "resend";
import db from "@/db";
import * as schema from "@/db/schema";
import { sendResetPasswordMail } from "./emails/reset-password";
import { sendVerificationEmail } from "./emails/verification-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
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
        }
    },

    // ── Email Verification ────────────────────────────────────────────
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            void sendVerificationEmail({ user, url });
        },
    },

    // ── Social Providers ──────────────────────────────────────────────
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },

    // ── Plugins ───────────────────────────────────────────────────────
    plugins: [admin(), anonymous(), phoneNumber()],

    // ── User additional fields ────────────────────────────────────────
    user: {
        additionalFields: {
            userMetadata: { type: "json", required: false, input: false },
            appMetadata: { type: "json", required: false, input: false },
            invitedAt: { type: "date", required: false, input: false },
            lastSignInAt: { type: "date", required: false, input: false },
        },
    },
});