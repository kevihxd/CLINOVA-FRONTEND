import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Award, Users, Stethoscope, HeartPulse, Bed, Activity, FlaskConical, Pill, Scan, Wind, Ambulance, UserCog, BadgeDollarSign, Building2, ShoppingCart, MonitorSmartphone, Leaf, ArrowRight, Printer, Download } from 'lucide-react';

export const MapaProcesos = () => {
    const [selectedProcess, setSelectedProcess] = useState(null);

    const procesosEstrategicos = [
        { id: 'PE1', title: 'Direccionamiento Estratégico', icon: Target, color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { id: 'PE2', title: 'Gestión de la Calidad', icon: Award, color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { id: 'PE3', title: 'SIAU', icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200' }
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
            onClick={() => setSelectedProcess(process)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 shadow-sm transition-all h-28 w-full ${process.color} hover:shadow-md cursor-pointer`}
        >
            <process.icon className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold text-center leading-tight">{process.title}</span>
        </motion.button>
    );

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
                {selectedProcess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
                        >
                            <div className="px-6 py-4 flex items-center justify-between text-white bg-slate-800">
                                <div className="flex items-center gap-3">
                                    <selectedProcess.icon className="w-6 h-6 text-blue-400" />
                                    <h2 className="text-xl font-bold">Gestión de Proceso: {selectedProcess.title}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Imprimir Formato"><Printer className="w-5 h-5" /></button>
                                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Descargar PDF"><Download className="w-5 h-5" /></button>
                                    <div className="w-px h-6 bg-slate-600 mx-2"></div>
                                    <button onClick={() => setSelectedProcess(null)} className="p-2 hover:bg-red-500 rounded-full transition-colors bg-white/10"><X className="w-5 h-5" /></button>
                                </div>
                            </div>
                            
                            <div className="p-8 flex-1 overflow-y-auto bg-slate-50">
                                <div className="bg-white border border-slate-300 shadow-sm max-w-5xl mx-auto text-sm">
                                    
                                    <div className="grid grid-cols-12 border-b border-slate-300">
                                        <div className="col-span-3 border-r border-slate-300 p-4 flex items-center justify-center bg-slate-50">
                                            <div className="w-24 h-12 bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-500 font-bold text-xs rounded">LOGO IPS</div>
                                        </div>
                                        <div className="col-span-6 border-r border-slate-300 p-4 flex items-center justify-center text-center bg-white">
                                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Caracterización de Proceso</h2>
                                        </div>
                                        <div className="col-span-3 p-2 flex flex-col justify-center gap-1 text-xs text-slate-600 bg-slate-50">
                                            <div className="flex justify-between border-b border-slate-200 pb-1"><strong>Código:</strong> <span>F-CA-{selectedProcess.id}</span></div>
                                            <div className="flex justify-between border-b border-slate-200 pb-1"><strong>Versión:</strong> <span>01</span></div>
                                            <div className="flex justify-between border-b border-slate-200 pb-1"><strong>Fecha:</strong> <span>Marzo 2024</span></div>
                                            <div className="flex justify-between"><strong>Página:</strong> <span>1 de 1</span></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 border-b border-slate-300">
                                        <div className="p-3 border-r border-slate-300 bg-blue-50/50">
                                            <strong className="text-blue-900 block mb-1">PROCESO:</strong>
                                            <span className="text-slate-700 uppercase">{selectedProcess.title}</span>
                                        </div>
                                        <div className="p-3 bg-blue-50/50">
                                            <strong className="text-blue-900 block mb-1">LÍDER DEL PROCESO:</strong>
                                            <span className="text-slate-700">Coordinador de {selectedProcess.title}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 border-b border-slate-300">
                                        <strong className="text-blue-900 block mb-1">1. OBJETIVO:</strong>
                                        <p className="text-slate-600">Establecer los lineamientos y actividades necesarias para garantizar la correcta ejecución de {selectedProcess.title.toLowerCase()} en la institución, asegurando la calidad y cumplimiento normativo.</p>
                                    </div>

                                    <div className="p-4 border-b border-slate-300">
                                        <strong className="text-blue-900 block mb-1">2. ALCANCE:</strong>
                                        <p className="text-slate-600">Inicia con la recepción de la necesidad o requerimiento y finaliza con la entrega del producto/servicio y la medición de satisfacción en el área correspondiente.</p>
                                    </div>

                                    <div className="grid grid-cols-5 text-center border-b border-slate-300">
                                        <div className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">PROVEEDORES</div>
                                        <div className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">ENTRADAS</div>
                                        <div className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">ACTIVIDADES (PHVA)</div>
                                        <div className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">SALIDAS</div>
                                        <div className="bg-slate-100 p-2 font-bold text-slate-700">CLIENTES</div>
                                    </div>

                                    <div className="grid grid-cols-5 border-b border-slate-300 min-h-[200px]">
                                        <div className="p-3 border-r border-slate-300 text-slate-600 space-y-2">
                                            <p>• Procesos Estratégicos</p>
                                            <p>• Pacientes / Usuarios</p>
                                            <p>• Entes de Control</p>
                                        </div>
                                        <div className="p-3 border-r border-slate-300 text-slate-600 space-y-2">
                                            <p>• Directrices</p>
                                            <p>• Solicitudes de servicio</p>
                                            <p>• Normativa vigente</p>
                                        </div>
                                        <div className="p-3 border-r border-slate-300 text-slate-600 space-y-4">
                                            <div><strong className="text-slate-800">Planear (P):</strong><br/>- Definición de cronogramas.<br/>- Asignación de recursos.</div>
                                            <div><strong className="text-slate-800">Hacer (H):</strong><br/>- Ejecución de las actividades operativas del proceso.</div>
                                            <div><strong className="text-slate-800">Verificar (V):</strong><br/>- Seguimiento a indicadores.<br/>- Auditorías internas.</div>
                                            <div><strong className="text-slate-800">Actuar (A):</strong><br/>- Planes de mejora.</div>
                                        </div>
                                        <div className="p-3 border-r border-slate-300 text-slate-600 space-y-2">
                                            <p>• Informes de gestión</p>
                                            <p>• Servicios prestados</p>
                                            <p>• Registros de calidad</p>
                                        </div>
                                        <div className="p-3 text-slate-600 space-y-2">
                                            <p>• Procesos de Apoyo</p>
                                            <p>• Pacientes / Familiares</p>
                                            <p>• Gerencia</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 border-b border-slate-300">
                                        <div className="p-3 border-r border-slate-300">
                                            <strong className="text-blue-900 block mb-2 border-b border-slate-200 pb-1">RECURSOS HUMANOS</strong>
                                            <ul className="list-disc pl-4 text-slate-600 space-y-1">
                                                <li>Personal médico/asistencial</li>
                                                <li>Personal administrativo</li>
                                            </ul>
                                        </div>
                                        <div className="p-3 border-r border-slate-300">
                                            <strong className="text-blue-900 block mb-2 border-b border-slate-200 pb-1">INFRAESTRUCTURA</strong>
                                            <ul className="list-disc pl-4 text-slate-600 space-y-1">
                                                <li>Equipos de cómputo</li>
                                                <li>Instalaciones físicas</li>
                                            </ul>
                                        </div>
                                        <div className="p-3">
                                            <strong className="text-blue-900 block mb-2 border-b border-slate-200 pb-1">SOFTWARE / SISTEMAS</strong>
                                            <ul className="list-disc pl-4 text-slate-600 space-y-1">
                                                <li>Sistema Clínico (HIS)</li>
                                                <li>Plataforma de Calidad</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 flex items-center justify-between">
                                        <span className="text-slate-500 italic">Documento controlado por el Sistema de Gestión de Calidad.</span>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                                            Editar Formato
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};