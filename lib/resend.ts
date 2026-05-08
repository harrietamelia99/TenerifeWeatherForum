import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "Tenerife Weather Forum <updates@tenerifeweatherforum.com>";
export const SITE_URL = "https://www.tenerifeweatherforum.com";
