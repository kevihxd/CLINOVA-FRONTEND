import React, { useState, useEffect } from 'react';
import { Shield, Save, Users, CheckSquare, Square, Plus, X, Edit, Package } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';

export const GestionCargos = () => {
    const [activeTab, setActiveTab] = useState('cargos'); // 'cargos' | 'objetos'

    // ── CARGOS state ──────────────────────────────────────────────────────────
    const [cargos, setCargos] = useState([]);
    const [permisosGlobales, setPermisosGlobales] = useState([]);
    const [cargoSeleccionado, setCargoSeleccionado] = useState(null);
    const [permisosAsignados, setPermisosAsignados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showNuevoCargoModal, setShowNuevoCargoModal] = useState(false);
    const [nuevoCargoNombre, setNuevoCargoNombre] = useState('');
    const [showEditCargoModal, setShowEditCargoModal] = useState(false);
    const [editCargoNombre, setEditCargoNombre] = useState('');

    // ── OBJETOS state ─────────────────────────────────────────────────────────
    const [objetos, setObjetos] = useState([]);
    const [objetoSeleccionado, setObjetoSeleccionado] = useState(null);
    const [showNuevoObjetoModal, setShowNuevoObjetoModal] = useState(false);
    const [nuevoObjetoNombre, setNuevoObjetoNombre] = useState('');
    const [showEditObjetoModal, setShowEditObjetoModal] = useState(false);
    const [editObjetoNombre, setEditObjetoNombre] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    };

    useEffect(() => {
        cargarDatos();
        cargarObjetos();
    }, []);

    // ── CARGOS functions ──────────────────────────────────────────────────────
    const cargarDatos = async () => {
        try {
            const [cargosRes, permisosRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/v1/cargos`, { headers: getAuthHeaders() }),
                fetch(`${API_BASE_URL}/api/v1/cargos/permisos`, { headers: getAuthHeaders() })
            ]);
            if (cargosRes.ok && permisosRes.ok) {
                setCargos(await cargosRes.json());
                setPermisosGlobales(await permisosRes.json());
            }
        } catch (error) { console.error(error); }
    };

    const crearCargo = async (e) => {
        e.preventDefault();
        if (!nuevoCargoNombre.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/cargos`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: nuevoCargoNombre.trim() })
            });
            if (response.ok) {
                setNuevoCargoNombre('');
                setShowNuevoCargoModal(false);
                cargarDatos();
            } else {
                alert('Error al crear el cargo. Verifique sus permisos o si el nombre ya existe.');
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const guardarEdicionCargo = async (e) => {
        e.preventDefault();
        if (!editCargoNombre.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/cargos/${cargoSeleccionado.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: editCargoNombre.trim() })
            });
            if (response.ok) {
                const cargoActualizado = await response.json();
                setCargoSeleccionado({ ...cargoSeleccionado, nombre: cargoActualizado.nombre });
                setShowEditCargoModal(false);
                cargarDatos();
            } else {
                alert('Error al actualizar el cargo.');
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const seleccionarCargo = (cargo) => {
        setCargoSeleccionado(cargo);
        setPermisosAsignados(cargo.permisos ? cargo.permisos.map(p => p.id) : []);
    };

    const abrirModalEdicionCargo = () => {
        if (!cargoSeleccionado) return;
        setEditCargoNombre(cargoSeleccionado.nombre);
        setShowEditCargoModal(true);
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
            const response = await fetch(`${API_BASE_URL}/api/v1/cargos/${cargoSeleccionado.id}/permisos`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(permisosAsignados)
            });
            if (response.ok) cargarDatos();
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    // ── OBJETOS functions ─────────────────────────────────────────────────────
    const cargarObjetos = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/objetos`, { headers: getAuthHeaders() });
            if (res.ok) setObjetos(await res.json());
        } catch {}
    };

    const crearObjeto = async (e) => {
        e.preventDefault();
        if (!nuevoObjetoNombre.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/objetos`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: nuevoObjetoNombre.trim() })
            });
            if (response.ok) {
                setNuevoObjetoNombre('');
                setShowNuevoObjetoModal(false);
                cargarObjetos();
            } else {
                alert('Error al crear el objeto. Verifique sus permisos o si el nombre ya existe.');
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const guardarEdicionObjeto = async (e) => {
        e.preventDefault();
        if (!editObjetoNombre.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/objetos/${objetoSeleccionado.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre: editObjetoNombre.trim() })
            });
            if (response.ok) {
                setObjetoSeleccionado({ ...objetoSeleccionado, nombre: editObjetoNombre.trim() });
                setShowEditObjetoModal(false);
                cargarObjetos();
            } else {
                alert('Error al actualizar el objeto.');
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const eliminarObjeto = async (id) => {
        if (!window.confirm('¿Eliminar este objeto? Los usuarios que lo tengan asignado quedarán sin objeto.')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/objetos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                if (objetoSeleccionado?.id === id) setObjetoSeleccionado(null);
                cargarObjetos();
            } else {
                alert('Error al eliminar el objeto.');
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    // ── Modal helper ──────────────────────────────────────────────────────────
    const Modal = ({ title, onClose, children }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            <div className="max-w-[1200px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestión de Cargos y Objetos</h1>
                        <p className="text-sm text-slate-500">Configura cargos con permisos y define los objetos del sistema</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('cargos')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'cargos' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users size={16} /> Cargos
                    </button>
                    <button
                        onClick={() => setActiveTab('objetos')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'objetos' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Package size={16} /> Objetos
                    </button>
                </div>

                {/* ─── TAB: CARGOS ─────────────────────────────────────────────────────── */}
                {activeTab === 'cargos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lista de cargos */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 flex flex-col">
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-bold text-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-indigo-500" /> Cargos
                                </div>
                                <button onClick={() => setShowNuevoCargoModal(true)} className="p-1.5 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="p-2 space-y-1 flex-1 overflow-y-auto max-h-[600px]">
                                {cargos.map(cargo => (
                                    <button
                                        key={cargo.id}
                                        onClick={() => seleccionarCargo(cargo)}
                                        className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors ${cargoSeleccionado?.id === cargo.id ? 'bg-indigo-50 border-indigo-100 border text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                                    >
                                        {cargo.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Panel de permisos */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 lg:col-span-2 flex flex-col">
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="font-bold text-slate-800">
                                        {cargoSeleccionado ? `Permisos: ${cargoSeleccionado.nombre}` : 'Seleccione un cargo para ver sus permisos'}
                                    </h2>
                                    {cargoSeleccionado && (
                                        <button onClick={abrirModalEdicionCargo} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Editar nombre del cargo">
                                            <Edit size={16} />
                                        </button>
                                    )}
                                </div>
                                {cargoSeleccionado && (
                                    <button onClick={guardarPermisos} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                                        <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
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
                                                <div key={permiso.id} onClick={() => togglePermiso(permiso.id)} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${tienePermiso ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-200'}`}>
                                                    <div className="mt-0.5">
                                                        {tienePermiso ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} className="text-slate-400" />}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${tienePermiso ? 'text-indigo-900' : 'text-slate-700'}`}>{permiso.nombre}</p>
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{permiso.descripcion || 'Permiso del sistema CLINOVA'}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB: OBJETOS ─────────────────────────────────────────────────────── */}
                {activeTab === 'objetos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lista de objetos */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 flex flex-col">
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-bold text-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package size={18} className="text-indigo-500" /> Objetos
                                </div>
                                <button onClick={() => setShowNuevoObjetoModal(true)} className="p-1.5 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="p-2 space-y-1 flex-1 overflow-y-auto max-h-[600px]">
                                {objetos.length === 0 && (
                                    <div className="text-center text-slate-400 text-sm py-8">
                                        <Package size={32} className="mx-auto mb-2 opacity-20" />
                                        <p>No hay objetos registrados</p>
                                        <p className="text-xs mt-1">Haz clic en + para agregar</p>
                                    </div>
                                )}
                                {objetos.map(obj => (
                                    <div key={obj.id} className={`flex items-center justify-between px-4 py-3 text-sm rounded-lg border transition-colors ${objetoSeleccionado?.id === obj.id ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}>
                                        <button className="flex-1 text-left font-medium" onClick={() => setObjetoSeleccionado(obj)}>
                                            {obj.nombre}
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { setObjetoSeleccionado(obj); setEditObjetoNombre(obj.nombre); setShowEditObjetoModal(true); }}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => eliminarObjeto(obj.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Panel info del objeto */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 lg:col-span-2 flex flex-col">
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                                <h2 className="font-bold text-slate-800">
                                    {objetoSeleccionado ? `Objeto seleccionado: ${objetoSeleccionado.nombre}` : 'Seleccione un objeto para ver detalles'}
                                </h2>
                            </div>
                            <div className="p-6 flex-1 flex flex-col items-center justify-center text-slate-400">
                                {!objetoSeleccionado ? (
                                    <>
                                        <Package size={48} className="opacity-20 mb-3" />
                                        <p>Selecciona un objeto del panel izquierdo</p>
                                        <p className="text-xs mt-1">Los objetos se asignan a usuarios con rol Trabajador o Practicante</p>
                                    </>
                                ) : (
                                    <div className="w-full max-w-md">
                                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
                                            <Package size={40} className="mx-auto mb-3 text-indigo-400" />
                                            <h3 className="text-lg font-bold text-indigo-800">{objetoSeleccionado.nombre}</h3>
                                            <p className="text-sm text-indigo-600 mt-2">ID: {objetoSeleccionado.id}</p>
                                            <p className="text-xs text-slate-500 mt-4">Este objeto se puede asignar a usuarios con rol <strong>Trabajador</strong> o <strong>Practicante</strong> desde Gestión de Usuarios.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modal Nuevo Cargo ── */}
            {showNuevoCargoModal && (
                <Modal title="Crear Nuevo Cargo" onClose={() => setShowNuevoCargoModal(false)}>
                    <form onSubmit={crearCargo} className="p-6 space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Nombre del Cargo</label>
                            <input type="text" required autoFocus value={nuevoCargoNombre} onChange={(e) => setNuevoCargoNombre(e.target.value)} placeholder="Ej: Coordinador de Calidad" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowNuevoCargoModal(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Guardando...' : 'Guardar Cargo'}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Modal Editar Cargo ── */}
            {showEditCargoModal && (
                <Modal title="Editar Nombre de Cargo" onClose={() => setShowEditCargoModal(false)}>
                    <form onSubmit={guardarEdicionCargo} className="p-6 space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Nombre del Cargo</label>
                            <input type="text" required autoFocus value={editCargoNombre} onChange={(e) => setEditCargoNombre(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowEditCargoModal(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Actualizando...' : 'Actualizar Cargo'}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Modal Nuevo Objeto ── */}
            {showNuevoObjetoModal && (
                <Modal title="Crear Nuevo Objeto" onClose={() => setShowNuevoObjetoModal(false)}>
                    <form onSubmit={crearObjeto} className="p-6 space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Nombre del Objeto</label>
                            <input type="text" required autoFocus value={nuevoObjetoNombre} onChange={(e) => setNuevoObjetoNombre(e.target.value)} placeholder="Ej: Servicio de limpieza" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowNuevoObjetoModal(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Guardando...' : 'Guardar Objeto'}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Modal Editar Objeto ── */}
            {showEditObjetoModal && (
                <Modal title="Editar Nombre de Objeto" onClose={() => setShowEditObjetoModal(false)}>
                    <form onSubmit={guardarEdicionObjeto} className="p-6 space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Nombre del Objeto</label>
                            <input type="text" required autoFocus value={editObjetoNombre} onChange={(e) => setEditObjetoNombre(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowEditObjetoModal(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Actualizando...' : 'Actualizar Objeto'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};