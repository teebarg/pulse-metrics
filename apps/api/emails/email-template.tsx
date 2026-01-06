// import type React from "react";

// interface EmailTemplateProps {
//     firstName: string;
// }

// export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ firstName }: EmailTemplateProps) => (
//     <div>
//         <h1>Welcome, {firstName}!</h1>
//     </div>
// );

// import type React from "react";

// interface EmailTemplateProps {
//     firstName?: string;
// }

// export const EmailTemplate: React.FC<EmailTemplateProps> = ({ firstName = "there" }) => (
//     <div>
//         <h1>Welcome, {firstName}!</h1>
//     </div>
// );

// import * as React from "react";

// interface EmailTemplateProps {
//     firstName: string;
// }

// export function EmailTemplate({ firstName }: EmailTemplateProps) {
//     return (
//         <div>
//             <h1>Welcome, {firstName}!</h1>
//         </div>
//     );
// }

import type { FC } from "react";

interface EmailTemplateProps {
    magicLink: string;
    // Add other props if your template uses them, e.g.:
    // userName?: string;
    // logoUrl?: string;
}

export const EmailTemplate: FC<EmailTemplateProps> = ({ magicLink }) => (
    <html>
        <body>
            <h1>Sign in to Pulse</h1>
            <p>Click the link below to sign in:</p>
            <a href={magicLink}>Sign in</a>
            <p>This link expires in 15 minutes.</p>
        </body>
    </html>
);
