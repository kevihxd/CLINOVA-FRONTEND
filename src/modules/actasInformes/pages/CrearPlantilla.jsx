import React, { useState, useRef, useEffect } from 'react';
import { Save, X, LayoutTemplate } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

const VARIABLES_DISPONIBLES = [
    { label: 'Nombre Completo', value: '{nombre_completo}' },
    { label: 'Cédula', value: '{cedula}' },
    { label: 'Fecha Actual', value: '{fecha_actual}' },
    { label: 'Cargo', value: '{cargo}' },
    { label: 'Sede', value: '{sede}' },
    { label: 'Jefe Inmediato', value: '{jefe_inmediato}' },
    { label: 'Salario', value: '{salario}' },
    { label: 'Tipo de Contrato', value: '{tipo_contrato}' },
    { label: 'ARL', value: '{arl}' },
    { label: 'EPS', value: '{eps}' }
];

const editorModules = {
    toolbar: [
        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
    ],
    clipboard: {
        matchVisual: false,
    }
};

export const CrearPlantilla = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const quillRef = useRef(null);
    const [searchParams] = useSearchParams();
    
    // Si viene este ID en la URL, estamos en modo "Editar"
    const editId = searchParams.get('editId');

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [contenido, setContenido] = useState('');

    useEffect(() => {
        if (editId) {
            const fetchTemplateData = async () => {
                try {
                    const res = await http.get(`/plantillas/${editId}`);
                    const data = res.data?.data || res.data;
                    setTitulo(data.titulo);
                    setDescripcion(data.descripcion || '');
                    setContenido(data.contenidoHtml || '');
                } catch (error) {
                    showAlert({ message: 'Error al cargar la plantilla para edición', status: 'error' });
                }
            };
            fetchTemplateData();
        }
    }, [editId, showAlert]);

    const handleInsertVariable = (variableValue) => {
        if (!quillRef.current) return;
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);
        editor.insertText(range.index, variableValue);
        editor.setSelection(range.index + variableValue.length);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        
        if (!titulo.trim() || !contenido.trim() || contenido === '<p><br></p>') {
            showAlert({ message: 'Título y contenido son obligatorios', status: 'warning' });
            return;
        }

        const payload = { titulo, descripcion, contenidoHtml: contenido };

        try {
            if (editId) {
                // Modo Edición (PUT)
                await http.put(`/plantillas/${editId}`, payload);
                showAlert({ message: 'Plantilla actualizada exitosamente', status: 'success' });
            } else {
                // Modo Creación (POST)
                await http.post('/plantillas', payload);
                showAlert({ message: 'Plantilla creada exitosamente', status: 'success' });
            }
            navigate('/actas-informes/gestion-actas');
        } catch (error) {
            showAlert({ message: `Error al ${editId ? 'actualizar' : 'crear'} la plantilla`, status: 'error' });
        }
    };

    const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all";
    const labelClass = "text-xs font-semibold text-slate-600 mb-1.5 block uppercase tracking-wider";

    return (
        <form onSubmit={handleGuardar} className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white shadow-sm text-indigo-600 border border-slate-100">
                            <LayoutTemplate size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gestión de Plantillas</span>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {editId ? 'Editar plantilla maestra' : 'Crear plantilla maestra'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <X size={16} /> Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
                            <Save size={16} /> {editId ? 'Actualizar plantilla' : 'Guardar plantilla'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 bg-white p-7 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Título de la plantilla *</label>
                                <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} placeholder="Ej: Acta de inicio de contrato" />
                            </div>
                            <div>
                                <label className={labelClass}>Descripción</label>
                                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputClass} placeholder="Ej: Útil para apertura de proyectos" />
                            </div>
                        </div>
                        
                        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all bg-white">
                            <ReactQuill 
                                ref={quillRef}
                                theme="snow" 
                                value={contenido} 
                                onChange={setContenido} 
                                modules={editorModules}
                                className="bg-white"
                                style={{ height: '600px', paddingBottom: '42px' }}
                                placeholder="Escribe el diseño de tu plantilla aquí..."
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-80 bg-white p-7 rounded-2xl shadow-sm border border-slate-100 self-start sticky top-8">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Variables disponibles</h3>
                        <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">Haz clic en una variable para insertarla en la posición del cursor. Cuando generes un acta, podrás reemplazar estas palabras clave.</p>
                        <div className="flex flex-wrap lg:flex-col gap-2.5">
                            {VARIABLES_DISPONIBLES.map(variable => (
                                <button 
                                    key={variable.value}
                                    type="button"
                                    onClick={() => handleInsertVariable(variable.value)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-all text-left whitespace-nowrap lg:whitespace-normal"
                                >
                                    {variable.label} <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{variable.value}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};