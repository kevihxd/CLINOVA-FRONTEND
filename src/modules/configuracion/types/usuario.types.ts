export interface Persona {
    id: number;
    tipoDocumento: string;
    numeroDocumento: string;
    primerNombre: string;
    segundoNombre: string | null;
    primerApellido: string;
    segundoApellido: string | null;
    fechaNacimiento: string;
    direccionResidencia: string;
    numeroTelefono: string;
    lugarNacimiento: string;
    correoElectronico: string;
}

export interface Usuario {
    id: number;
    username: string; 
    password?: string;
    rol?: string; 
    cargo?: {
        id: number;
        nombre: string;
    };
    persona?: Persona;
}

export interface CreateUsuarioRequest {
    username: string;
    password?: string;
    rol: string;
    cargoId?: number;
    nombres?: string;
    apellidos?: string;
    correo?: string;
}