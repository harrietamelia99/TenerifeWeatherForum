import { Resend } from "resend";

// The || fallback prevents build-time failure when the env var isn't present.
// On Vercel, RESEND_API_KEY is always set so the real key is always used.
export const resend = new Resend(process.env.RESEND_API_KEY || "not-configured");

export const FROM_EMAIL = "Tenerife Weather Forum <updates@tenerifeweatherforum.com>";
export const SITE_URL = "https://www.tenerifeweatherforum.com";
