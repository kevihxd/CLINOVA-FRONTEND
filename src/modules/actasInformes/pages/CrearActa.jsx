import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2, Image as ImageIcon, Undo, Redo, FileSignature } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

export const CrearActa = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [searchParams] = useSearchParams();
    const plantillaId = searchParams.get('plantillaId');
    const textAreaRef = useRef(null);

    const [titulo, setTitulo] = useState('');
    const [fecha, setFecha] = useState('');
    const [tipo, setTipo] = useState('');
    const [estado, setEstado] = useState('Borrador');
    const [responsable, setResponsable] = useState('');
    const [contenido, setContenido] = useState('');

    useEffect(() => {
        if (plantillaId) {
            const fetchPlantilla = async () => {
                try {
                    const res = await http.get(`/plantillas/${plantillaId}`);
                    setTitulo(`Copia de: ${res.data.titulo}`);
                    setContenido(res.data.contenidoHtml);
                } catch (error) {
                    showAlert({ message: 'Error al cargar la plantilla seleccionada', status: 'error' });
                }
            };
            fetchPlantilla();
        }
    }, [plantillaId, showAlert]);

    const handleGuardar = async (e) => {
        e.preventDefault();
        
        if (!titulo.trim() || !fecha || !tipo || !responsable || !contenido.trim()) {
            showAlert({ message: 'Todos los campos son obligatorios', status: 'warning' });
            return;
        }

        const payload = {
            titulo,
            fecha,
            tipo,
            estado,
            responsable,
            contenidoHtml: contenido
        };

        try {
            await http.post('/actas', payload);
            showAlert({ message: 'Acta guardada exitosamente', status: 'success' });
            navigate('/actas-informes/gestion-actas');
        } catch (error) {
            showAlert({ message: 'Error al guardar el acta', status: 'error' });
        }
    };

    const ToolbarButton = ({ icon: Icon, title }) => (
        <button type="button" title={title} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors">
            <Icon size={18} />
        </button>
    );

    const inputClass = "w-full px-4 py-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all";
    const labelClass = "text-xs font-semibold text-slate-600 mb-1.5 block uppercase tracking-wider";

    return (
        <form onSubmit={handleGuardar} className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-white shadow-sm text-blue-600 border border-slate-100">
                            <FileSignature size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actas y Reportes</span>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Redactar Acta</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <X size={16} /> Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                            <Save size={16} /> Guardar Acta
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div className="md:col-span-3 xl:col-span-2">
                        <label className={labelClass}>Título del Acta *</label>
                        <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} placeholder="Ej: Reunión de Sincronización" />
                    </div>
                    <div>
                        <label className={labelClass}>Fecha *</label>
                        <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Tipo *</label>
                        <select required value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
                            <option value="" disabled>Seleccionar...</option>
                            <option value="Comité">Comité</option>
                            <option value="Sincronización">Sincronización</option>
                            <option value="Capacitación">Capacitación</option>
                            <option value="Revisión">Revisión</option>
                            <option value="Planificación">Planificación</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Estado *</label>
                        <select required value={estado} onChange={(e) => setEstado(e.target.value)} className={inputClass}>
                            <option value="Borrador">Borrador</option>
                            <option value="Publicada">Publicada</option>
                            <option value="Archivada">Archivada</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 xl:col-span-5">
                        <label className={labelClass}>Responsable *</label>
                        <input type="text" required value={responsable} onChange={(e) => setResponsable(e.target.value)} className={inputClass} placeholder="Nombre del responsable del acta" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all flex flex-col h-[600px]">
                    <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center">
                        <ToolbarButton icon={Bold} title="Negrita" />
                        <ToolbarButton icon={Italic} title="Cursiva" />
                        <ToolbarButton icon={Underline} title="Subrayado" />
                        <ToolbarButton icon={Strikethrough} title="Tachado" />
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolbarButton icon={List} title="Lista con viñetas" />
                        <ToolbarButton icon={ListOrdered} title="Lista numerada" />
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolbarButton icon={Link2} title="Insertar enlace" />
                        <ToolbarButton icon={ImageIcon} title="Insertar imagen" />
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <ToolbarButton icon={Undo} title="Deshacer" />
                        <ToolbarButton icon={Redo} title="Rehacer" />
                    </div>

                    <textarea 
                        ref={textAreaRef}
                        required
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        className="flex-1 w-full p-6 text-sm outline-none resize-none placeholder:text-slate-400"
                        placeholder="Comienza a redactar el contenido del acta aquí..."
                    />
                </div>
            </div>
        </form>
    );
};