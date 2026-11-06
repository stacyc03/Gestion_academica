import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginFormValues } from "../model/loginSchema";

export function LoginForm(){
    const login = useLogin()
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {username: '', password:''},
    })

    const onSubmit = handleSubmit((values) => login.mutate(values))

    return (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                    Usuario
                </label>
                <input id="username" type="text" autoComplete="username"
                autoFocus aria-invalid={errors.username ? true: undefined}
                aria-describedby={errors.username ? 'username-error':undefined} 
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                aria-invalid:border-red-500"
                {...register('username')}
                />
                {errors.username &&(
                    <p id="username-error" className="text-sm text-red-600">
                        {errors.username.message}
                    </p>
                )}
            </div>
            <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Contraseña
                </label>
                <input id="password" type="password" autoComplete="current-password"
                aria-invalid={errors.password ? true: undefined}
                aria-describedby={errors.password ? 'password-error':undefined} 
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                aria-invalid:border-red-500"
                {...register('password')}
                />
                {errors.password &&(
                    <p id="password-error" className="text-sm text-red-600">
                        {errors.password.message}
                    </p>
                )}
            </div>

            {login.error && (
                <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {login.error.message}
                </div>
            )}

            <button type="submit" disabled={login.isPending}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {login.isPending ? 'Ingresando…' : 'Iniciar Sesión'}
            </button>
        </form>
    )
}