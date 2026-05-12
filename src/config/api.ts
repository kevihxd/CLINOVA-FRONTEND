/**
 * Configuración central de la URL base del backend.
 * En desarrollo local usa http://localhost:8080 por defecto.
 * En producción (Hostinger), Vite inyecta VITE_API_URL desde .env.production.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
