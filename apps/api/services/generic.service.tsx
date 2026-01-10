import { Resend } from "resend";
import { MagicLink } from "../emails/magic-link.tsx";
import { EmailTemplate } from "../emails/email-template.tsx";

export const sendMagicLink = async (magicLink: string, email: string) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: [email],
        subject: "Sign in to Pulse",
        react: <MagicLink magicLink={magicLink} />,
    });
};

export const sendTestEmail = async () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const res = await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: ["teebarg01@gmail.com"],
        subject: "Welcome!",
        react: <EmailTemplate firstName="John" />,
    });
    return res
};
