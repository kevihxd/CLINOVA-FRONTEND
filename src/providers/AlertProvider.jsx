import React, { createContext, useContext, useCallback } from 'react';
import Swal from 'sweetalert2';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert debe ser usado dentro de un AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {

    const showAlert = useCallback((apiResponse) => {
        const { message, status } = apiResponse;

        let icon = 'info';

        const statusLower = status?.toLowerCase();

        if (['success', 'error', 'warning', 'info', 'question'].includes(statusLower)) {
            icon = statusLower;
        } else if (status === 200 || status === '200' || status === 'ok' || status === 'OK') {
            icon = 'success';
        } else if (status >= 400 || status === 'error') {
            icon = 'error';
        }

        Swal.fire({
            title: message,
            text: '',
            icon: icon,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6',
        });
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
        </AlertContext.Provider>
    );
};
