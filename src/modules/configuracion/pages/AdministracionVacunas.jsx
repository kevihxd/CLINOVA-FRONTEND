import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Syringe, X, Save, Shield } from 'lucide-react';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

export const AdministracionVacunas = () => {
    const { showAlert } = useAlert();
    const [vacunas, setVacunas] = useState([]);
    const [activeTab, setActiveTab] = useState('Administrativo');
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '', perfil: 'Administrativo', dosisRequeridas: 1, requiereRefuerzo: false });

    useEffect(() => {
        cargarVacunas();
    }, []);

    const cargarVacunas = async () => {
        try {
            const res = await http.get('/vacunacion/catalogo');
            let data = res.data || res;
            if (!Array.isArray(data)) {
                data = data?.content || [];
            }
            if (!Array.isArray(data)) {
                data = [];
            }
            setVacunas(data);
        } catch (error) {
            showAlert({ message: 'Error cargando vacunas', status: 'error' });
            setVacunas([]);
        }
    };

    const handleOpenModal = (vacuna = null) => {
        if (vacuna) {
            setEditMode(true);
            setFormData({
                id: vacuna.id,
                nombre: vacuna.nombre,
                perfil: vacuna.perfil,
                dosisRequeridas: vacuna.dosisRequeridas || 1,
                requiereRefuerzo: vacuna.requiereRefuerzo || false
            });
        } else {
            setEditMode(false);
            setFormData({ id: null, nombre: '', perfil: activeTab, dosisRequeridas: 1, requiereRefuerzo: false });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await http.put(`/vacunacion/catalogo/${formData.id}`, formData);
                showAlert({ message: 'Vacuna actualizada exitosamente', status: 'success' });
            } else {
                await http.post('/vacunacion/catalogo', formData);
                showAlert({ message: 'Vacuna creada exitosamente', status: 'success' });
            }
            setModalOpen(false);
            cargarVacunas();
        } catch (error) {
            showAlert({ message: 'Error al guardar la vacuna', status: 'error' });
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta vacuna? Afectará a los usuarios que no la hayan registrado.')) return;
        try {
            await http.delete(`/vacunacion/catalogo/${id}`);
            showAlert({ message: 'Vacuna eliminada', status: 'success' });
            cargarVacunas();
        } catch (error) {
            showAlert({ message: error.response?.data?.message || 'Error al eliminar', status: 'error' });
        }
    };

    const vacunasFiltradas = vacunas.filter(v => v.perfil === activeTab);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Shield className="w-6 h-6 text-blue-600"/> Administración de Vacunas</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure las dosis y refuerzos obligatorios para cada perfil de cargo.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Agregar Vacuna
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button onClick={() => setActiveTab('Administrativo')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'Administrativo' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>Perfil Administrativo</button>
                    <button onClick={() => setActiveTab('Asistencial')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'Asistencial' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>Perfil Asistencial</button>
                </div>

                <div className="p-6">
                    {vacunasFiltradas.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Syringe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay vacunas configuradas para este perfil.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vacunasFiltradas.map(v => (
                                <div key={v.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow transition-shadow relative group">
                                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(v)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit2 className="w-3.5 h-3.5"/></button>
                                        <button onClick={() => handleEliminar(v.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/></button>
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Syringe className="w-5 h-5"/></div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm leading-tight">{v.nombre}</h3>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{v.perfil}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">{v.dosisRequeridas} Dosis Requeridas</span>
                                        {v.requiereRefuerzo && <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-200">+ Refuerzo</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-sm">{editMode ? 'Editar Vacuna' : 'Nueva Vacuna'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Perfil de Cargo *</label>
                                <select required value={formData.perfil} onChange={e => setFormData({...formData, perfil: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm">
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Asistencial">Asistencial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Biológico *</label>
                                <input type="text" required placeholder="Ej. Influenza (Anual)" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">N° de Dosis *</label>
                                    <input type="number" min="1" max="10" required value={formData.dosisRequeridas} onChange={e => setFormData({...formData, dosisRequeridas: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                                </div>
                                <div className="flex flex-col justify-center pt-5">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
                                        <input type="checkbox" checked={formData.requiereRefuerzo} onChange={e => setFormData({...formData, requiereRefuerzo: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                        Requiere Refuerzo
                                    </label>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                                    <Save className="w-4 h-4"/> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};