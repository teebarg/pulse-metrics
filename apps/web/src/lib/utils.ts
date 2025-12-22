import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const currency = (number: number | undefined): string => {
    let toConvert = number;
    if (!toConvert) {
        toConvert = 0;
    }
    return toConvert.toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
};

export const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
};

export function randomId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}
