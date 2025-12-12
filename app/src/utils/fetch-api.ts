import { getCookie } from "@tanstack/react-start/server";

const baseURL = process.env.API_URL || "http://localhost.dev";

interface HeaderOptions {
    cartId?: string | undefined;
}

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
    headers?: HeaderOptions;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...restOptions } = options;

    const url = new URL(`${endpoint}`, baseURL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === undefined) return;
            url.searchParams.append(key, value.toString());
        });
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": getCookie("better-auth.session_token") ?? "jwt",
        "Cookie": `better-auth.session_token=${getCookie("better-auth.session_token")}`,
        ...options.headers,
    };

    const response = await fetch(url, {
        ...restOptions,
        headers,
    });

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(data),
        }),

    patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "DELETE" }),
};
