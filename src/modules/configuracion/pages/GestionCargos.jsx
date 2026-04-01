import React, { useState, useEffect } from 'react';
import { Shield, Save, Users, CheckSquare, Square, Plus, X, Edit } from 'lucide-react';

export const GestionCargos = () => {
    const [cargos, setCargos] = useState([]);
    const [permisosGlobales, setPermisosGlobales] = useState([]);
    const [cargoSeleccionado, setCargoSeleccionado] = useState(null);
    const [permisosAsignados, setPermisosAsignados] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [showNuevoModal, setShowNuevoModal] = useState(false);
    const [nuevoCargoNombre, setNuevoCargoNombre] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [editCargoNombre, setEditCargoNombre] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [cargosRes, permisosRes] = await Promise.all([
                fetch('http://localhost:8080/api/cargos', { headers: getAuthHeaders() }),
                fetch('http://localhost:8080/api/cargos/permisos', { headers: getAuthHeaders() })
            ]);
            
            if (cargosRes.ok && permisosRes.ok) {
                setCargos(await cargosRes.json());
                setPermisosGlobales(await permisosRes.json());
            }
        } catch (error) {
            console.error(error);
        }
    };

    const crearCargo = async (e) => {
        e.preventDefault();
        if (!nuevoCargoNombre.trim()) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/cargos', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: nuevoCargoNombre.trim() })
            });

            if (response.ok) {
                setNuevoCargoNombre('');
                setShowNuevoModal(false);
                cargarDatos();
            } else {
                alert('Error al crear el cargo. Verifique sus permisos o si el nombre ya existe.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const guardarEdicionCargo = async (e) => {
        e.preventDefault();
        if (!editCargoNombre.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/cargos/${cargoSeleccionado.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: editCargoNombre.trim() })
            });

            if (response.ok) {
                const cargoActualizado = await response.json();
                setCargoSeleccionado({ ...cargoSeleccionado, nombre: cargoActualizado.nombre });
                setShowEditModal(false);
                cargarDatos();
            } else {
                alert('Error al actualizar el cargo. Verifique sus permisos o si el nombre ya existe.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const seleccionarCargo = (cargo) => {
        setCargoSeleccionado(cargo);
        setPermisosAsignados(cargo.permisos ? cargo.permisos.map(p => p.id) : []);
    };

    const abrirModalEdicion = () => {
        if (!cargoSeleccionado) return;
        setEditCargoNombre(cargoSeleccionado.nombre);
        setShowEditModal(true);
    };

    const togglePermiso = (permisoId) => {
        if (permisosAsignados.includes(permisoId)) {
            setPermisosAsignados(permisosAsignados.filter(id => id !== permisoId));
        } else {
            setPermisosAsignados([...permisosAsignados, permisoId]);
        }
    };

    const guardarPermisos = async () => {
        if (!cargoSeleccionado) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/cargos/${cargoSeleccionado.id}/permisos`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(permisosAsignados)
            });

            if (response.ok) {
                cargarDatos();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            <div className="max-w-[1200px] mx-auto space-y-6">
                
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestión de Roles y Permisos</h1>
                        <p className="text-sm text-slate-500">Configura los accesos del sistema según el cargo del empleado</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 flex flex-col">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-bold text-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-indigo-500" />
                                Cargos
                            </div>
                            <button 
                                onClick={() => setShowNuevoModal(true)}
                                className="p-1.5 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="p-2 space-y-1 flex-1 overflow-y-auto max-h-[600px]">
                            {cargos.map(cargo => (
                                <button 
                                    key={cargo.id}
                                    onClick={() => seleccionarCargo(cargo)}
                                    className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors ${
                                        cargoSeleccionado?.id === cargo.id 
                                        ? 'bg-indigo-50 border-indigo-100 border text-indigo-700 font-bold' 
                                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                                    }`}
                                >
                                    {cargo.nombre}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 lg:col-span-2 flex flex-col">
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="font-bold text-slate-800">
                                    {cargoSeleccionado ? `Permisos: ${cargoSeleccionado.nombre}` : 'Seleccione un cargo para ver sus permisos'}
                                </h2>
                                {cargoSeleccionado && (
                                    <button 
                                        onClick={abrirModalEdicion}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                        title="Editar nombre del cargo"
                                    >
                                        <Edit size={16} />
                                    </button>
                                )}
                            </div>
                            {cargoSeleccionado && (
                                <button 
                                    onClick={guardarPermisos}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            )}
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {!cargoSeleccionado ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                                    <Shield size={48} className="opacity-20" />
                                    <p>Selecciona un cargo en el panel izquierdo</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {permisosGlobales.map(permiso => {
                                        const tienePermiso = permisosAsignados.includes(permiso.id);
                                        return (
                                            <div 
                                                key={permiso.id}
                                                onClick={() => togglePermiso(permiso.id)}
                                                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                    tienePermiso 
                                                    ? 'border-indigo-500 bg-indigo-50/50' 
                                                    : 'border-slate-200 hover:border-indigo-200'
                                                }`}
                                            >
                                                <div className="mt-0.5">
                                                    {tienePermiso ? (
                                                        <CheckSquare size={20} className="text-indigo-600" />
                                                    ) : (
                                                        <Square size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-sm ${tienePermiso ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                        {permiso.nombre}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {permiso.descripcion || 'Permiso del sistema CLINOVA'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showNuevoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Crear Nuevo Cargo</h2>
                            <button onClick={() => setShowNuevoModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={crearCargo} className="p-6 space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Nombre del Cargo</label>
                                <input 
                                    type="text" 
                                    required
                                    autoFocus
                                    value={nuevoCargoNombre}
                                    onChange={(e) => setNuevoCargoNombre(e.target.value)}
                                    placeholder="Ej: Coordinador de Calidad"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowNuevoModal(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : 'Guardar Cargo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Editar Nombre de Cargo</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={guardarEdicionCargo} className="p-6 space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Nombre del Cargo</label>
                                <input 
                                    type="text" 
                                    required
                                    autoFocus
                                    value={editCargoNombre}
                                    onChange={(e) => setEditCargoNombre(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Actualizando...' : 'Actualizar Cargo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};