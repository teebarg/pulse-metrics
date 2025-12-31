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

import * as React from "react";

interface EmailTemplateProps {
    firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
    return (
        <div>
            <h1>Welcome, {firstName}!</h1>
        </div>
    );
}
