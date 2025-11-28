/**
 * API utility functions for communicating with the backend
 */

import { getSupabaseClient } from "./supabase/supabase-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Get the current session token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

/**
 * Create headers with authentication token
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getAuthToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}
