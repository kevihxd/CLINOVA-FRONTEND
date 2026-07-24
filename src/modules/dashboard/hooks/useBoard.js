import { useState } from 'react';
import { Users, ClipboardCheck, Settings, FileText, BarChart3, ShieldCheck, FileSignature, Building2 } from 'lucide-react';

export const useBoard = () => {
    const [cards, setCards] = useState([
        {
            id: '1',
            title: 'Talento Humano',
            description: 'Gestión de personal y contratos',
            icon: Users,
            color: 'bg-indigo-500',
            position: { x: 100, y: 100 }
        },
        {
            id: '3',
            title: 'Procesos',
            description: 'Mapa de procesos y flujos',
            icon: Settings,
            color: 'bg-blue-500',
            position: { x: 100, y: 350 }
        },
        {
            id: '5',
            title: 'Configuración',
            description: 'Gestión de configuraciones',
            icon: Settings,
            color: 'bg-slate-700',
            position: { x: 100, y: 600 }
        },
        {
            id: '7',
            title: 'Actas e Informes',
            description: 'Gestión de actas y reportes',
            icon: FileSignature,
            color: 'bg-purple-500',
            position: { x: 450, y: 600 }
        },
        {
            id: '8',
            title: 'Contexto de la organización',
            description: 'Gestión de contexto, partes interesadas y requisitos legales',
            icon: Building2,
            color: 'bg-orange-500',
            position: { x: 450, y: 100 }
        },
        {
            id: '9',
            title: 'Hojas de Vida',
            description: 'Gestión de Hojas de Vida de Nómina y Proveedores (OPS)',
            icon: FileText,
            color: 'bg-teal-600',
            position: { x: 450, y: 350 }
        }
    ]);

    const [selectedModule, setSelectedModule] = useState(null);

    const updatePosition = (id, newPosition) => {
        setCards(prevCards =>
            prevCards.map(card =>
                card.id === id ? { ...card, position: newPosition } : card
            )
        );
        console.log(`Card ${id} moved to:`, newPosition);
    };

    const selectModule = (moduleId) => {
        const module = cards.find(c => c.id === moduleId);
        setSelectedModule(module);
    };

    const closeSidebar = () => {
        setSelectedModule(null);
    };

    return {
        cards,
        updatePosition,
        selectedModule,
        selectModule,
        closeSidebar
    };
};