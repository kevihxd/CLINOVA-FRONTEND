import http from "../../../services/httpClient";
import { Usuario, CreateUsuarioRequest } from "../types/usuario.types";

export const UsuariosService = {
    getAll: () =>
        http.get<Usuario[]>("/usuarios"),

    getById: (id: number) =>
        http.get<Usuario>(`/usuarios/${id}`),

    create: (data: { username: string; password: string }) =>
        http.post("/auth/registro", data),

    update: (id: number, data: Partial<CreateUsuarioRequest>) =>
        http.put<Usuario>(`/usuarios/${id}`, data),

    delete: (id: number) =>
        http.delete(`/usuarios/${id}`),
};