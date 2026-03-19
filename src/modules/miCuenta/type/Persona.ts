export interface Persona {
    tipo_documento: string;
    numero_documento: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    fecha_nacimiento: string;
    lugar_nacimiento: string;
    direccion_residencia: string;
    numero_telefono: string;
    fecha_creacion: string;
    fecha_modificacion: string;
}

export interface UsuarioPerfil {
    username: string;
    role: string;
    persona: Persona;
}
