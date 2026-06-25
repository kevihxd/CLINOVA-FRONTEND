/**
 * Extrae el array de datos de respuestas API con múltiples formatos posibles.
 * Soporta: array directo, { data: [] }, { data: { data: [] } }, { data: { content: [] } }
 */
export const parseList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    if (Array.isArray(response.data?.content)) return response.data.content;
    return [];
};

/**
 * Extrae el objeto de datos de respuestas API.
 */
export const parseObject = (response) => {
    if (!response) return null;
    if (response.data?.data) return response.data.data;
    if (response.data) return response.data;
    return response;
};

/**
 * Formatea una fecha ISO o string a DD/MM/YYYY.
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('es-CO');
    } catch {
        return dateStr;
    }
};

/**
 * Formatea moneda en pesos colombianos.
 */
export const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
};
