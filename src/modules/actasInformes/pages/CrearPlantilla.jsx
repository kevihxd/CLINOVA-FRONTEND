import React, { useState, useRef } from 'react';
import { Save, X, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2, Image as ImageIcon, Undo, Redo, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export const CrearPlantilla = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const textAreaRef = useRef(null);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [contenido, setContenido] = useState('');

    const handleInsertVariable = (variableValue) => {
        const textArea = textAreaRef.current;
        if (!textArea) return;

        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const textBefore = contenido.substring(0, start);
        const textAfter = contenido.substring(end, contenido.length);

        const nuevoContenido = textBefore + variableValue + textAfter;
        setContenido(nuevoContenido);

        setTimeout(() => {
            textArea.focus();
            textArea.setSelectionRange(start + variableValue.length, start + variableValue.length);
        }, 0);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        
        if (!titulo.trim() || !contenido.trim()) {
            showAlert({ message: 'Título y contenido son obligatorios', status: 'warning' });
            return;
        }

        const payload = {
            titulo,
            descripcion,
            contenidoHtml: contenido
        };

        try {
            await http.post('/plantillas', payload);
            showAlert({ message: 'Plantilla creada exitosamente', status: 'success' });
            navigate('/actas-informes/gestion-actas');
        } catch (error) {
            showAlert({ message: 'Error al crear la plantilla', status: 'error' });
        }
    };

    const ToolbarButton = ({ icon: Icon, title }) => (
        <button type="button" title={title} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors">
            <Icon size={18} />
        </button>
    );

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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Crear plantilla</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <X size={16} /> Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
                            <Save size={16} /> Crear plantilla
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    <div className="flex-1 bg-white p-7 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div>
                            <label className={labelClass}>Título</label>
                            <input 
                                type="text" 
                                required
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                className={inputClass} 
                                placeholder="Ej: Acta de inicio de obra" 
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Descripción</label>
                            <input 
                                type="text" 
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className={inputClass} 
                                placeholder="Ej: Esta acta se usa para..." 
                            />
                        </div>
                        
                        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                            
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
                                className="w-full h-[500px] p-5 text-sm outline-none resize-none placeholder:text-slate-400"
                                placeholder="Escribe o pega tu contenido aquí..."
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-80 bg-white p-7 rounded-2xl shadow-sm border border-slate-100 self-start">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Variables disponibles</h3>
                        <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">Haz clic en una variable para insertarla en la posición del cursor del editor.</p>
                        <div className="flex flex-wrap lg:flex-col gap-2.5">
                            {VARIABLES_DISPONIBLES.map(variable => (
                                <button 
                                    key={variable.value}
                                    type="button"
                                    onClick={() => handleInsertVariable(variable.value)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-all text-left whitespace-nowrap lg:whitespace-normal"
                                >
                                    {variable.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};