export interface User {
    id: string;
    email: string;
}

export interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
}
