import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous, phoneNumber } from "better-auth/plugins";
import { Resend } from "resend";
import db from "@/db";
import * as schema from "@/db/schema";

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
            console.log("---- TRIGGERING PASSWORD RESET EMAIL ----", user.email);
            try {
                const res = await resend.emails.send({
                    from: "AI Job God <noreply@sahilmane.in>",
                    to: user.email,
                    subject: "Reset your password",
                    html: `
              <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">Reset your password</h2>
                <p style="color:#555;margin-bottom:24px">Click the link below to reset your AI Job God password. This link expires in 1 hour.</p>
                <a href="${url}" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Reset Password</a>
                <p style="color:#aaa;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
                });
                console.log("PASSWORD RESET EMAIL SUCCESS:", res);
            } catch (err) {
                console.error("PASSWORD RESET EMAIL ERROR:", err);
            }
        },
    },

    // ── Email Verification ────────────────────────────────────────────
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            console.log("---- TRIGGERING VERIFICATION EMAIL ----", user.email);
            try {
                const res = await resend.emails.send({
                    from: "AI Job God <noreply@sahilmane.in>",
                    to: user.email,
                    subject: "Verify your email",
                    html: `
              <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">Welcome to AI Job God 🚀</h2>
                <p style="color:#555;margin-bottom:24px">Click below to verify your email and start analyzing your resume.</p>
                <a href="${url}" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Verify Email</a>
                <p style="color:#aaa;font-size:12px;margin-top:24px">This link expires in 24 hours.</p>
              </div>
            `,
                });
                console.log("VERIFICATION EMAIL SUCCESS:", res);
            } catch (err) {
                console.error("VERIFICATION EMAIL ERROR:", err);
            }
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