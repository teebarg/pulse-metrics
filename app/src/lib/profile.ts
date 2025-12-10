import { api } from "~/utils/fetch-api";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

export async function getProfile() {
    const response = await api.get<UserProfile>("/v1/profile");
    return response;
}

export async function updateProfile(data: { name: string }) {
    const response = await api.patch<UserProfile>("/v1/profile", data);
    return response;
}
