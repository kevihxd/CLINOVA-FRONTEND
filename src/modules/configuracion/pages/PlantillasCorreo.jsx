import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Mail, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const PlantillasCorreo = () => {
    const navigate = useNavigate();
    const [plantillas, setPlantillas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlantilla, setCurrentPlantilla] = useState(null);
    
    // Form state
    const [nombre, setNombre] = useState('');
    const [asunto, setAsunto] = useState('');
    const [cuerpo, setCuerpo] = useState('');

    useEffect(() => {
        fetchPlantillas();
    }, []);

    const fetchPlantillas = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/plantillas-correo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlantillas(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching plantillas:', err);
            setError('No se pudieron cargar las plantillas de correo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setIsEditing(true);
        setCurrentPlantilla(null);
        setNombre('');
        setAsunto('');
        setCuerpo('');
    };

    const handleEdit = (plantilla) => {
        setIsEditing(true);
        setCurrentPlantilla(plantilla);
        setNombre(plantilla.nombre);
        setAsunto(plantilla.asunto);
        setCuerpo(plantilla.cuerpo);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/plantillas-correo/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPlantillas();
        } catch (err) {
            console.error('Error deleting plantilla:', err);
            alert('Error al eliminar la plantilla');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = { nombre, asunto, cuerpo };
            
            if (currentPlantilla) {
                await axios.put(`/api/v1/plantillas-correo/${currentPlantilla.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/v1/plantillas-correo', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setIsEditing(false);
            fetchPlantillas();
        } catch (err) {
            console.error('Error saving plantilla:', err);
            alert('Error al guardar la plantilla');
        }
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">Plantillas de Correo</h1>
                                    <p className="text-sm text-slate-500">Gestiona los mensajes predefinidos</p>
                                </div>
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <Plus size={20} />
                                <span className="font-medium">Nueva Plantilla</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isEditing ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-3xl mx-auto">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">
                            {currentPlantilla ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
                        </h2>
                        
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nombre de la Plantilla
                                </label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ej: Envío de Reporte Semanal"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Asunto Predefinido
                                </label>
                                <input
                                    type="text"
                                    value={asunto}
                                    onChange={(e) => setAsunto(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ej: Reporte Adjunto"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Cuerpo del Mensaje
                                </label>
                                <textarea
                                    value={cuerpo}
                                    onChange={(e) => setCuerpo(e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Escribe el mensaje que irá en el cuerpo del correo..."
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
                                >
                                    <Save size={20} />
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : error ? (
                            <div className="col-span-full p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                                {error}
                            </div>
                        ) : plantillas.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
                                <Mail size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900">No hay plantillas</h3>
                                <p className="text-slate-500 mt-1">Crea tu primera plantilla de correo para empezar.</p>
                            </div>
                        ) : (
                            plantillas.map(plantilla => (
                                <div key={plantilla.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-slate-800 line-clamp-1" title={plantilla.nombre}>
                                            {plantilla.nombre}
                                        </h3>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(plantilla)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(plantilla.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Asunto</span>
                                            <p className="text-sm text-slate-700 line-clamp-1">{plantilla.asunto}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Cuerpo</span>
                                            <p className="text-sm text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100">
                                                {plantilla.cuerpo}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
