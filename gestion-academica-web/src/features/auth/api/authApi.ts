import { http } from "@/shared/api/httpClient";
import type { LoginRequest, LoginResponse, Usuario } from "../model/types";

export const authApi = {
    login: (credentials: LoginRequest) =>
        http<LoginResponse>('/auth/login', { method: 'POST', body: credentials, auth: false }),

    me: (signal?: AbortSignal) => http<Usuario>('/auth/me', { signal }),
}
