import http from "../../../services/httpClient";

export const vacunacionService = {
    importarExcel: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('archivo', file);

        const response = await http.post('/vacunacion/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};