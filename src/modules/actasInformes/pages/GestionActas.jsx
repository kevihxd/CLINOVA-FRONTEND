import React, { useState, useEffect } from 'react';
import { Search, FileText, CalendarDays, ChevronDown, Plus, Download, Eye, Edit, Trash2, Target, Hourglass, CheckCircle2, X, FilePlus, Copy, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';

const StatCard = ({ icon: Icon, iconColor, title, value, subValue, subLabel }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4 shadow-sm">
        <div className={`p-3 rounded-full ${iconColor} bg-opacity-10 text-xl`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-1">
                <span className="font-semibold text-gray-600">{subValue}</span> {subLabel}
            </p>
        </div>
    </div>
);

const getStatusStyles = (estado) => {
    switch (estado) {
        case 'Publicada': return 'bg-green-100 text-green-700';
        case 'Borrador': return 'bg-orange-100 text-orange-700';
        case 'Archivada': return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

export const GestionActas = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { user } = useAuth(); 
    
    const [actas, setActas] = useState([]);
    const [plantillas, setPlantillas] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createMode, setCreateMode] = useState('zero');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [activeTab, setActiveTab] = useState('actas');

    const fetchData = async () => {
        try {
            const [resActas, resPlantillas] = await Promise.all([
                http.get('/actas'),
                http.get('/plantillas')
            ]);
            setActas(resActas.data?.data || resActas.data || []);
            setPlantillas(resPlantillas.data?.data || resPlantillas.data || []);
        } catch (error) {
            showAlert({ message: 'Error al cargar los datos. Verifique conexión con el servidor.', status: 'error' });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const puedeEditarActa = (acta) => {
        if (!user) return false;
        if (user.rol === 'ADMIN') return true; 
        if (user.rol === 'LIDER_DE_PROCESO') {

            return acta.responsable === user.username; 
        }
        return false;
    };

    const handleEliminarActa = async (id) => {
        if (!window.confirm('¿Seguro que desea eliminar esta acta?')) return;
        try {
            await http.delete(`/actas/${id}`);
            showAlert({ message: 'Acta eliminada', status: 'success' });
            fetchData();
        } catch (error) {
            showAlert({ message: 'Error al eliminar acta', status: 'error' });
        }
    };

    const handleEliminarPlantilla = async (id) => {
        if (!window.confirm('¿Seguro que desea eliminar esta plantilla de forma permanente?')) return;
        try {
            await http.delete(`/plantillas/${id}`);
            showAlert({ message: 'Plantilla eliminada', status: 'success' });
            fetchData();
        } catch (error) {
            showAlert({ message: 'Error al eliminar la plantilla', status: 'error' });
        }
    };

    const handleContinuar = () => {
        if (createMode === 'template' && selectedTemplate) {
            navigate(`/actas-informes/crear-acta?plantillaId=${selectedTemplate}`);
        } else {
            navigate('/actas-informes/crear-acta');
        }
    };

    const filteredActas = actas.filter(a => a.titulo?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredPlantillas = plantillas.filter(p => p.titulo?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <span>Inicio</span> / <span>Actas y Reportes</span> / <span className="text-gray-500">Gestión</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-1.5 uppercase">Gestión Documental</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/actas-informes/crear-plantilla')} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-indigo-300 text-indigo-700 rounded text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                            <LayoutTemplate className="w-4 h-4" /> Nueva Plantilla
                        </button>
                        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus className="w-4 h-4" /> Crear Acta
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={Target} iconColor="text-blue-600" title="TOTAL ACTAS" value={actas.length} subValue={actas.filter(a => a.estado === 'Publicada').length} subLabel="Publicadas" />
                    <StatCard icon={Hourglass} iconColor="text-orange-600" title="ACTAS BORRADOR" value={actas.filter(a => a.estado === 'Borrador').length} subValue="0" subLabel="Pendientes Firma" />
                    <StatCard icon={CheckCircle2} iconColor="text-indigo-600" title="PLANTILLAS MAESTRAS" value={plantillas.length} subValue="" subLabel="Activas en sistema" />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-gray-50 px-5 pt-3">
                        <button 
                            onClick={() => setActiveTab('actas')} 
                            className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'actas' ? 'border-b-2 border-blue-600 text-blue-600 bg-white rounded-t-lg' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Actas Generadas
                        </button>
                        <button 
                            onClick={() => setActiveTab('plantillas')} 
                            className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'plantillas' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white rounded-t-lg' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Plantillas Maestras
                        </button>
                    </div>

                    <div className="p-5 border-b border-gray-100">
                        <div className="relative max-w-lg">
                            <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm outline-none bg-white placeholder:text-gray-400" 
                                placeholder={`Buscar en ${activeTab === 'actas' ? 'actas' : 'plantillas'}...`} 
                            />
                        </div>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Título</th>
                                <th className="px-6 py-4 font-semibold">{activeTab === 'actas' ? 'Fecha' : 'Descripción'}</th>
                                {activeTab === 'actas' && <th className="px-6 py-4 font-semibold">Tipo</th>}
                                {activeTab === 'actas' && <th className="px-6 py-4 font-semibold">Estado</th>}
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activeTab === 'actas' ? (
                                filteredActas.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No se encontraron actas registradas.</td></tr>
                                ) : filteredActas.map((acta) => (
                                    <tr key={acta.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">ACT-{acta.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="font-semibold text-gray-800">{acta.titulo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{acta.fecha}</td>
                                        <td className="px-6 py-4 text-gray-600">{acta.tipo}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyles(acta.estado)}`}>
                                                {acta.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                               
                                                <button 
                                                    onClick={() => navigate(`/actas-informes/acta/${acta.id}`)} 
                                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors" 
                                                    title="Ver / Comentar"
                                                >
                                                    <Eye className="w-4.5 h-4.5" />
                                                </button>

                                                {puedeEditarActa(acta) && (
                                                    <>
                                                        <button 
                                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" 
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4.5 h-4.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEliminarActa(acta.id)} 
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredPlantillas.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay plantillas maestras creadas.</td></tr>
                                ) : filteredPlantillas.map((plantilla) => (
                                    <tr key={plantilla.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">TPL-{plantilla.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <LayoutTemplate className="w-4 h-4 text-indigo-400 shrink-0" />
                                                <span className="font-semibold text-indigo-900">{plantilla.titulo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 italic">{plantilla.descripcion || 'Sin descripción'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button 
                                                    onClick={() => navigate(`/actas-informes/crear-plantilla?editId=${plantilla.id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" 
                                                    title="Editar Plantilla"
                                                >
                                                    <Edit className="w-4.5 h-4.5" />
                                                </button>
                                                <button onClick={() => handleEliminarPlantilla(plantilla.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar Plantilla">
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Crear Nueva Acta</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <button 
                                onClick={() => setCreateMode('zero')}
                                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${createMode === 'zero' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                            >
                                <div className={`p-2.5 rounded-lg ${createMode === 'zero' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    <FilePlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className={`font-bold ${createMode === 'zero' ? 'text-blue-900' : 'text-gray-800'}`}>Crear desde cero</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Comenzar con un documento en blanco</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setCreateMode('template')}
                                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${createMode === 'template' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                            >
                                <div className={`p-2.5 rounded-lg ${createMode === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    <Copy className="w-5 h-5" />
                                </div>
                                <div className="w-full">
                                    <h3 className={`font-bold ${createMode === 'template' ? 'text-blue-900' : 'text-gray-800'}`}>Usar una plantilla</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Seleccionar un formato predefinido</p>
                                    
                                    {createMode === 'template' && (
                                        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Seleccionar Plantilla</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedTemplate}
                                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                                    className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white text-gray-700"
                                                >
                                                    <option value="" disabled>Seleccione una plantilla...</option>
                                                    {plantillas.map(temp => (
                                                        <option key={temp.id} value={temp.id}>{temp.titulo}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button 
                                onClick={handleContinuar}
                                disabled={createMode === 'template' && !selectedTemplate}
                                className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};