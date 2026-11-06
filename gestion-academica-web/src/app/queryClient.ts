import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api/httpClient";

const NO_RETRY_STATUSES = [400, 401, 403, 404, 409]

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: (failureCount, error) =>
                !(error instanceof ApiError && NO_RETRY_STATUSES.includes(error.status)) &&
                failureCount < 2,
        },
        mutations: {
            retry: false,
        },
    },
})
