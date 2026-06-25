import React, { useState, useEffect } from 'react';
import http from '../services/httpClient';

const SecureImage = ({ src, alt, className, fallbackSrc }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let objectUrl = null;

        const fetchImage = async () => {
            if (!src) {
                setLoading(false);
                return;
            }

            // Si ya es un blob local (creado por preview) o una URL http completa que no es de nuestro backend, la usamos directo
            if (src.startsWith('blob:')) {
                setImageSrc(src);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Realizamos la peticin a travs del httpClient, el cual ya inyecta el header Authorization: Bearer
                const response = await http.get(src, { responseType: 'blob' });
                objectUrl = URL.createObjectURL(response.data);
                setImageSrc(objectUrl);
                setError(false);
            } catch (err) {
                console.error("Error cargando imagen segura:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    if (loading) {
        return (
            <div className={`animate-pulse bg-gray-200 flex items-center justify-center ${className}`}>
                <span className="text-gray-400 text-xs">Cargando...</span>
            </div>
        );
    }

    if (error || (!imageSrc && !fallbackSrc)) {
        return (
            <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
                <span className="text-gray-400 text-xs text-center p-1">{alt || 'Sin imagen'}</span>
            </div>
        );
    }

    return (
        <img 
            src={imageSrc || fallbackSrc} 
            alt={alt} 
            className={className} 
            loading="lazy"
        />
    );
};

export default SecureImage;
