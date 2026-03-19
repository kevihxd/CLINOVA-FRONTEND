import { useState, useEffect } from 'react';

export const useRightClickMenu = () => {
    const [showMenu, setShowMenu] = useState(false);

    const handleContextMenu = (e) => {
        e.preventDefault();
        setShowMenu(true);
    };

    // Close menu on any click
    useEffect(() => {
        const handleClick = () => setShowMenu(false);

        if (showMenu) {
            document.addEventListener('click', handleClick);
        }

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [showMenu]);

    return { showMenu, handleContextMenu };
};
