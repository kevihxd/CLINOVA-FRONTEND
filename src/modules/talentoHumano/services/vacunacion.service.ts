import http from "../../../services/httpClient";

export const vacunacionService = {
    getCatalogo: async () => await http.get('/vacunacion/catalogo'),
    addVacunaAlCatalogo: async (nombre: string) => await http.post(`/vacunacion/catalogo?nombre=${encodeURIComponent(nombre)}`),
    editarVacunaCatalogo: async (id: number, nombre: string) => await http.put(`/vacunacion/catalogo/${id}?nombre=${encodeURIComponent(nombre)}`),
    eliminarVacunaCatalogo: async (id: number) => await http.delete(`/vacunacion/catalogo/${id}`),
    
    buscarPorDocumento: async (documento: string) => await http.get(`/vacunacion/buscar/${documento}`),
    
    registrarDosis: async (data: any) => await http.post('/vacunacion/registrar', data),
    editarDosis: async (id: number, data: any) => await http.put(`/vacunacion/registrar/${id}`, data),
    eliminarDosis: async (id: number) => await http.delete(`/vacunacion/registrar/${id}`)
};