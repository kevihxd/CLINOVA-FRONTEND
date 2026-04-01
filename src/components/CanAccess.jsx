import React from 'react';
import { useAuth } from '../providers/AuthProvider';

export const CanAccess = ({ permiso, children }) => {
    const { hasPermission } = useAuth();
    
    if (!hasPermission(permiso)) {
        return null;
    }

    return <>{children}</>;
};