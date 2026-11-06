import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { authApi } from "../api/authApi";

export function useCurrentUser(){
    const { isAuthenticated } = useAuth()

    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: ({signal}) => authApi.me(signal),
        enabled: isAuthenticated
    })
}