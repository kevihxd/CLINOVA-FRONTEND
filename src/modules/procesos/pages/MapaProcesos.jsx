import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownAZ, ArrowUpZA, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MapaProcesos = () => {
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [activeTab, setActiveTab] = useState('Documentos');
    const navigate = useNavigate(); // <--- HABILITAMOS NAVEGACIÓN

    const procesos = [
        { id: '1', title: 'GESTIÓN DE HUMANIZACIÓN', top: '20%', left: '22%', width: '13%', height: '7%' },
        { id: '2', title: 'GESTIÓN COMERCIAL Y MERCADEO', top: '31%', left: '24%', width: '11%', height: '6%' },
        { id: '3', title: 'GESTIÓN ESTRATÉGICA', top: '25%', left: '36.5%', width: '9%', height: '5%' },
        { id: '4', title: 'GESTIÓN DE CALIDAD', top: '24%', left: '49%', width: '8%', height: '5%' },
        { id: '5', title: 'SIAU', top: '25.3%', left: '59%', width: '9%', height: '5%' },
        { id: '6', title: 'GESTIÓN DE SALUD PÚBLICA', top: '31%', left: '69%', width: '9%', height: '6%' },
        { id: '7', title: 'GESTIÓN DE SEGURIDAD DEL PACIENTE', top: '23%', left: '71%', width: '13%', height: '7%' },
        { id: '8', title: 'GESTIÓN DE INTERNACIÓN DOMICILIARIO', top: '42%', left: '37%', width: '13%', height: '7%' },
        { id: '9', title: 'GESTIÓN DE CONSULTA EXTERNA', top: '42%', left: '52%', width: '13%', height: '6%' },
        { id: '10', title: 'GESTIÓN DE APOYO DIAGNOSTICO Y TERAPEUTICO', top: '49%', left: '44%', width: '14%', height: '6%' },
        { id: '11', title: 'GESTIÓN DE EDUCACIÓN CONTINUA', top: '60%', left: '37%', width: '13%', height: '6%' },
        { id: '12', title: 'DOCENCIA E INVESTIGACIÓN', top: '60%', left: '52%', width: '13%', height: '5%' },
        { id: '13', title: 'GESTIÓN DE CUENTAS MÉDICAS', top: '54%', left: '17%', width: '10%', height: '5%' },
        { id: '14', title: 'GESTIÓN FINANCIERA', top: '68%', left: '21%', width: '9%', height: '5%' },
        { id: '15', title: 'GESTIÓN DE TALENTO HUMANO', top: '74%', left: '25%', width: '10%', height: '5%' },
        { id: '16', title: 'GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO', top: '80%', left: '34%', width: '9%', height: '6%' },
        { id: '17', title: 'GESTIÓN DE INFRAESTRUCTURA', top: '82%', left: '44%', width: '11%', height: '5%' },
        { id: '18', title: 'GESTIÓN DE TECNOLOGÍA Y SISTEMAS DE INFORMACIÓN', top: '81%', left: '55.5%', width: '9%', height: '6%' },
        { id: '19', title: 'GESTIÓN DE ARCHIVO', top: '77%', left: '65%', width: '8%', height: '4%' },
        { id: '20', title: 'GESTIÓN DE COMUNICACIONES', top: '70%', left: '70%', width: '10%', height: '5%' },
        { id: '21', title: 'GESTIÓN DE COMPRAS', top: '64%', left: '74%', width: '8%', height: '5%' }
    ];

    const tabs = ['Documentos', 'Acciones de Mejora', 'Actas', 'Indicadores', 'Contexto'];
    const listItems = ['FORMATO', 'CARACTERIZACIÓN', 'INDICADOR', 'MANUAL', 'PLAN', 'POLITICA', 'PROCEDIMIENTO'];

    // Función que envía a la otra página con los filtros de la URL
    const handleNavigation = (item) => {
        const url = `/procesos/tipos-documentos?proceso=${encodeURIComponent(selectedProcess.title)}&tipo=${encodeURIComponent(item)}&tab=${encodeURIComponent(activeTab)}`;
        navigate(url);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-[1200px] mx-auto space-y-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mapa de Procesos</h1>
                    <p className="text-slate-500 mt-2">Sistema de Gestión de Calidad - IPS</p>
                </div>

                <div className="relative w-full shadow-2xl rounded-2xl overflow-hidden bg-white border border-gray-200">
                    <img 
                        src="/mapa_procesos_bg.jpg" 
                        alt="Mapa de Procesos" 
                        className="w-full h-auto block"
                    />
                    
                    {procesos.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedProcess(p)}
                            style={{ 
                                position: 'absolute', 
                                top: p.top, 
                                left: p.left, 
                                width: p.width, 
                                height: p.height 
                            }}
                            className="bg-blue-500 opacity-0 hover:opacity-30 transition-opacity duration-200 cursor-pointer rounded-lg z-10"
                            title={p.title}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedProcess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#f2f2f2] w-full max-w-4xl rounded shadow-2xl flex flex-col font-sans border border-[#a0a0a0] overflow-hidden"
                        >
                            <div className="flex bg-[#e8e8e8] border-b border-[#c0c0c0] pt-2 px-2 gap-1 overflow-x-auto">
                                {tabs.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-[13px] border border-b-0 rounded-t whitespace-nowrap ${
                                            activeTab === tab 
                                            ? 'bg-white border-[#c0c0c0] text-gray-800' 
                                            : 'bg-[#e0e0e0] border-transparent text-gray-600 hover:bg-[#d5d5d5]'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="bg-white p-8">
                                <h2 className="text-[#666] text-[22px] font-bold uppercase tracking-wide border-b-[3px] border-dotted border-[#ccc] pb-4 mb-6">
                                    {selectedProcess.title}
                                </h2>
                                
                                <div className="flex justify-end items-center gap-2 mb-6 text-sm text-[#444]">
                                    <span className="font-medium">Filtrar:</span>
                                    <select className="border border-gray-300 rounded px-2 py-1 bg-white outline-none">
                                        <option>Todos</option>
                                    </select>
                                    <ArrowDownAZ className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors"/>
                                    <ArrowUpZA className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors"/>
                                </div>
                                
                                <div className="space-y-1">
                                    {listItems.map(item => (
                                        <div 
                                            key={item} 
                                            onClick={() => handleNavigation(item)} // <--- CONEXIÓN AL HACER CLIC
                                            className="text-[#333] font-bold text-[13px] cursor-pointer hover:bg-gray-100 px-2 py-1.5 flex items-center transition-colors rounded"
                                        >
                                            <span className="bg-[#666] text-white w-[14px] h-[14px] flex items-center justify-center mr-3 shadow-sm">
                                                <Plus size={10} strokeWidth={4} />
                                            </span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-10">
                                    <button 
                                        onClick={() => setSelectedProcess(null)} 
                                        className="bg-gradient-to-b from-[#f9f9f9] to-[#e6e6e6] border border-[#ccc] text-[#333] px-6 py-1.5 rounded shadow-sm hover:from-[#f0f0f0] hover:to-[#d9d9d9] font-bold text-sm"
                                    >
                                        Volver
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};