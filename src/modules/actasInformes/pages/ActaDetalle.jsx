import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

export const ActaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    
    const [acta, setActa] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            const [resActa, resComentarios] = await Promise.all([
                http.get(`/actas/${id}`),
                http.get(`/actas/${id}/comentarios`)
            ]);
            setActa(resActa.data?.data || resActa.data);
            setComentarios(resComentarios.data?.data || resComentarios.data || []);
        } catch (error) {
            showAlert({ message: 'Error al cargar el acta o los comentarios', status: 'error' });
            navigate('/actas-informes/gestion');
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        try {
            const res = await http.post(`/actas/${id}/comentarios`, nuevoComentario, {
                headers: { 'Content-Type': 'text/plain' }
            });
            const comentarioAgregado = res.data?.data || res.data;
            setComentarios([comentarioAgregado, ...comentarios]);
            setNuevoComentario('');
            showAlert({ message: 'Comentario agregado', status: 'success' });
        } catch (error) {
            showAlert({ message: 'Error al enviar el comentario', status: 'error' });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
    if (!acta) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-[1200px] mx-auto space-y-6">
                
                <button 
                    onClick={() => navigate('/actas-informes/gestion')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Volver a Gestión
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visualizador del Acta */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h1 className="text-2xl font-bold text-gray-900">{acta.titulo}</h1>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                <span>Resp: <strong>{acta.responsable}</strong></span>
                                <span>Estado: <strong>{acta.estado}</strong></span>
                                <span>Fecha: <strong>{acta.fecha}</strong></span>
                            </div>
                        </div>
                        <div className="p-8 prose max-w-none" dangerouslySetInnerHTML={{ __html: acta.contenidoHtml }} />
                    </div>

                    {/* Panel de Comentarios */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-gray-800">Comentarios</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                                {comentarios.length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {comentarios.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm mt-10">No hay comentarios aún.</p>
                            ) : (
                                comentarios.map(com => (
                                    <div key={com.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-bold text-gray-800">{com.autorNombre || com.autorUsername}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(com.fechaCreacion).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{com.contenido}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white">
                            <form onSubmit={handleEnviarComentario} className="flex gap-2">
                                <textarea 
                                    value={nuevoComentario}
                                    onChange={(e) => setNuevoComentario(e.target.value)}
                                    placeholder="Escribe un comentario..."
                                    className="flex-1 resize-none border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    rows="2"
                                />
                                <button 
                                    type="submit"
                                    disabled={!nuevoComentario.trim()}
                                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};