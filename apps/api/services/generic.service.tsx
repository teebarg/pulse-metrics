import { Resend } from "resend";
import { MagicLink } from "../emails/magic-link.tsx";

export const sendMagicLink = async (magicLink: string) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
        from: "Niyi at Dev <info@niyi.com.ng>",
        to: ["teebarg01@gmail.com"],
        subject: "Sign in to Pulse",
        react: <MagicLink magicLink={magicLink} />,
    });
    console.log("🚀 ~ sendMagicLink ~ error:", error);
    console.log("🚀 ~ sendMagicLink ~ data:", data);
};
