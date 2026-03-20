import React, { useState } from 'react';
import { Search, FileText, ArrowLeft, User, Camera, Briefcase, Bot, Trash2, Edit2, Save, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { UsuariosService } from '../../configuracion/services/usuarios.service';

export const HojaVida = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('datos');
    const [hojaVidaId, setHojaVidaId] = useState(null);
    const [cvNombre, setCvNombre] = useState('');

    const [datosCV, setDatosCV] = useState({ nombres: '', apellidos: '', cedula: '', fechaNacimiento: '', fechaIngreso: '', correoElectronico: '' });
    const [fotoFile, setFotoFile] = useState(null);
    const [educacion, setEducacion] = useState({ nivelEstudio: '', institucion: '', titulo: '', fechaInicio: '', fechaFin: '' });
    const [experiencia, setExperiencia] = useState({ empresa: '', cargo: '', fechaInicio: '', fechaFin: '', funciones: '' });
    const [loteFile, setLoteFile] = useState(null);
    
    const [resultadosIA, setResultadosIA] = useState([]);
    const [procesandoIA, setProcesandoIA] = useState(false);
    const [editingDocId, setEditingDocId] = useState(null);
    const [editDocValue, setEditDocValue] = useState('');

    const buscarEnUsuarios = async (cedula) => {
        try {
            const data = await UsuariosService.getAll();
            const usuariosReales = Array.isArray(data) ? data : (data?.data || []);
            const userFound = usuariosReales.find(u => (u.persona?.numero_documento?.toString() === cedula) || (u.cedula?.toString() === cedula));

            if (userFound) {
                setDatosCV({
                    nombres: `${userFound.persona?.primer_nombre || ''} ${userFound.persona?.segundo_nombre || ''}`.trim(),
                    apellidos: `${userFound.persona?.primer_apellido || ''} ${userFound.persona?.segundo_apellido || ''}`.trim(),
                    cedula: userFound.persona?.numero_documento || userFound.cedula || '',
                    fechaNacimiento: userFound.persona?.fecha_nacimiento || '',
                    fechaIngreso: '', 
                    correoElectronico: userFound.persona?.correo_electronico || ''
                });
                setHojaVidaId(null);
                setCvNombre('');
                setResultadosIA([]);
                showAlert({ message: 'Datos pre-cargados desde usuario. Por favor guarde para crear la Hoja de Vida.', status: 'info' });
            } else {
                setDatosCV(prev => ({ ...prev, cedula: cedula }));
                setHojaVidaId(null);
                setCvNombre('');
                setResultadosIA([]);
                showAlert({ message: 'No se encontraron registros. Puede crear uno nuevo.', status: 'info' });
            }
        } catch (error) {
            showAlert({ message: 'Error al buscar en usuarios.', status: 'error' });
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const cedulaTrim = searchTerm.trim();
        if (!cedulaTrim) return;

        try {
            const response = await http.get(`/hojas-vida/cedula/${cedulaTrim}`);
            if ((response.status === 'SUCCESS' || response.data) && response.data) {
                const hv = response.data.data || response.data;
                setHojaVidaId(hv.id);
                setCvNombre(`${hv.nombres} ${hv.apellidos}`);
                setDatosCV({ nombres: hv.nombres || '', apellidos: hv.apellidos || '', cedula: hv.cedula || '', fechaNacimiento: hv.fechaNacimiento || '', fechaIngreso: hv.fechaIngreso || '', correoElectronico: hv.correoElectronico || '' });

                try {
                    const soportesRes = await http.get(`/soportes/hoja-vida/${hv.id}`);
                    if (soportesRes.data) setResultadosIA(Array.isArray(soportesRes.data) ? soportesRes.data : (soportesRes.data.data || []));
                } catch (err) {
                    setResultadosIA([]);
                }
                showAlert({ message: 'Hoja de Vida encontrada', status: 'success' });
            }
        } catch (error) {
            buscarEnUsuarios(cedulaTrim);
        }
    };

    const handleCrearCV = async (e) => {
        e.preventDefault();
        try {
            if (hojaVidaId) {
                await http.put(`/hojas-vida/${hojaVidaId}`, datosCV);
                setCvNombre(`${datosCV.nombres} ${datosCV.apellidos}`);
                showAlert({ message: 'Datos actualizados exitosamente', status: 'success' });
            } else {
                const response = await http.post('/hojas-vida', datosCV);
                const idGenerado = response.data?.data?.id || response.data?.id || response.id;
                setHojaVidaId(idGenerado);
                setCvNombre(`${datosCV.nombres} ${datosCV.apellidos}`);
                showAlert({ message: 'Hoja de Vida creada exitosamente', status: 'success' });
            }
        } catch (error) {
            showAlert({ message: 'Error al guardar la Hoja de Vida', status: 'error' });
        }
    };

    const handleProcesarIA = async (e) => {
        e.preventDefault();
        if (!hojaVidaId || !loteFile) return;

        setProcesandoIA(true);
        const formData = new FormData();
        formData.append('archivoLote', loteFile);

        try {
            const response = await http.post(`/soportes-inteligentes/procesar-lote/${hojaVidaId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (response.status === 'SUCCESS' || response.data) {
                const nuevosSoportes = Array.isArray(response.data) ? response.data : (response.data?.data || []);
                setResultadosIA(prev => [...prev, ...nuevosSoportes]);
                showAlert({ message: 'Documentos divididos y clasificados automáticamente', status: 'success' });
                setLoteFile(null);
            }
        } catch (error) {
            showAlert({ message: 'Error al procesar los documentos con IA', status: 'error' });
        } finally {
            setProcesandoIA(false);
        }
    };

    const handleEliminarDocumento = async (idx, idSoporte) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este documento de forma permanente?')) return;
        try {
            await http.delete(`/soportes/${idSoporte}`);
            const nuevos = [...resultadosIA];
            nuevos.splice(idx, 1);
            setResultadosIA(nuevos);
            showAlert({ message: 'Documento eliminado exitosamente', status: 'success' });
        } catch (error) {
            showAlert({ message: 'Error al eliminar documento', status: 'error' });
        }
    };

    const handleGuardarNombre = async (idx, idSoporte) => {
        if (!editDocValue.trim()) return;
        try {
            await http.put(`/soportes/${idSoporte}/tipo?tipoDocumento=${encodeURIComponent(editDocValue)}`);
            const nuevos = [...resultadosIA];
            nuevos[idx].tipoDocumento = editDocValue;
            setResultadosIA(nuevos);
            setEditingDocId(null);
            showAlert({ message: 'Nombre actualizado correctamente', status: 'success' });
        } catch (error) {
            showAlert({ message: 'Error al actualizar el nombre', status: 'error' });
        }
    };

    const tabs = [
        { id: 'datos', label: 'Datos Generales', icon: User, disabled: false },
        { id: 'foto', label: 'Fotografía', icon: Camera, disabled: !hojaVidaId },
        { id: 'competencias', label: 'Competencias', icon: Briefcase, disabled: !hojaVidaId },
        { id: 'soportes', label: 'Soportes IA', icon: Bot, disabled: !hojaVidaId }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200 shadow-sm transition-all"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hoja de Vida</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">{hojaVidaId ? `Perfil: ${cvNombre}` : 'Gestión y creación de colaboradores'}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-0 z-10 backdrop-blur-3xl bg-white/80">
                    <form onSubmit={handleSearch} className="relative w-full max-w-2xl group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors"><Search className="h-5 w-5" /></div>
                        <input type="text" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none bg-gray-50 focus:bg-white placeholder:text-gray-400" placeholder="Escribe el número de documento y presiona Enter para buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
                        {tabs.map((tab) => (
                            <button key={tab.id} disabled={tab.disabled} onClick={() => setActiveTab(tab.id)} className={`flex items-center whitespace-nowrap gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <tab.icon className="w-4 h-4" />{tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'datos' && (
                            <form onSubmit={handleCrearCV} className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Nombres *</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={datosCV.nombres} onChange={(e) => setDatosCV({...datosCV, nombres: e.target.value})} /></div>
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Apellidos *</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={datosCV.apellidos} onChange={(e) => setDatosCV({...datosCV, apellidos: e.target.value})} /></div>
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Cédula *</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={datosCV.cedula} onChange={(e) => setDatosCV({...datosCV, cedula: e.target.value})} /></div>
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Correo Electrónico</label><input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={datosCV.correoElectronico} onChange={(e) => setDatosCV({...datosCV, correoElectronico: e.target.value})} /></div>
                                </div>
                                <div className="flex justify-end pt-4"><button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">Guardar Datos</button></div>
                            </form>
                        )}

                        {activeTab === 'soportes' && (
                            <div className="space-y-10 animate-fade-in">
                                <div className="max-w-3xl mx-auto">
                                    <form onSubmit={handleProcesarIA} className="space-y-6">
                                        <div className="border-2 border-dashed border-indigo-200 bg-white rounded-xl p-8 hover:border-indigo-400 transition-colors text-center">
                                            <FileText className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
                                            <input required type="file" accept="application/pdf" onChange={(e) => setLoteFile(e.target.files[0])} className="block w-full max-w-sm mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                            <p className="mt-3 text-xs text-gray-400">Sube un PDF con todos los soportes. La IA los dividirá automáticamente.</p>
                                        </div>
                                        <button disabled={procesandoIA} type="submit" className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-70 flex justify-center items-center gap-2">
                                            {procesandoIA ? <><Bot className="w-5 h-5 animate-bounce"/> Extrayendo y clasificando documentos...</> : 'Procesar Soportes con IA'}
                                        </button>
                                    </form>
                                </div>

                                {resultadosIA.length > 0 && (
                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="mb-6 flex justify-between items-end">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">Documentos del Colaborador</h3>
                                                <p className="text-sm text-gray-500 mt-1">Archivos extraídos y clasificados por Inteligencia Artificial.</p>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100">
                                                {resultadosIA.length} Documentos
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {resultadosIA.map((doc, idx) => (
                                                <div key={idx} className="flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all group">
                                                    
                                                    <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 relative flex items-center justify-center p-4">
                                                        <FileText className="w-16 h-16 text-slate-300 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                                            <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 text-sm font-bold rounded-lg shadow-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                                <Eye className="w-4 h-4" /> Ver Archivo
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-5 flex flex-col gap-4">
                                                        {editingDocId === doc.id ? (
                                                            <div className="flex gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    autoFocus
                                                                    value={editDocValue} 
                                                                    onChange={(e) => setEditDocValue(e.target.value)}
                                                                    className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                                                    placeholder="Nombre del doc..."
                                                                />
                                                                <button onClick={() => handleGuardarNombre(idx, doc.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"><Save className="w-4 h-4"/></button>
                                                                <button onClick={() => setEditingDocId(null)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"><X className="w-4 h-4"/></button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between items-start gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-slate-700 text-sm truncate" title={doc.tipoDocumento}>{doc.tipoDocumento}</h4>
                                                                    <p className="text-xs text-slate-400 font-medium mt-0.5">{(doc.tamano ? (doc.tamano / 1024).toFixed(1) : 0)} KB • PDF</p>
                                                                </div>
                                                                <button onClick={() => { setEditingDocId(doc.id); setEditDocValue(doc.tipoDocumento); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Renombrar">
                                                                    <Edit2 className="w-4 h-4"/>
                                                                </button>
                                                            </div>
                                                        )}
                                                        
                                                        <button onClick={() => handleEliminarDocumento(idx, doc.id)} className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors group/btn">
                                                            <Trash2 className="w-4 h-4 group-hover/btn:animate-bounce" /> Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};