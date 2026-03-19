import React, { useState } from 'react';
import { Search, FileText, Download, ChevronDown, FileBarChart, BookOpen, GraduationCap, ArrowLeft, User, Camera, Briefcase, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { UsuariosService } from '../../configuracion/services/usuarios.service';

export const HojaVida = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [searchTerm, setSearchTerm] = useState('');
    const [showReportsMenu, setShowReportsMenu] = useState(false);

    const [activeTab, setActiveTab] = useState('datos');
    const [hojaVidaId, setHojaVidaId] = useState(null);
    const [cvNombre, setCvNombre] = useState('');

    const [datosCV, setDatosCV] = useState({
        nombres: '',
        apellidos: '',
        cedula: '',
        fechaNacimiento: '',
        fechaIngreso: '',
        correoElectronico: ''
    });

    const [fotoFile, setFotoFile] = useState(null);

    const [educacion, setEducacion] = useState({
        nivelEstudio: '',
        institucion: '',
        titulo: '',
        fechaInicio: '',
        fechaFin: ''
    });

    const [experiencia, setExperiencia] = useState({
        empresa: '',
        cargo: '',
        fechaInicio: '',
        fechaFin: '',
        funciones: ''
    });

    const [loteFile, setLoteFile] = useState(null);
    const [resultadosIA, setResultadosIA] = useState([]);
    const [procesandoIA, setProcesandoIA] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            const data = await UsuariosService.getAll();
            const usuariosReales = Array.isArray(data) ? data : (data?.data || []);

            const userFound = usuariosReales.find(u => 
                (u.persona?.numero_documento?.toString() === searchTerm.trim()) ||
                (u.cedula?.toString() === searchTerm.trim())
            );

            if (userFound) {
                setDatosCV({
                    nombres: `${userFound.persona?.primer_nombre || ''} ${userFound.persona?.segundo_nombre || ''}`.trim(),
                    apellidos: `${userFound.persona?.primer_apellido || ''} ${userFound.persona?.segundo_apellido || ''}`.trim(),
                    cedula: userFound.persona?.numero_documento || userFound.cedula || '',
                    fechaNacimiento: userFound.persona?.fecha_nacimiento || '',
                    fechaIngreso: datosCV.fechaIngreso, 
                    correoElectronico: userFound.persona?.correo_electronico || ''
                });
                showAlert({ message: 'Datos del colaborador cargados exitosamente', status: 'success' });
            } else {
                showAlert({ message: 'No se encontró un usuario con ese documento', status: 'error' });
            }
        } catch (error) {
            showAlert({ message: 'Error al buscar el usuario en el sistema', status: 'error' });
        }
    };

    const handleCrearCV = async (e) => {
        e.preventDefault();
        try {
            const response = await http.post('/hojas-vida', datosCV);
            if (response.status === 'SUCCESS' || response.data?.id) {
                const idGenerado = response.data?.id || response.object?.id || response.id;
                setHojaVidaId(idGenerado);
                setCvNombre(`${datosCV.nombres} ${datosCV.apellidos}`);
                showAlert({ message: `Hoja de Vida creada con ID: ${idGenerado}`, status: 'success' });
                setActiveTab('foto');
            }
        } catch (error) {
            showAlert({ message: 'Error al crear la Hoja de Vida', status: 'error' });
        }
    };

    const handleSubirFoto = async (e) => {
        e.preventDefault();
        if (!hojaVidaId || !fotoFile) return;

        const formData = new FormData();
        formData.append('foto', fotoFile);

        try {
            await http.post(`/hojas-vida/${hojaVidaId}/foto`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showAlert({ message: 'Foto guardada exitosamente', status: 'success' });
            setActiveTab('competencias');
        } catch (error) {
            showAlert({ message: 'Error al subir la foto', status: 'error' });
        }
    };

    const handleGuardarEducacion = async (e) => {
        e.preventDefault();
        try {
            await http.post(`/hojas-vida/${hojaVidaId}/competencias/educacion`, educacion);
            showAlert({ message: 'Educación agregada exitosamente', status: 'success' });
            setEducacion({ nivelEstudio: '', institucion: '', titulo: '', fechaInicio: '', fechaFin: '' });
        } catch (error) {
            showAlert({ message: 'Error al guardar educación', status: 'error' });
        }
    };

    const handleGuardarExperiencia = async (e) => {
        e.preventDefault();
        try {
            await http.post(`/hojas-vida/${hojaVidaId}/competencias/experiencia`, experiencia);
            showAlert({ message: 'Experiencia agregada exitosamente', status: 'success' });
            setExperiencia({ empresa: '', cargo: '', fechaInicio: '', fechaFin: '', funciones: '' });
        } catch (error) {
            showAlert({ message: 'Error al guardar experiencia', status: 'error' });
        }
    };

    const handleProcesarIA = async (e) => {
        e.preventDefault();
        if (!hojaVidaId || !loteFile) return;

        setProcesandoIA(true);
        const formData = new FormData();
        formData.append('archivoLote', loteFile);

        try {
            const response = await http.post(`/soportes-inteligentes/procesar-lote/${hojaVidaId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.status === 'SUCCESS' && response.data) {
                setResultadosIA(response.data);
                showAlert({ message: 'Procesamiento con IA completado', status: 'success' });
            }
        } catch (error) {
            showAlert({ message: 'Error al procesar los documentos', status: 'error' });
        } finally {
            setProcesandoIA(false);
        }
    };

    const reports = [
        { id: 'R2', label: 'Reporte de competencias', icon: FileBarChart },
        { id: 'R3', label: 'Reporte consolidado de formación', icon: BookOpen },
        { id: 'R4', label: 'Reporte detallado de formación', icon: FileText },
        { id: 'R5', label: 'Reporte consolidado de educación', icon: GraduationCap },
        { id: 'R6', label: 'Reporte detallado de educación', icon: FileText },
    ];

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
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200 shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Hoja de Vida
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">
                            {hojaVidaId ? `Trabajando en perfil: ${cvNombre}` : 'Gestión y creación de colaboradores'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-0 z-10 backdrop-blur-3xl bg-white/80">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none bg-gray-50 focus:bg-white placeholder:text-gray-400"
                                placeholder="Escribe el número de documento y presiona Enter para autocompletar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>

                        <div className="flex flex-wrap items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {}}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-200 transition-all text-sm font-medium"
                            >
                                <Download className="h-4 w-4" />
                                <span>Reporte de brechas</span>
                            </motion.button>

                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowReportsMenu(!showReportsMenu)}
                                    onBlur={() => setTimeout(() => setShowReportsMenu(false), 200)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg shadow-sm transition-all text-sm font-medium"
                                >
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span>Reportes</span>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showReportsMenu ? 'rotate-180' : ''}`} />
                                </motion.button>

                                <AnimatePresence>
                                    {showReportsMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 ring-1 ring-black/5 overflow-hidden z-50 origin-top-right"
                                        >
                                            <div className="py-2">
                                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                                                    Disponibles
                                                </div>
                                                {reports.map((report) => (
                                                    <button
                                                        key={report.id}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left group"
                                                    >
                                                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <report.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{report.id}</span>
                                                            <span className="text-xs text-gray-500 group-hover:text-blue-600/80 line-clamp-1">{report.label}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                disabled={tab.disabled}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'datos' && (
                            <form onSubmit={handleCrearCV} className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Nombres *</label>
                                        <input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={datosCV.nombres} onChange={(e) => setDatosCV({...datosCV, nombres: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Apellidos *</label>
                                        <input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={datosCV.apellidos} onChange={(e) => setDatosCV({...datosCV, apellidos: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Cédula *</label>
                                        <input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={datosCV.cedula} onChange={(e) => setDatosCV({...datosCV, cedula: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                                        <input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={datosCV.correoElectronico} onChange={(e) => setDatosCV({...datosCV, correoElectronico: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Fecha Nacimiento *</label>
                                        <input required type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={datosCV.fechaNacimiento} onChange={(e) => setDatosCV({...datosCV, fechaNacimiento: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Fecha Ingreso *</label>
                                        <input required type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={datosCV.fechaIngreso} onChange={(e) => setDatosCV({...datosCV, fechaIngreso: e.target.value})} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                                        {hojaVidaId ? 'Actualizar Datos' : 'Guardar y Continuar'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'foto' && (
                            <form onSubmit={handleSubirFoto} className="max-w-xl mx-auto space-y-6 animate-fade-in text-center py-8">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors">
                                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccione una fotografía (JPG, PNG)</label>
                                    <input required type="file" accept="image/*" onChange={(e) => setFotoFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                </div>
                                <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                                    Subir Foto
                                </button>
                            </form>
                        )}

                        {activeTab === 'competencias' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-600"/> Agregar Educación</h3>
                                    <form onSubmit={handleGuardarEducacion} className="space-y-4">
                                        <input required type="text" placeholder="Nivel de Estudio" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={educacion.nivelEstudio} onChange={(e) => setEducacion({...educacion, nivelEstudio: e.target.value})} />
                                        <input required type="text" placeholder="Institución" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={educacion.institucion} onChange={(e) => setEducacion({...educacion, institucion: e.target.value})} />
                                        <input required type="text" placeholder="Título Obtenido" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={educacion.titulo} onChange={(e) => setEducacion({...educacion, titulo: e.target.value})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500 ml-1">Fecha Inicio</label>
                                                <input required type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={educacion.fechaInicio} onChange={(e) => setEducacion({...educacion, fechaInicio: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 ml-1">Fecha Fin</label>
                                                <input type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={educacion.fechaFin} onChange={(e) => setEducacion({...educacion, fechaFin: e.target.value})} />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium">Guardar Educación</button>
                                    </form>
                                </div>

                                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600"/> Experiencia Laboral</h3>
                                    <form onSubmit={handleGuardarExperiencia} className="space-y-4">
                                        <input required type="text" placeholder="Empresa" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={experiencia.empresa} onChange={(e) => setExperiencia({...experiencia, empresa: e.target.value})} />
                                        <input required type="text" placeholder="Cargo" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={experiencia.cargo} onChange={(e) => setExperiencia({...experiencia, cargo: e.target.value})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500 ml-1">Fecha Inicio</label>
                                                <input required type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={experiencia.fechaInicio} onChange={(e) => setExperiencia({...experiencia, fechaInicio: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 ml-1">Fecha Fin</label>
                                                <input type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={experiencia.fechaFin} onChange={(e) => setExperiencia({...experiencia, fechaFin: e.target.value})} />
                                            </div>
                                        </div>
                                        <textarea placeholder="Funciones principales" rows="2" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={experiencia.funciones} onChange={(e) => setExperiencia({...experiencia, funciones: e.target.value})}></textarea>
                                        <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Guardar Experiencia</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'soportes' && (
                            <div className="max-w-3xl mx-auto animate-fade-in">
                                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg mb-6 flex gap-3 text-sm">
                                    <Bot className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p>Sube un único archivo PDF que contenga todos los soportes mezclados (Cédula, Diplomas, etc.). La Inteligencia Artificial se encargará de leer, separar y clasificar cada página automáticamente.</p>
                                </div>
                                <form onSubmit={handleProcesarIA} className="space-y-6">
                                    <div className="border-2 border-dashed border-indigo-200 bg-white rounded-xl p-8 hover:border-indigo-400 transition-colors text-center">
                                        <FileText className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
                                        <input required type="file" accept="application/pdf" onChange={(e) => setLoteFile(e.target.files[0])} className="block w-full max-w-sm mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                    </div>
                                    <button disabled={procesandoIA} type="submit" className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-70 flex justify-center items-center gap-2">
                                        {procesandoIA ? <><Bot className="w-5 h-5 animate-bounce"/> Procesando Lote con IA...</> : 'Extraer Documentos'}
                                    </button>
                                </form>

                                {resultadosIA.length > 0 && (
                                    <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-medium text-gray-700 flex items-center justify-between">
                                            <span>Documentos Detectados</span>
                                            <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">{resultadosIA.length} Archivos</span>
                                        </div>
                                        <ul className="divide-y divide-gray-100">
                                            {resultadosIA.map((doc, idx) => (
                                                <li key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-5 h-5 text-red-400" />
                                                        <span className="font-medium text-slate-700">{doc.tipoDocumento}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                                                        {(doc.tamano / 1024).toFixed(1)} KB
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
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