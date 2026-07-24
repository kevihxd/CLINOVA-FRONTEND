import React, { useState, useEffect } from 'react';
import http from '../services/httpClient';

const SecureImage = ({ src, alt, className, fallbackSrc }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let objectUrl = null;

        const fetchImage = async () => {
            if (!src || typeof src !== 'string' || !src.trim()) {
                setLoading(false);
                setError(true);
                return;
            }

            const cleanSrc = src.trim();

            // 1. Base64 o blobs de vista previa local -> usar directamente
            if (cleanSrc.startsWith('blob:') || cleanSrc.startsWith('data:')) {
                setImageSrc(cleanSrc);
                setError(false);
                setLoading(false);
                return;
            }

            // 2. URLs de imágenes externas completas que no requieren token
            if ((cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://')) && !cleanSrc.includes('/api/v1/')) {
                setImageSrc(cleanSrc);
                setError(false);
                setLoading(false);
                return;
            }

            // 3. Rutas locales de Windows (ej. C:\...) -> no realizable via http
            if (/^[a-zA-Z]:[\\/]/.test(cleanSrc)) {
                setError(true);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await http.get(cleanSrc, { responseType: 'blob' });
                const blobData = (res instanceof Blob) ? res : (res?.data instanceof Blob ? res.data : null);
                
                if (blobData) {
                    objectUrl = URL.createObjectURL(blobData);
                    setImageSrc(objectUrl);
                    setError(false);
                } else if (typeof res === 'string') {
                    setImageSrc(res);
                    setError(false);
                } else {
                    setImageSrc(cleanSrc);
                    setError(false);
                }
            } catch (err) {
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
