import React, { useState, useEffect } from 'react';
import { UserCircle, Search, Edit, Save, X, Briefcase } from 'lucide-react';

export const PerfilesCargos = () => {
    const [cargos, setCargos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCargo, setSelectedCargo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [perfilForm, setPerfilForm] = useState({
        mision: '',
        responsabilidades: '',
        requisitosEducacion: '',
        requisitosExperiencia: '',
        estado: 'ACTIVO'
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        fetchCargos();
    }, []);

    const fetchCargos = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/cargos', {
                headers: getAuthHeaders()
            });
            if (res.ok) setCargos(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPerfil = async (cargo) => {
        setSelectedCargo(cargo);
        setIsEditing(false);
        try {
            const res = await fetch(`http://localhost:8080/api/perfiles-cargo/cargo/${cargo.id}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setPerfilForm({
                    mision: data.mision || '',
                    responsabilidades: data.responsabilidades || '',
                    requisitosEducacion: data.requisitosEducacion || '',
                    requisitosExperiencia: data.requisitosExperiencia || '',
                    estado: data.estado || 'ACTIVO'
                });
            } else {
                setPerfilForm({
                    mision: '',
                    responsabilidades: '',
                    requisitosEducacion: '',
                    requisitosExperiencia: '',
                    estado: 'ACTIVO'
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                cargo: { id: selectedCargo.id },
                ...perfilForm
            };
            const res = await fetch('http://localhost:8080/api/perfiles-cargo', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsEditing(false);
                fetchCargos();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCargos = cargos.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Perfiles de Cargo</h1>
                            <p className="text-sm text-slate-500">Definición de responsabilidades y requisitos por cargo</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Buscar cargo..."
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-2 space-y-1 max-h-[700px] overflow-y-auto">
                            {filteredCargos.map(cargo => (
                                <button 
                                    key={cargo.id}
                                    onClick={() => fetchPerfil(cargo)}
                                    className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors flex items-center gap-3 ${
                                        selectedCargo?.id === cargo.id 
                                        ? 'bg-purple-50 border-purple-100 border text-purple-700 font-bold' 
                                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                                    }`}
                                >
                                    <UserCircle size={18} className={selectedCargo?.id === cargo.id ? 'text-purple-600' : 'text-slate-400'} />
                                    <span className="truncate">{cargo.nombre}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 lg:col-span-2 flex flex-col">
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800">
                                {selectedCargo ? `Perfil: ${selectedCargo.nombre}` : 'Seleccione un cargo'}
                            </h2>
                            {selectedCargo && !isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-bold hover:bg-purple-700 transition-colors"
                                >
                                    <Edit size={16} /> Editar Perfil
                                </button>
                            )}
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {!selectedCargo ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                                    <Briefcase size={48} className="opacity-20" />
                                    <p>Seleccione un cargo en el panel izquierdo para ver o editar su perfil</p>
                                </div>
                            ) : isEditing ? (
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Misión del Cargo</label>
                                            <textarea 
                                                value={perfilForm.mision} 
                                                onChange={(e) => setPerfilForm({...perfilForm, mision: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-purple-500 min-h-[100px]" 
                                                placeholder="Describa la misión principal..."
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Responsabilidades</label>
                                            <textarea 
                                                value={perfilForm.responsabilidades} 
                                                onChange={(e) => setPerfilForm({...perfilForm, responsabilidades: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-purple-500 min-h-[120px]" 
                                                placeholder="Liste las responsabilidades..."
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Requisitos de Educación</label>
                                            <textarea 
                                                value={perfilForm.requisitosEducacion} 
                                                onChange={(e) => setPerfilForm({...perfilForm, requisitosEducacion: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-purple-500 min-h-[80px]" 
                                                placeholder="Estudios requeridos..."
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Requisitos de Experiencia</label>
                                            <textarea 
                                                value={perfilForm.requisitosExperiencia} 
                                                onChange={(e) => setPerfilForm({...perfilForm, requisitosExperiencia: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-purple-500 min-h-[80px]" 
                                                placeholder="Experiencia previa necesaria..."
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsEditing(false)} 
                                            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-600 hover:bg-slate-50"
                                        >
                                            <X size={16} /> Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded text-sm font-bold hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Perfil'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-2">Misión del Cargo</h3>
                                        <p className="text-sm text-slate-700 whitespace-pre-line">{perfilForm.mision || 'No definida'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-2">Responsabilidades</h3>
                                        <p className="text-sm text-slate-700 whitespace-pre-line">{perfilForm.responsabilidades || 'No definidas'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-2">Requisitos de Educación</h3>
                                            <p className="text-sm text-slate-700 whitespace-pre-line">{perfilForm.requisitosEducacion || 'No definidos'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-2">Requisitos de Experiencia</h3>
                                            <p className="text-sm text-slate-700 whitespace-pre-line">{perfilForm.requisitosExperiencia || 'No definidos'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};