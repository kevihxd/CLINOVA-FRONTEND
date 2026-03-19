export interface LoginCredentials {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    role: string;
    name: string;
    email: string;
}

export interface AuthData {
    token: string;
    user: User;
}

export interface AuthResponse {
    status: string;
    message: string;
    object: AuthData;
}
