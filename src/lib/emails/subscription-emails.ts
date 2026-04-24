import { sendMail } from "./sendMail";

export const sendSubscriptionCreatedMail = async (
  email: string,
  planName: string,
  amount: string,
  billingCycle: string,
) => {
  try {
    await sendMail(
      email,
      "Welcome to Zaprill Pro! \uD83C\uDF89",
      `Your subscription to the ${planName} plan is confirmed. You have been charged ${amount}/${billingCycle}.`,
      `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">Welcome to Zaprill Pro! \uD83C\uDF89</h2>
          <p style="color:#555;margin-bottom:16px">Thank you for subscribing to the <strong>${planName}</strong> plan.</p>
          <p style="color:#555;margin-bottom:24px">Your payment of <strong>${amount}</strong> for this ${billingCycle} has been processed successfully.</p>
          <a href="https://app.zaprill.com/dashboard" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Go to Dashboard</a>
        </div>
      `,
    );
  } catch (err) {
    console.error("FAILED TO SEND SUBSCRIPTION CREATED EMAIL", err);
  }
};

export const sendSubscriptionRenewedMail = async (
  email: string,
  planName: string,
  amount: string,
  billingCycle: string,
  nextRenewalDate: string,
) => {
  try {
    await sendMail(
      email,
      "Your Zaprill Subscription has been renewed",
      `Your subscription to the ${planName} plan has been renewed for ${amount}/${billingCycle}. Next renewal is on ${nextRenewalDate}.`,
      `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">Subscription Renewed</h2>
          <p style="color:#555;margin-bottom:16px">Your <strong>${planName}</strong> plan has been successfully renewed.</p>
          <p style="color:#555;margin-bottom:16px">Your payment of <strong>${amount}</strong> for this ${billingCycle} has been processed. Your next renewal date is <strong>${nextRenewalDate}</strong>.</p>
          <a href="https://app.zaprill.com/billing" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">View Billing</a>
        </div>
      `,
    );
  } catch (err) {
    console.error("FAILED TO SEND SUBSCRIPTION RENEWED EMAIL", err);
  }
};

export const sendSubscriptionCanceledMail = async (
  email: string,
  planName: string,
  endDate: string,
) => {
  try {
    await sendMail(
      email,
      "Your Zaprill Subscription has been canceled",
      `Your subscription to the ${planName} plan has been canceled. You will retain access until ${endDate}.`,
      `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">Subscription Canceled</h2>
          <p style="color:#555;margin-bottom:16px">We're sorry to see you go! Your <strong>${planName}</strong> plan has been canceled.</p>
          <p style="color:#555;margin-bottom:24px">You will continue to have access to your premium features until the end of your current billing period on <strong>${endDate}</strong>.</p>
          <a href="https://app.zaprill.com/billing" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Re-subscribe Anytime</a>
        </div>
      `,
    );
  } catch (err) {
    console.error("FAILED TO SEND SUBSCRIPTION CANCELED EMAIL", err);
  }
};
