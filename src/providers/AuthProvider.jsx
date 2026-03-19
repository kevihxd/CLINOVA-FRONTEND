import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const decodeToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (error) {
            console.error("Error al decodificar token", error);
            return null;
        }
    };

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem("token");
            if (token) {
                const decodedUser = decodeToken(token);
                if (decodedUser) {
                    const currentTime = Date.now() / 1000;
                    if (decodedUser.exp && decodedUser.exp < currentTime) {
                        logout();
                    } else {
                        setUser(decodedUser);
                        setIsAuthenticated(true);
                    }
                } else {
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        const decodedUser = decodeToken(token);
        setUser(decodedUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
        // window.location.href = '/login'; 
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
