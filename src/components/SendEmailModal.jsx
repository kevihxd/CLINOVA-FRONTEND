import React, { useState, useEffect } from 'react';
import { X, Send, Paperclip, Mail } from 'lucide-react';
import axios from 'axios';

export const SendEmailModal = ({ isOpen, onClose, fileUrl, fileName, docType = 'file', documentoId }) => {
    const [plantillas, setPlantillas] = useState([]);
    const [selectedPlantilla, setSelectedPlantilla] = useState('');
    const [destinatarios, setDestinatarios] = useState('');
    const [asunto, setAsunto] = useState('');
    const [cuerpo, setCuerpo] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPlantillas();
            setDestinatarios('');
            setAsunto('');
            setCuerpo('');
            setSelectedPlantilla('');
        }
    }, [isOpen]);

    const fetchPlantillas = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/plantillas-correo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const raw = response.data;
            const list = Array.isArray(raw) ? raw
                : Array.isArray(raw?.data) ? raw.data
                : Array.isArray(raw?.content) ? raw.content
                : [];
            setPlantillas(list);
        } catch (err) {
            console.error('Error fetching plantillas:', err);
            setPlantillas([]);
        }
    };

    const handlePlantillaChange = (e) => {
        const id = e.target.value;
        setSelectedPlantilla(id);
        
        if (id) {
            const plantilla = plantillas.find(p => p.id === parseInt(id));
            if (plantilla) {
                setAsunto(plantilla.asunto);
                setCuerpo(plantilla.cuerpo);
            }
        } else {
            setAsunto('');
            setCuerpo('');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        
        if (!destinatarios.trim() || !asunto.trim() || !cuerpo.trim()) {
            alert('Por favor completa todos los campos.');
            return;
        }

        try {
            setIsSending(true);
            const token = localStorage.getItem('token');
            const destList = destinatarios.split(',').map(d => d.trim()).filter(d => d);
            const headers = { Authorization: `Bearer ${token}` };

            if (docType === 'file' && documentoId) {
                const formData = new FormData();
                destList.forEach(email => formData.append('to', email));
                formData.append('subject', asunto);
                formData.append('text', cuerpo);

                try {
                    // Try to download the file and attach it
                    const downloadResp = await axios.get(
                        `/api/v1/documentos/descargar/${documentoId}`,
                        { headers, responseType: 'blob' }
                    );
                    const blob = downloadResp.data;
                    const contentDisposition = downloadResp.headers['content-disposition'] || '';
                    const match = contentDisposition.match(/filename="?([^"]+)"?/);
                    const attachName = match ? match[1] : (fileName || 'documento');
                    formData.append('file', blob, attachName);
                } catch {
                    // File not on server — send email without attachment
                }

                await axios.post('/api/v1/email/enviar-archivo', formData, { headers });

            } else if (docType === 'blob' && fileUrl) {
                const formData = new FormData();
                destList.forEach(email => formData.append('to', email));
                formData.append('subject', asunto);
                formData.append('text', cuerpo);
                formData.append('file', fileUrl, fileName || 'documento');
                await axios.post('/api/v1/email/enviar-archivo', formData, { headers });
            }

            alert('Correo enviado exitosamente.');
            onClose();
        } catch (err) {
            console.error('Error sending email:', err);
            if (err.response?.status === 404) {
                alert('Este documento no tiene un archivo físico disponible en el servidor.');
            } else {
                const backendMsg = err.response?.data;
                const msg = typeof backendMsg === 'string' ? backendMsg
                    : backendMsg?.message || backendMsg?.error || JSON.stringify(backendMsg);
                alert('Error al enviar: ' + (msg || err.message));
            }
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Mail size={18} className="text-indigo-600" />
                        Enviar por Correo
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSend} className="p-5 overflow-y-auto space-y-4">
                    {fileName && (
                        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700">
                            <Paperclip size={16} />
                            <span className="font-medium truncate flex-1">{fileName}</span>
                            <span className="text-xs px-2 py-1 bg-indigo-100 rounded-full">Adjunto</span>
                        </div>
                    )}

                    {plantillas.length > 0 && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Usar Plantilla
                            </label>
                            <select
                                value={selectedPlantilla}
                                onChange={handlePlantillaChange}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            >
                                <option value="">-- Seleccionar una plantilla predefinida --</option>
                                {plantillas.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Destinatario(s)
                        </label>
                        <input
                            type="text"
                            value={destinatarios}
                            onChange={(e) => setDestinatarios(e.target.value)}
                            placeholder="correo1@empresa.com, correo2@empresa.com"
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Separa múltiples correos con comas</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Asunto
                        </label>
                        <input
                            type="text"
                            value={asunto}
                            onChange={(e) => setAsunto(e.target.value)}
                            placeholder="Asunto del correo"
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Cuerpo del Mensaje
                        </label>
                        <textarea
                            value={cuerpo}
                            onChange={(e) => setCuerpo(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                            required
                        />
                    </div>
                </form>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        disabled={isSending}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                Enviar Correo
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
