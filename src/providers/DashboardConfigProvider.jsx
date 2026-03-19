import { createContext, useContext, useState } from 'react';

const DashboardConfigContext = createContext();

export const useDashboardConfig = () => {
    const context = useContext(DashboardConfigContext);
    if (!context) {
        throw new Error('useDashboardConfig must be used within a DashboardConfigProvider');
    }
    return context;
};

export const DashboardConfigProvider = ({ children }) => {
    const [viewMode, setViewMode] = useState('default');

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'default' ? 'menu' : 'default');
    };

    const value = {
        viewMode,
        setViewMode,
        toggleViewMode
    };

    return (
        <DashboardConfigContext.Provider value={value}>
            {children}
        </DashboardConfigContext.Provider>
    );
};
