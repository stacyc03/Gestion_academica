import { sessionStore } from "../lib/sessionStore";
import { toAuthSession } from "../model/types";
import { authApi } from "../api/authApi";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";

/** Caso de uso: Iniciar sesión */
export function useLogin(){
    const navigate = useNavigate()
    const location = useLocation()

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (response) => {
            sessionStore.set(toAuthSession(response))
            const from = (location.state as {from?: string} | null)?.from ?? '/'
            navigate(from, { replace: true })
        }
    })
}