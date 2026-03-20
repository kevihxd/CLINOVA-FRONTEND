import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Award, Users, Stethoscope, HeartPulse, Bed, Activity, FlaskConical, Pill, Scan, Wind, Ambulance, UserCog, BadgeDollarSign, Building2, ShoppingCart, MonitorSmartphone, Leaf, ArrowRight, ArrowDownAZ, ArrowUpZA, Plus, Minus, Upload, FileText, FileUp } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { useAlert } from '../../../providers/AlertProvider';

export const MapaProcesos = () => {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const userRole = String(user?.rol || user?.role || user?.roles?.[0] || 'USER').toUpperCase();
    const isAdmin = userRole.includes('ADMIN');

    const [selectedProcess, setSelectedProcess] = useState(null);
    const [activeTab, setActiveTab] = useState('Documentos');
    const [expandedCategory, setExpandedCategory] = useState(null);
    
    const [uploadConfig, setUploadConfig] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [documentName, setDocumentName] = useState('');
    
    const fileInputRef = useRef(null);

    // Definición de las categorías dinámicas según lo solicitado
    const getCategorias = (title) => {
        if (title === 'Gestión Comercial y Mercadeo') {
            return ['FORMATO', 'CARACTERIZACIÓN', 'INDICADOR', 'MANUAL', 'PLAN', 'POLITICA', 'PROCEDIMIENTO'];
        }
        if (title === 'Direccionamiento Estratégico') {
            return ['FORMATO', 'REGISTRO', 'CARACTERIZACIÓN', 'MANUAL', 'PROCEDIMIENTO', 'REGLAMENTO'];
        }
        return ['FORMATO', 'CARACTERIZACIÓN', 'INDICADOR', 'MANUAL', 'PROCEDIMIENTO'];
    };

    const procesosEstrategicos = [
        { id: 'PE1', title: 'Direccionamiento Estratégico', icon: Target, color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { id: 'PE2', title: 'Gestión de la Calidad', icon: Award, color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { id: 'PE3', title: 'SIAU', icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200' },
        // Agregando este aquí temporalmente para que veas el ejemplo de las categorías que pediste
        { id: 'PE4', title: 'Gestión Comercial y Mercadeo', icon: Target, color: 'bg-blue-50 text-blue-700 border-blue-200' }
    ];

    const procesosMisionales = [
        {
            category: 'Consulta Externa',
            items: [
                { id: 'PM1_1', title: 'Medicina General', icon: Stethoscope, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { id: 'PM1_2', title: 'Enfermería', icon: HeartPulse, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
            ]
        },
        {
            category: 'Internación',
            items: [
                { id: 'PM2_1', title: 'Hospitalización', icon: Bed, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { id: 'PM2_2', title: 'Cuidado Intermedio', icon: Activity, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
            ]
        },
        {
            category: 'Apoyo Diagnóstico y Terapéutico',
            items: [
                { id: 'PM3_1', title: 'Laboratorio Clínico', icon: FlaskConical, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { id: 'PM3_2', title: 'Servicio Farmacéutico', icon: Pill, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { id: 'PM3_3', title: 'Imágenes Diagnósticas', icon: Scan, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { id: 'PM3_4', title: 'Terapia Respiratoria', icon: Wind, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
            ]
        },
        {
            category: 'Atención de Urgencias',
            items: [
                { id: 'PM4_1', title: 'Atención de Urgencias', icon: Ambulance, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
            ]
        }
    ];

    const procesosApoyo = [
        { id: 'PA1', title: 'Gestión de Talento Humano', icon: UserCog, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        { id: 'PA2', title: 'Gestión Financiera', icon: BadgeDollarSign, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        { id: 'PA3', title: 'Gestión de Infraestructura', icon: Building2, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        { id: 'PA4', title: 'Gestión de Compras e Insumos', icon: ShoppingCart, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        { id: 'PA5', title: 'Gestión de Sistemas de Información', icon: MonitorSmartphone, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        { id: 'PA6', title: 'Gestión Ambiental', icon: Leaf, color: 'bg-orange-50 text-orange-700 border-orange-200' }
    ];

    const ProcessCard = ({ process }) => (
        <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                setSelectedProcess(process);
                setExpandedCategory(null);
                setActiveTab('Documentos');
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 shadow-sm transition-all h-28 w-full ${process.color} hover:shadow-md cursor-pointer`}
        >
            <process.icon className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold text-center leading-tight">{process.title}</span>
        </motion.button>
    );

    const tabs = ['Documentos', 'Acciones de Mejora', 'Actas', 'Indicadores', 'Contexto'];

    const handleCategoryClick = (category) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    const handleOpenUpload = (category, e) => {
        e.stopPropagation();
        setUploadConfig({ processId: selectedProcess.id, processTitle: selectedProcess.title, category });
        setFileToUpload(null);
        setDocumentName('');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
            if (!documentName) {
                setDocumentName(e.target.files[0].name.split('.')[0]);
            }
        }
    };

    const handleSimulateUpload = (e) => {
        e.preventDefault();
        if (!fileToUpload || !documentName) return;
        
        showAlert({ message: `Documento "${documentName}" preparado para subir. (Pendiente conexión backend)`, status: 'success' });
        setUploadConfig(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mapa de Procesos</h1>
                    <p className="text-slate-500 mt-2">Sistema de Gestión de Calidad - IPS</p>
                </div>

                <div className="relative bg-white p-6 md:p-12 rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex items-center">
                    
                    <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-14 bg-blue-600 h-[80%] rounded-r-3xl items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold -rotate-90 whitespace-nowrap tracking-wider text-sm uppercase">
                            Necesidades y expectativas
                        </span>
                    </div>

                    <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-14 bg-green-600 h-[80%] rounded-l-3xl items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold -rotate-90 whitespace-nowrap tracking-wider text-sm uppercase">
                            Satisfacción del cliente
                        </span>
                    </div>

                    <div className="w-full lg:px-20 space-y-10 relative z-0">
                        
                        <div className="relative">
                            <div className="absolute inset-0 border-2 border-blue-100 rounded-3xl -z-10 bg-blue-50/30"></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-md">
                                Procesos Estratégicos
                            </div>
                            <div className="pt-10 pb-6 px-6 flex flex-wrap justify-center gap-4 md:gap-8">
                                {procesosEstrategicos.map(p => (
                                    <div key={p.id} className="w-40">
                                        <ProcessCard process={p} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center w-full">
                            <ArrowRight className="hidden md:block absolute left-[-2rem] text-blue-300 w-10 h-10" />
                            
                            <div className="w-full relative">
                                <div className="absolute inset-0 border-2 border-emerald-100 rounded-3xl -z-10 bg-emerald-50/30"></div>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-md">
                                    Procesos Misionales
                                </div>
                                <div className="pt-12 pb-8 px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                    {procesosMisionales.map(cat => (
                                        <div key={cat.category} className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                                            <h3 className="text-center font-extrabold text-emerald-800 text-xs uppercase tracking-wider mb-2">{cat.category}</h3>
                                            <div className="flex flex-col gap-3 flex-1 justify-start">
                                                {cat.items.map(p => <ProcessCard key={p.id} process={p} />)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <ArrowRight className="hidden md:block absolute right-[-2rem] text-green-300 w-10 h-10" />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 border-2 border-orange-100 rounded-3xl -z-10 bg-orange-50/30"></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-md">
                                Procesos de Apoyo
                            </div>
                            <div className="pt-10 pb-6 px-6 flex flex-wrap justify-center gap-4 md:gap-6">
                                {procesosApoyo.map(p => (
                                    <div key={p.id} className="w-40">
                                        <ProcessCard process={p} />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedProcess && !uploadConfig && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#f2f2f2] w-full max-w-4xl rounded shadow-2xl flex flex-col font-sans border border-[#a0a0a0] overflow-hidden max-h-[90vh]"
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
                            
                            <div className="bg-white p-8 overflow-y-auto">
                                <h2 className="text-[#666] text-[22px] font-bold uppercase tracking-wide border-b-[3px] border-dotted border-[#ccc] pb-4 mb-6">
                                    {selectedProcess.title}
                                </h2>
                                
                                <div className="flex justify-end items-center gap-2 mb-6 text-sm text-[#444]">
                                    <span className="font-medium">Filtrar:</span>
                                    <select className="border border-gray-300 rounded px-2 py-1 bg-white outline-none focus:border-blue-500">
                                        <option>Todos</option>
                                    </select>
                                    <ArrowDownAZ className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors"/>
                                    <ArrowUpZA className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors"/>
                                </div>
                                
                                <div className="space-y-1">
                                    {getCategorias(selectedProcess.title).map(cat => (
                                        <div key={cat} className="mb-1">
                                            <div 
                                                onClick={() => handleCategoryClick(cat)}
                                                className="text-[#333] font-bold text-[13px] cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3 py-2 flex items-center justify-between transition-colors rounded shadow-sm"
                                            >
                                                <div className="flex items-center">
                                                    <span className="bg-[#666] text-white w-[14px] h-[14px] flex items-center justify-center mr-3 shadow-sm rounded-sm">
                                                        {expandedCategory === cat ? <Minus size={10} strokeWidth={4} /> : <Plus size={10} strokeWidth={4} />}
                                                    </span>
                                                    {cat}
                                                </div>
                                                
                                                {isAdmin && (
                                                    <button 
                                                        onClick={(e) => handleOpenUpload(cat, e)}
                                                        className="text-blue-600 hover:text-white hover:bg-blue-600 p-1.5 rounded transition-colors flex items-center gap-1 text-xs"
                                                        title={`Subir nuevo ${cat}`}
                                                    >
                                                        <Upload size={14} /> Subir
                                                    </button>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {expandedCategory === cat && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="ml-5 border-l-2 border-dashed border-gray-200 pl-4 py-3 my-1">
                                                            <div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-lg border border-gray-100 text-gray-400">
                                                                <FileText size={32} className="mb-2 opacity-50" />
                                                                <p className="text-sm">No hay documentos cargados en esta categoría.</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-10 pt-4 border-t border-gray-200">
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

            <AnimatePresence>
                {uploadConfig && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2">
                                    <FileUp size={18} /> Subir Documento
                                </h3>
                                <button onClick={() => setUploadConfig(null)} className="hover:bg-blue-700 p-1 rounded-full"><X size={20} /></button>
                            </div>
                            
                            <form onSubmit={handleSimulateUpload} className="p-6 space-y-5">
                                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded border border-blue-100">
                                    <strong>Proceso:</strong> {uploadConfig.processTitle}<br/>
                                    <strong>Categoría:</strong> {uploadConfig.category}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Nombre del documento</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        placeholder="Ej: Formato de ingreso v2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Archivo (PDF, Word, Excel)</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors"
                                    >
                                        <Upload className={`w-8 h-8 mb-2 ${fileToUpload ? 'text-green-500' : 'text-gray-400'}`} />
                                        <span className="text-sm font-medium text-gray-600 text-center">
                                            {fileToUpload ? fileToUpload.name : 'Haz clic aquí para seleccionar el archivo'}
                                        </span>
                                        <input 
                                            type="file" 
                                            required
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            className="hidden" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                    <button type="button" onClick={() => setUploadConfig(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 font-medium text-sm">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 font-medium text-sm flex items-center gap-2">
                                        <Upload size={16} /> Guardar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};