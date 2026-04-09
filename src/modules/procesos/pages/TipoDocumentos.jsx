import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, X, Save } from 'lucide-react';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

export const TipoDocumentos = () => {
    const { showAlert } = useAlert();
    const [tipos, setTipos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [modoVer, setModoVer] = useState(false);
    
    const [formData, setFormData] = useState({ 
        nombre: '', prefijo: '', orden: '', esFormato: 'No', marcaAgua: '', plantilla: '', esCaracterizacion: 'No' 
    });

    const cargarTipos = async () => {
        try {
            const res = await http.get('/tipos-documento');
            setTipos(res.data?.data || res.data || []);
        } catch (error) {
            showAlert({ message: 'Error al cargar los tipos de documento', status: 'error' });
        }
    };

    useEffect(() => {
        cargarTipos();
    }, []);

    const filteredTipos = tipos.filter(t => 
        t.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.prefijo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (tipo = null, ver = false) => {
        setModoVer(ver);
        if (tipo) {
            setFormData({ ...tipo });
            setEditingId(tipo.id);
        } else {
            setFormData({ nombre: '', prefijo: '', orden: tipos.length + 1, esFormato: 'No', marcaAgua: '', plantilla: '', esCaracterizacion: 'No' });
            setEditingId(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setModoVer(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (modoVer) return;

        const payload = {
            ...formData,
            orden: formData.orden ? Number(formData.orden) : 0
        };

        try {
            if (editingId) {
                await http.put(`/tipos-documento/${editingId}`, payload);
                showAlert({ message: 'Tipo de documento actualizado', status: 'success' });
            } else {
                await http.post('/tipos-documento', payload);
                showAlert({ message: 'Tipo de documento creado', status: 'success' });
            }
            cargarTipos();
            handleCloseModal();
        } catch (error) {
            const mensajeError = error.response?.data?.message || 'Error al guardar el tipo de documento';
            showAlert({ message: mensajeError, status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro de forma permanente?')) {
            try {
                await http.delete(`/tipos-documento/${id}`);
                showAlert({ message: 'Registro eliminado', status: 'success' });
                cargarTipos();
            } catch (error) {
                showAlert({ message: 'Error al eliminar. Verifique dependencias.', status: 'error' });
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Tipos de Documento</h1>
                        <p className="text-sm text-slate-500 mt-1">Gestión y configuración documental para procesos</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                                <Plus size={16} /> Insertar
                            </button>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span>Mostrar</span>
                                <select value={registrosPorPagina} onChange={(e) => setRegistrosPorPagina(Number(e.target.value))} className="border border-slate-300 rounded p-1 outline-none focus:border-blue-500 cursor-pointer">
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>registros</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm text-slate-600 font-medium">Buscar:</span>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-64" />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-t-lg">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700 font-bold uppercase tracking-wider">
                                    <th className="px-4 py-3 border-r border-slate-200 w-16 text-center">Id</th>
                                    <th className="px-4 py-3 border-r border-slate-200">Nombre</th>
                                    <th className="px-4 py-3 border-r border-slate-200">Prefijo</th>
                                    <th className="px-4 py-3 border-r border-slate-200 text-center">Orden</th>
                                    <th className="px-4 py-3 border-r border-slate-200 text-center">¿Es formato?</th>
                                    <th className="px-4 py-3 border-r border-slate-200">Marca de agua</th>
                                    <th className="px-4 py-3 border-r border-slate-200">Plantilla</th>
                                    <th className="px-4 py-3 border-r border-slate-200 text-center">¿Es caracterización?</th>
                                    <th className="px-4 py-3 text-center w-32">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTipos.length === 0 ? (
                                    <tr><td colSpan={9} className="text-center py-6 text-slate-500">No hay registros configurados.</td></tr>
                                ) : (
                                    filteredTipos.slice(0, registrosPorPagina).map((tipo) => (
                                        <tr key={tipo.id} className="hover:bg-blue-50/50 border-b border-slate-200 text-sm text-slate-700 transition-colors">
                                            <td className="px-4 py-2 border-r border-slate-200 text-center font-medium">{tipo.id}</td>
                                            <td className="px-4 py-2 border-r border-slate-200 font-semibold">{tipo.nombre}</td>
                                            <td className="px-4 py-2 border-r border-slate-200">{tipo.prefijo}</td>
                                            <td className="px-4 py-2 border-r border-slate-200 text-center">{tipo.orden}</td>
                                            <td className="px-4 py-2 border-r border-slate-200 text-center">{tipo.esFormato}</td>
                                            <td className="px-4 py-2 border-r border-slate-200">{tipo.marcaAgua}</td>
                                            <td className="px-4 py-2 border-r border-slate-200">{tipo.plantilla}</td>
                                            <td className="px-4 py-2 border-r border-slate-200 text-center">{tipo.esCaracterizacion}</td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button onClick={() => handleOpenModal(tipo, true)} className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-100 rounded transition-colors" title="Ver"><Eye size={16} /></button>
                                                    <button onClick={() => handleOpenModal(tipo)} className="p-1.5 text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-amber-100 rounded transition-colors" title="Modificar"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(tipo.id)} className="p-1.5 text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-100 rounded transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">{modoVer ? 'Ver Tipo de Documento' : editingId ? 'Modificar Tipo de Documento' : 'Insertar Tipo de Documento'}</h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div><label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label><input type="text" required disabled={modoVer} value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none disabled:bg-slate-100 uppercase" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-1">Prefijo</label><input type="text" required disabled={modoVer} value={formData.prefijo} onChange={(e) => setFormData({...formData, prefijo: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none disabled:bg-slate-100 uppercase" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-1">Orden Visualización</label><input type="number" required disabled={modoVer} value={formData.orden} onChange={(e) => setFormData({...formData, orden: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none disabled:bg-slate-100" /></div>
                                <div><label className="block text-sm font-bold text-slate-700 mb-1">Marca de agua</label><input type="text" disabled={modoVer} value={formData.marcaAgua} onChange={(e) => setFormData({...formData, marcaAgua: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none disabled:bg-slate-100 uppercase" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">Plantilla vinculada (URL/ID)</label><input type="text" disabled={modoVer} value={formData.plantilla} onChange={(e) => setFormData({...formData, plantilla: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none disabled:bg-slate-100" /></div>
                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">¿Es formato?</label><select disabled={modoVer} value={formData.esFormato} onChange={(e) => setFormData({...formData, esFormato: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none disabled:bg-slate-100"><option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option></select></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-1">¿Es caracterización?</label><select disabled={modoVer} value={formData.esCaracterizacion} onChange={(e) => setFormData({...formData, esCaracterizacion: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none disabled:bg-slate-100"><option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option></select></div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-lg">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-md transition-colors border border-slate-300 bg-white">{modoVer ? 'Cerrar' : 'Cancelar'}</button>
                                {!modoVer && <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"><Save size={16} /> Guardar</button>}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};