import { User } from "better-auth/types";

import { sendMail } from "./sendMail";

export const sendVerificationEmail = async ({ user, url }: { user: User, url: string }) => {
  try {
    const res = await sendMail(user.email, "Verify your email", `Click the link to verify your email: ${url}`, `
                  <div style="font-family:sans-serif;max-width:480px;margin:auto">
                    <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">Welcome to Zaprill 🚀</h2>
                    <p style="color:#555;margin-bottom:24px">Click below to verify your email and start analyzing your resume.</p>
                    <a href="${url}" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Verify Email</a>
                    <p style="color:#aaa;font-size:12px;margin-top:24px">This link expires in 24 hours.</p>
                  </div>
                `,
    );
    console.log("VERIFICATION EMAIL SUCCESS:", res);
  } catch (err) {
    console.error("VERIFICATION EMAIL ERROR:", err);
  }
}