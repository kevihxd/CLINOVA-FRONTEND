import React, { useState, useEffect } from 'react';
import { Save, X, FileSignature } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

const editorModules = {
    toolbar: [
        // Fuente, Tamaño y Encabezados
        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        // Formato de texto básico
        ['bold', 'italic', 'underline', 'strike'],
        // Color de texto y fondo
        [{ 'color': [] }, { 'background': [] }],
        // Subíndice / Superíndice
        [{ 'script': 'sub'}, { 'script': 'super' }],
        // Alineación
        [{ 'align': [] }],
        // Listas y Sangrías
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        // Bloques y multimedia
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        // Limpiar formato
        ['clean']
    ],
    clipboard: {
        matchVisual: false,
    }
};

export const CrearActa = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [searchParams] = useSearchParams();
    const plantillaId = searchParams.get('plantillaId');

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
                    const data = res.data?.data || res.data;
                    setTitulo(`Acta basada en: ${data.titulo}`);
                    setContenido(data.contenidoHtml || '');
                    showAlert({ message: 'Plantilla cargada correctamente. Puede reemplazar las variables.', status: 'info' });
                } catch (error) {
                    showAlert({ message: 'Error al cargar la plantilla seleccionada', status: 'error' });
                }
            };
            fetchPlantilla();
        }
    }, [plantillaId, showAlert]);

    const handleGuardar = async (e) => {
        e.preventDefault();
        
        if (!titulo.trim() || !fecha || !tipo || !responsable || !contenido.trim() || contenido === '<p><br></p>') {
            showAlert({ message: 'Todos los campos y el contenido del acta son obligatorios', status: 'warning' });
            return;
        }

        const payload = { titulo, fecha, tipo, estado, responsable, contenidoHtml: contenido };

        try {
            await http.post('/actas', payload);
            showAlert({ message: 'Acta guardada exitosamente', status: 'success' });
            navigate('/actas-informes/gestion-actas');
        } catch (error) {
            showAlert({ message: 'Error al guardar el acta', status: 'error' });
        }
    };

    const inputClass = "w-full px-4 py-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all";
    const labelClass = "text-xs font-semibold text-slate-600 mb-1.5 block uppercase tracking-wider";

    return (
        <form onSubmit={handleGuardar} className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-[1400px] mx-auto space-y-6">
                
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

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                    <ReactQuill 
                        theme="snow" 
                        value={contenido} 
                        onChange={setContenido} 
                        modules={editorModules}
                        className="bg-white"
                        style={{ height: '700px', paddingBottom: '42px' }}
                        placeholder="Comienza a redactar el contenido del acta aquí..."
                    />
                </div>
            </div>
        </form>
    );
};