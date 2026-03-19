export interface Persona {
    id: number;
    tipo_documento: number;
    numero_documento: number;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    fecha_nacimiento: string;
    direccion_residencia: string;
    numero_telefono: number;
    lugar_nacimiento: string;
    correo_electronico: string;
    fecha_creacion?: string;
    fecha_modificacion?: string;
    creado_por?: number;
    modificado_por?: number;
}

export interface Usuario {
    id: number;
    cedula: string;
    password?: string;
    persona_id: number;
    fecha_creacion?: string;
    fecha_modificacion?: string;
    creado_por?: number;
    modificado_por?: number;
    persona?: Persona;
    role?: string; 
}

export interface CreateUsuarioRequest {
    tipo_documento: number;
    numero_documento: number;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    fecha_nacimiento: string;
    direccion_residencia?: string;
    numero_telefono?: number;
    lugar_nacimiento?: string;
    correo_electronico: string;
    cedula: string;
    password: string;
    cargo?: string;
}
