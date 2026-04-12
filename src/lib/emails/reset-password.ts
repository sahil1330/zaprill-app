import { User } from "better-auth";
import { sendMail } from "./sendMail";
export const sendResetPasswordMail = async ({ user, url }: { user: User, url: string }) => {
    console.log("---- TRIGGERING PASSWORD RESET EMAIL ----", user.email);
    try {
        const res = await sendMail(user.email, "Reset your password", `Click the link to reset your password: ${url}`, `
              <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">Reset your password</h2>
                <p style="color:#555;margin-bottom:24px">Click the link below to reset your Zaprill password. This link expires in 1 hour.</p>
                <a href="${url}" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Reset Password</a>
                <p style="color:#aaa;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
              </div>
            `)
        console.log("PASSWORD RESET EMAIL SUCCESS:", res);
    } catch (err) {
        console.error("PASSWORD RESET EMAIL ERROR:", err);
    }
}

