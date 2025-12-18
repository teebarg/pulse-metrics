import { redirect } from "@tanstack/react-router";
import { getCookie } from "@tanstack/react-start/server";

const baseURL = process.env.API_URL || "http://localhost.dev";

interface HeaderOptions {}

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
    headers?: HeaderOptions;
    from?: string;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, from, ...restOptions } = options;
    const url = new URL(`${endpoint}`, baseURL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === undefined) return;
            url.searchParams.append(key, value.toString());
        });
    }

    const token = getCookie("better-auth.session_token") ?? "";

    const headers = {
        "Content-Type": "application/json",
        Authorization: token,
        Cookie: `better-auth.session_token=${token}`,
        ...options.headers,
    };

    const response = await fetch(url, {
        ...restOptions,
        headers,
    });
    if (response.status === 401 && from) {
        throw redirect({
            to: "/auth",
            search: {
                callbackUrl: encodeURIComponent(from),
            },
        });
    }

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
