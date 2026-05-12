import http from '../../../services/httpClient';

export const cursosService = {
    obtenerCursosMaestros: async () => {
        return await http.get('/cursos/maestros');
    },
    crearCursoMaestro: async (data: { nombre: string; descripcion: string; fechaLimiteGlobal: string; esGlobal?: boolean; mesesVigencia?: number }) => {
        return await http.post('/cursos/maestros', data);
    },
    actualizarCursoMaestro: async (id: number, data: { nombre: string; descripcion: string; fechaLimiteGlobal: string; esGlobal?: boolean; mesesVigencia?: number }) => {
        return await http.put(`/cursos/maestros/${id}`, data);
    },
    eliminarCursoMaestro: async (id: number) => {
        return await http.delete(`/cursos/maestros/${id}`);
    },
    asignarMasivo: async (cursoId: number) => {
        return await http.post('/cursos/asignacion-masiva', { cursoId });
    },
    listarAsignados: async (usuarioId: number) => {
        return await http.get(`/cursos/asignados?usuarioId=${usuarioId}`);
    },
    asignarCurso: async (data: { usuarioId: number; cursoMaestroId: number }) => {
        return await http.post('/cursos/asignar', data);
    },
    eliminarAsignacion: async (id: number) => {
        return await http.delete(`/cursos/asignados/${id}`);
    },
    listarCatalogo: async () => {
        return await http.get('/cursos/maestros');
    },
    crearCursoCatalogo: async (data: { nombre: string; descripcion: string; fechaLimiteGlobal?: string; esGlobal?: boolean; mesesVigencia?: number }) => {
        return await http.post('/cursos/maestros', data);
    },
    actualizarEstado: async (id: number, estado: string) => {
        return await http.patch(`/cursos/asignados/${id}/estado`, { estado });
    },
    subirCertificado: async (asignacionId: number, archivo: File) => {
        const formData = new FormData();
        formData.append('archivo', archivo);
        return await http.post(`/cursos/subir-certificado/${asignacionId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};