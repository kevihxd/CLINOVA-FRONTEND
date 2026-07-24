/**
 * Utilidades para clasificación y estandarización de tipos de contrato
 * Compatibilidad total con datos importados de Kawak y registros del sistema.
 */

export const CATEGORIAS_CONTRATACION = {
    NOMINA: 'NOMINA',
    PROVEEDORES: 'PROVEEDORES',
};

export const OPCIONES_CONTRATO_POR_CATEGORIA = {
    [CATEGORIAS_CONTRATACION.NOMINA]: [
        'Nomina',
        'Término Fijo',
        'Término Indefinido',
        'Aprendizaje',
        'Obra o Labor',
        'Temporal'
    ],
    [CATEGORIAS_CONTRATACION.PROVEEDORES]: [
        'Prestación de Servicios',
        'Prestacion de servicios',
        'OPS / Honorarios',
        'Contratista'
    ]
};

/**
 * Determina si un tipo de contrato pertenece a la categoría de NÓMINA.
 */
export const esContratoNomina = (tipoContrato) => {
    if (!tipoContrato || typeof tipoContrato !== 'string') return false;
    const norm = tipoContrato.toLowerCase().trim();
    return (
        norm.includes('nomina') ||
        norm.includes('nómina') ||
        norm.includes('indefinido') ||
        norm.includes('fijo') ||
        norm.includes('directo') ||
        norm.includes('aprendizaje') ||
        norm.includes('obra') ||
        norm.includes('temporal')
    );
};

/**
 * Determina si un tipo de contrato pertenece a la categoría de PROVEEDORES / OPS.
 */
export const esContratoOPS = (tipoContrato) => {
    if (!tipoContrato || typeof tipoContrato !== 'string') return false;
    const norm = tipoContrato.toLowerCase().trim();
    return (
        norm.includes('prestac') ||
        norm.includes('ops') ||
        norm.includes('honorario') ||
        norm.includes('contratista') ||
        norm.includes('proveedor') ||
        norm.includes('servicios')
    );
};

/**
 * Obtiene la categoría principal ('NOMINA' u 'OPS') de cualquier string de tipo de contrato.
 */
export const resolverCategoriaContrato = (tipoContrato) => {
    if (esContratoOPS(tipoContrato)) return CATEGORIAS_CONTRATACION.PROVEEDORES;
    if (esContratoNomina(tipoContrato)) return CATEGORIAS_CONTRATACION.NOMINA;
    return CATEGORIAS_CONTRATACION.NOMINA; // Default fallback
};
