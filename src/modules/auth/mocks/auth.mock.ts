import { AuthResponse, LoginCredentials } from '../types/auth.types';

export const mockLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        console.log('🔒 [Mock] Intentando iniciar sesión con:', credentials.username);

        setTimeout(() => {
            if (credentials.username === 'admin' && credentials.password === '12345') {
                console.log('✅ [Mock] Login exitoso');
                resolve({
                    status: 'success',
                    message: 'Login exitoso',
                    object: {
                        token: 'mock-jwt-token-xyz-123',
                        user: {
                            id: 1,
                            username: 'admin',
                            role: 'admin',
                            name: 'Administrador Sistema',
                            email: 'admin@kawak.com'
                        }
                    }
                });
            } else {
                console.warn('❌ [Mock] Credenciales inválidas');
                reject(new Error('Credenciales inválidas'));
            }
        }, 1500);
    });
};
