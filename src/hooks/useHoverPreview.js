import { useState, useRef, useEffect } from 'react';

export const useHoverPreview = (delay = 3000) => {
    const [showPreview, setShowPreview] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        // Start timer
        timeoutRef.current = setTimeout(() => {
            setShowPreview(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        // Clear timer and hide preview
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setShowPreview(false);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return { showPreview, handleMouseEnter, handleMouseLeave };
};
