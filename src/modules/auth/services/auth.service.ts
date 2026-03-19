import http from "../../../services/httpClient";
import { AuthResponse, LoginCredentials } from "../types/auth.types";
import { mockLogin } from "../mocks/auth.mock";

// Flag para activar/desactivar mocks. 
// Idealmente esto vendría de import.meta.env.VITE_USE_MOCKS === 'true'
const USE_MOCK = false;

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
        return await mockLogin(credentials);
    }

    // Axios ya está tipado genéricamente, pero el interceptor devuelve 'any'.
    // Al pasar el genérico <AuthResponse> a http.post, indicamos qué esperamos recibir.
    // http.post devuelve Promise<T> gracias a la configuración de axios o se infiere.
    // Si el interceptor devuelve data directamente, el tipo de retorno de http.post debe coincidir.
    return await http.post<AuthResponse, AuthResponse>("/auth/login", credentials);
};

export const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};
