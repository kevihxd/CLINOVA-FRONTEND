import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Plus, CalendarClock } from 'lucide-react';
import { useAlert } from '../../../providers/AlertProvider';
import { cursosService } from '../services/cursos.service';

export const GestionCursos = () => {
    const { showAlert } = useAlert();
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', fechaLimiteGlobal: '', esGlobal: true, mesesVigencia: 12 });

    useEffect(() => {
        cargarCursos();
    }, []);

    const cargarCursos = async () => {
        setLoading(true);
        try {
            const res = await cursosService.obtenerCursosMaestros();
            setCursos(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error("Error al cargar cursos:", error.response?.data || error.message);
            showAlert({ message: 'Error al cargar los cursos', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCrearCurso = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (editingId) {
                await cursosService.actualizarCursoMaestro(editingId, payload);
                showAlert({ message: 'Curso actualizado exitosamente', status: 'success' });
            } else {
                await cursosService.crearCursoMaestro(payload);
                showAlert({ message: 'Curso creado exitosamente', status: 'success' });
            }
            setFormData({ nombre: '', descripcion: '', fechaLimiteGlobal: '', esGlobal: true, mesesVigencia: 12 });
            setEditingId(null);
            cargarCursos();
        } catch (error) {
            console.error("Error exacto:", error.response?.data || error.message);
            const errorMsg = typeof error.response?.data === 'string' ? error.response.data : 'Error al procesar el curso';
            showAlert({ message: errorMsg, status: 'error' });
        }
    };

    const handleEditarCurso = (curso) => {
        setFormData({
            nombre: curso.nombre || '',
            descripcion: curso.descripcion || '',
            fechaLimiteGlobal: curso.fechaLimiteGlobal || '',
            esGlobal: curso.esGlobal !== undefined ? curso.esGlobal : true,
            mesesVigencia: curso.mesesVigencia || 12
        });
        setEditingId(curso.id);
    };

    const handleEliminarCurso = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este curso? Se eliminarán todas las asignaciones existentes.')) return;
        try {
            await cursosService.eliminarCursoMaestro(id);
            showAlert({ message: 'Curso eliminado exitosamente', status: 'success' });
            cargarCursos();
        } catch (error) {
            showAlert({ message: 'Error al eliminar el curso', status: 'error' });
        }
    };

    const handleAsignarMasivo = async (cursoId) => {
        setProcessingId(cursoId);
        try {
            await cursosService.asignarMasivo(cursoId);
            showAlert({ message: 'Curso asignado a todos los usuarios', status: 'success' });
        } catch (error) {
            showAlert({ message: 'Error en la asignación masiva', status: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Gestión de Cursos Institucionales</h1>
                    <p className="text-sm text-gray-500 mt-1">Creación de cursos y asignación masiva al personal</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" /> Nuevo Curso
                            </h2>
                            <form onSubmit={handleCrearCurso} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Curso</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="Ej: Soporte Vital Básico"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha Límite Global</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.fechaLimiteGlobal}
                                        onChange={(e) => setFormData({...formData, fechaLimiteGlobal: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción</label>
                                    <textarea 
                                        rows="3"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                        placeholder="Breve descripción del objetivo del curso..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1" title="Vigencia del certificado en meses">Vigencia (Meses)</label>
                                        <input 
                                            type="number" 
                                            required
                                            min="1"
                                            value={formData.mesesVigencia}
                                            onChange={(e) => setFormData({...formData, mesesVigencia: parseInt(e.target.value) || 12})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center pt-5">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.esGlobal}
                                                onChange={(e) => setFormData({...formData, esGlobal: e.target.checked})}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-xs font-bold text-gray-700 uppercase">Curso Global</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        {editingId ? 'Actualizar Curso' : 'Guardar Curso'}
                                    </button>
                                    {editingId && (
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setEditingId(null);
                                                setFormData({ nombre: '', descripcion: '', fechaLimiteGlobal: '', esGlobal: true, mesesVigencia: 12 });
                                            }}
                                            className="px-4 bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-gray-600" /> Cursos Registrados
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">Cargando cursos...</div>
                                ) : cursos.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">No hay cursos registrados en el sistema.</div>
                                ) : (
                                    cursos.map(curso => (
                                        <div key={curso.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base">{curso.nombre}</h3>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{curso.descripcion}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                                        <CalendarClock className="w-3.5 h-3.5" /> Límite: {curso.fechaLimiteGlobal || 'Sin definir'}
                                                    </span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${curso.esGlobal ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-700'}`}>
                                                        {curso.esGlobal ? 'Global' : 'Opcional'}
                                                    </span>
                                                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">
                                                        Vigencia: {curso.mesesVigencia || 12} meses
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditarCurso(curso)}
                                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Editar curso"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleEliminarCurso(curso.id)}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Eliminar curso"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};