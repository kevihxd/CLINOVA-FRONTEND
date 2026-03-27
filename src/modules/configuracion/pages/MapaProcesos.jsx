import React from 'react';
import { Target, Award, Briefcase, PenTool, Settings, Truck, Users, UserCheck, DollarSign, ShoppingCart, Monitor, Wrench, ClipboardCheck, TrendingUp, Plus, MoreVertical } from 'lucide-react';

const ESTRATEGICOS = [
    { id: 1, title: 'Gestión Estratégica', subCount: 3, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, title: 'Gestión de Calidad', subCount: 5, icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' }
];

const MISIONALES = [
    { id: 3, title: 'Gestión Comercial', subCount: 4, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 4, title: 'Diseño y Desarrollo', subCount: 6, icon: PenTool, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 5, title: 'Producción', subCount: 8, icon: Settings, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 6, title: 'Logística y Distribución', subCount: 4, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 7, title: 'Servicio al Cliente', subCount: 3, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' }
];

const APOYO = [
    { id: 8, title: 'Gestión Humana', subCount: 7, icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 9, title: 'Gestión Financiera', subCount: 5, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 10, title: 'Compras y Proveedores', subCount: 4, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 11, title: 'Tecnología (TI)', subCount: 3, icon: Monitor, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 12, title: 'Mantenimiento', subCount: 2, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' }
];

const EVALUACION = [
    { id: 13, title: 'Auditoría Interna', subCount: 3, icon: ClipboardCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 14, title: 'Mejora Continua', subCount: 4, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' }
];

export const MapaProcesos = () => {
    
    const ProcessCard = ({ card }) => (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative group cursor-pointer">
            <button className="absolute top-3 right-3 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
            </button>
            <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${card.bg} ${card.color} shrink-0`}>
                    <card.icon size={20} />
                </div>
                <div className="pr-4">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{card.title}</h4>
                    <p className="text-xs font-medium text-slate-500">{card.subCount} subprocesos</p>
                </div>
            </div>
        </div>
    );

    const ProcessColumn = ({ title, count, colorLine, items }) => (
        <div className="bg-slate-50 rounded-xl flex flex-col overflow-hidden border border-slate-100">
            <div className={`h-1.5 w-full ${colorLine}`} />
            <div className="p-4 flex items-center justify-between border-b border-slate-200/60 bg-slate-100/50">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">{title}</h3>
                <span className="bg-white text-slate-600 text-xs font-bold px-2.5 py-1 rounded shadow-sm border border-slate-200">{count}</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
                {items.map(card => <ProcessCard key={card.id} card={card} />)}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white p-6 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                            <span>Inicio</span> / <span>Procesos</span> / <span className="text-slate-600">Mapa de Procesos</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mapa de Procesos</h1>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={18} /> Nuevo Proceso
                    </button>
                </div>

                {/* Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                    <ProcessColumn title="Estratégicos" count={ESTRATEGICOS.length} colorLine="bg-blue-500" items={ESTRATEGICOS} />
                    <ProcessColumn title="Misionales" count={MISIONALES.length} colorLine="bg-emerald-500" items={MISIONALES} />
                    <ProcessColumn title="Apoyo" count={APOYO.length} colorLine="bg-amber-500" items={APOYO} />
                    <ProcessColumn title="Evaluación" count={EVALUACION.length} colorLine="bg-rose-500" items={EVALUACION} />
                </div>

            </div>
        </div>
    );
};