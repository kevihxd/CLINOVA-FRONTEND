import http from "../../../services/httpClient";
import { UsuarioPerfil } from "../type/Persona";

export const UsuarioService = {
    updateProfile: (data: Partial<UsuarioPerfil>) =>
        http.put<UsuarioPerfil>("/usuario/perfil", data),


    getProfile: () =>
        http.get<UsuarioPerfil>("/usuario/perfil"),
};
