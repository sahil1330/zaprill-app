import { sendMail } from "./sendMail";

export const sendOTPMail = async ({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: string;
}) => {
  console.log(`---- TRIGGERING OTP EMAIL (${type}) ----`, email);

  let subject = "Your Verification Code";
  const message = `Your code is: ${otp}`;
  let title = "Verification Code";
  let description = "Please use the code below to complete your verification.";

  if (type === "forget-password") {
    subject = "Reset Your Password - Zaprill";
    title = "Reset Your Password";
    description =
      "You requested to reset your password. Use the code below to proceed. This code expires shortly.";
  } else if (type === "sign-in") {
    subject = "Sign in to Zaprill";
    title = "Sign In Code";
    description = "Use the code below to sign in to your Zaprill account.";
  }

  try {
    const res = await sendMail(
      email,
      subject,
      message,
      `
              <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">${title}</h2>
                <p style="color:#555;margin-bottom:24px">${description}</p>
                <div style="background:#f4f4f5;padding:16px 24px;border-radius:6px;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;margin-bottom:24px">
                  ${otp}
                </div>
                <p style="color:#aaa;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
    );
    console.log(`OTP EMAIL SUCCESS (${type}):`, res);
  } catch (err) {
    console.error(`OTP EMAIL ERROR (${type}):`, err);
  }
};
