import http from "../../../services/httpClient";
import { Usuario, CreateUsuarioRequest } from "../types/usuario.types";

export const UsuariosService = {
    getAll: () =>
        http.get<Usuario[]>("/usuarios"),

    getById: (id: number) =>
        http.get<Usuario>(`/usuarios/${id}`),

    create: (data: CreateUsuarioRequest) =>
        http.post("/usuarios", data), 

    update: (id: number, data: Partial<Usuario>) =>
        http.put<Usuario>(`/usuarios/${id}`, data),

    delete: (id: number) =>
        http.delete(`/usuarios/${id}`),
};