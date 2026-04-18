import http from '../../../services/httpClient';

export const cursosService = {
    listarCatalogo: async () => await http.get('/cursos/catalogo'),
    crearCursoCatalogo: async (data: any) => await http.post('/cursos/catalogo', data),
    listarAsignados: async (hojaVidaId: number) => await http.get(`/cursos/asignados/${hojaVidaId}`),
    asignarCurso: async (payload: { hojaVidaId: number, cursoMaestroId: number, fechaLimite: string }) => await http.post('/cursos/asignar', payload),
    eliminarAsignacion: async (id: number) => await http.delete(`/cursos/asignados/${id}`)
};
