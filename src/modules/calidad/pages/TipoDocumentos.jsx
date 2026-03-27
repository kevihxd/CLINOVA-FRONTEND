import React from 'react';
import { Search, Plus, Folder } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const TipoDocumentos = () => {
    const [searchParams] = useSearchParams();
    // Lee el proceso de la URL (si vienes del mapa), si no, muestra SIAU por defecto
    const proceso = searchParams.get('proceso') || 'SIAU';

    const carpetas = [
        { id: 1, nombre: 'FORMATO', cantidad: 42 },
        { id: 2, nombre: 'CARACTERIZACIÓN', cantidad: 5 },
        { id: 3, nombre: 'INDICADOR', cantidad: 0 },
        { id: 4, nombre: 'MANUAL', cantidad: 2 },
        { id: 5, nombre: 'PLAN', cantidad: 1 },
        { id: 6, nombre: 'POLÍTICA', cantidad: 1 },
        { id: 7, nombre: 'PROCEDIMIENTO', cantidad: 1 }
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-6 md:p-8 font-sans">
            <div className="max-w-[1200px] mx-auto space-y-6">
                
                {/* Encabezado exacto a la imagen */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-[22px] font-bold text-[#333]">
                        Gestión de calidad - {proceso}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Buscar documento" 
                                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none w-64 text-gray-600"
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                            <Plus size={16} /> Nuevo Documento
                        </button>
                        <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Ver todos
                        </button>
                    </div>
                </div>

                {/* Cuadrícula de carpetas idéntica */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {carpetas.map((carpeta) => (
                        <div 
                            key={carpeta.id} 
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3"
                        >
                            <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                                {/* Ícono de carpeta relleno de azul */}
                                <Folder fill="#3b82f6" stroke="#3b82f6" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-[13px] tracking-wide">{carpeta.nombre}</h3>
                                <p className="text-gray-400 text-xs mt-0.5">{carpeta.cantidad} Documentos</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};