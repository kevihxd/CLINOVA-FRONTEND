import React, { useState, useEffect } from 'react';
import { Search, User, ArrowLeft, FileText, Trash2, Edit2, Save, X, Eye, Upload, Folder, Plus, DownloadCloud, AlertCircle, Calendar, Award, CheckCircle, MapPin, BookOpen, Clock, Syringe, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { cursosService } from '../services/cursos.service';

const CATEGORIAS_SOPORTES = [
    "Acta de grado Profesional", "Acta grado de Bachiller", "Acta grado Título Especialista",
    "Afiliación ARL", "Afiliación EPS", "Afiliación Pensión", "Antecedentes",
    "Caja de compensación", "Cédula de ciudadanía", "Certificación Bancaria",
    "Certificado de curso básico de reanimación cardiopulmonar", "Certificado de Formación",
    "Certificado Experiencia Laboral", "Cesantías", "Contrato", "Convalidación", "Diploma Bachiller",
    "Exámenes Medico Ocupacional", "Formato de requisitos para hoja de vida y contratación",
    "Fundación", "Incapacidades", "Libreta Militar", "Paz y salvo", "PESV",
    "Póliza de responsabilidad Civil", "Preaviso", "Procesos disciplinarios",
    "Resolución expedida por Instituto departamental de salud", "RUT", "Soportes contables",
    "Tarjeta profesional", "Título de profesional", "Título Especialista", "Vacaciones",
    "Varios y/o anexos", "Verificación en Rethus", "Otros Soportes"
];

const VACUNAS_ADMINISTRATIVO = ["INFLUENZA (ANUAL)", "FIEBRE AMARILLA (UNICA)", "COVID", "Triple Viral (Sarampion - Rubeola)"];
const VACUNAS_ASISTENCIAL = ["Triple Viral (Sarampion - Rubeola)", "Hepatitis A", "Hepatitis B", "Fiebre Amarilla", "Tetano Mujeres", "Tetano Hombres"];

export const HojaVida = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { user } = useAuth();
    
    const authorities = user?.authorities || user?.permisos || [];
    const roleString = String(user?.rol || user?.role || '').toUpperCase();
    
    const isAdminOrHR = 
        authorities.includes('ROLE_ADMIN') || authorities.includes('ADMIN') ||
        authorities.includes('ROLE_HR_MANAGER') || authorities.includes('HR_MANAGER') ||
        roleString.includes('ADMIN') || roleString.includes('HR_MANAGER');

    const isStandardUser = !isAdminOrHR;
    const userCedula = user?.numeroDocumento || user?.persona?.numeroDocumento || user?.sub || user?.username || '';

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('datos');
    const [hojaVidaId, setHojaVidaId] = useState(null);
    const [cvNombre, setCvNombre] = useState('');
    const [usuarioHabilitado, setUsuarioHabilitado] = useState(false);

    const [datosCV, setDatosCV] = useState({
        cedula: '', nombres: '', apellidos: '', fechaNacimiento: '', direccionResidencia: '',
        telefono: '', correoElectronico: '', contactoEmergencia: '',
        telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
        fechaIngreso: '', tipoContrato: '', sedeId: '', cargoId: '', salario: '',
        subsidioTransporte: '', estado: '', fechaRetiro: '', motivoRetiro: '', usuarioId: '',
        perfilVacunacion: ''
    });
    
    const [resultadosIA, setResultadosIA] = useState([]);
    const [editingDocId, setEditingDocId] = useState(null);
    const [editDocValue, setEditDocValue] = useState('');

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [docToReject, setDocToReject] = useState(null);
    const [rejectData, setRejectData] = useState({ motivo: '', fechaLimite: '' });

    const [cursosAsignados, setCursosAsignados] = useState([]);
    const [catalogoCursos, setCatalogoCursos] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [nuevoCursoMaestro, setNuevoCursoMaestro] = useState({ nombre: '', descripcion: '', lugarRealizacion: '' });
    const [datosAsignacion, setDatosAsignacion] = useState({ cursoMaestroId: '', fechaLimite: '' });

    useEffect(() => {
        if (isStandardUser && userCedula) {
            setSearchTerm(userCedula);
            fetchHojaVida(userCedula);
        }
    }, [isStandardUser, userCedula]);

    useEffect(() => {
        if (activeTab === 'cursos' && hojaVidaId) {
            cargarCursosAsignados();
        }
    }, [activeTab, hojaVidaId]);

    const cargarCursosAsignados = async () => {
        try {
            const res = await cursosService.listarAsignados(hojaVidaId);
            setCursosAsignados(res.data || res);
        } catch (error) { console.error("Error cargando cursos"); }
    };

    const cargarCatalogoCursos = async () => {
        try {
            const res = await cursosService.listarCatalogo();
            setCatalogoCursos(res.data || res);
        } catch (error) { showAlert({ message: "Error cargando catálogo", status: "error" }); }
    };

    const fetchHojaVida = async (cedula) => {
        const cedulaTrim = cedula.trim();
        if (!cedulaTrim) return;

        let baseUserData = {
            nombres: '',
            apellidos: '',
            correoElectronico: '',
            fechaNacimiento: '',
            direccionResidencia: '',
            telefono: '',
            usuarioId: '',
            perfilVacunacion: ''
        };
        
        let usuarioExiste = false;

        // 1. Obtener datos base del usuario desde Gestión de Usuarios (si es admin) o desde la sesión
        if (!isStandardUser) {
            try {
                const resUsers = await http.get('/usuarios');
                let allUsers = [];
                // El interceptor de Axios ya extrae response.data, así que resUsers puede ser el array directamente
                if (Array.isArray(resUsers)) allUsers = resUsers;
                else if (resUsers?.data && Array.isArray(resUsers.data)) allUsers = resUsers.data;
                else if (resUsers?.content && Array.isArray(resUsers.content)) allUsers = resUsers.content;
                
                const foundUser = allUsers.find(u => {
                    const strBuscar = String(cedulaTrim);
                    return String(u?.persona?.numero_documento) === strBuscar ||
                           String(u?.persona?.numeroDocumento) === strBuscar || 
                           String(u?.numeroDocumento) === strBuscar || 
                           String(u?.username) === strBuscar || 
                           String(u?.cedula) === strBuscar;
                });

                if (foundUser) {
                    usuarioExiste = true;
                    const p = foundUser.persona || {};
                    const nombre1 = p.primer_nombre || p.primerNombre || '';
                    const nombre2 = p.segundo_nombre || p.segundoNombre ? ` ${p.segundo_nombre || p.segundoNombre}` : '';
                    const apellido1 = p.primer_apellido || p.primerApellido || '';
                    const apellido2 = p.segundo_apellido || p.segundoApellido ? ` ${p.segundo_apellido || p.segundoApellido}` : '';

                    baseUserData.nombres = foundUser.nombres || `${nombre1}${nombre2}`.trim();
                    baseUserData.apellidos = foundUser.apellidos || `${apellido1}${apellido2}`.trim();
                    baseUserData.correoElectronico = p.correo_electronico || p.correoElectronico || foundUser.email || foundUser.username || '';
                    baseUserData.fechaNacimiento = p.fecha_nacimiento || p.fechaNacimiento || '';
                    baseUserData.direccionResidencia = p.direccion_residencia || p.direccionResidencia || '';
                    baseUserData.telefono = p.numero_telefono || p.numeroTelefono || '';
                    baseUserData.usuarioId = foundUser.id || '';
                    baseUserData.perfilVacunacion = p.perfil_vacunacion || p.perfilVacunacion || foundUser.perfilVacunacion || '';
                }
            } catch (err) {
                console.error("Error buscando en usuarios", err);
            }
        } else {
            usuarioExiste = true;
            const p = user?.persona || {};
            baseUserData.nombres = p.primer_nombre || p.primerNombre ? `${p.primer_nombre || p.primerNombre} ${p.segundo_nombre || p.segundoNombre || ''}`.trim() : '';
            baseUserData.apellidos = p.primer_apellido || p.primerApellido ? `${p.primer_apellido || p.primerApellido} ${p.segundo_apellido || p.segundoApellido || ''}`.trim() : '';
            baseUserData.correoElectronico = p.correo_electronico || p.correoElectronico || user?.email || '';
            baseUserData.usuarioId = user?.id || '';
            if (p.fecha_nacimiento || p.fechaNacimiento) baseUserData.fechaNacimiento = p.fecha_nacimiento || p.fechaNacimiento;
            if (p.direccion_residencia || p.direccionResidencia) baseUserData.direccionResidencia = p.direccion_residencia || p.direccionResidencia;
            if (p.numero_telefono || p.numeroTelefono) baseUserData.telefono = p.numero_telefono || p.numeroTelefono;
            if (p.perfil_vacunacion || p.perfilVacunacion) baseUserData.perfilVacunacion = p.perfil_vacunacion || p.perfilVacunacion;
        }

        if (!usuarioExiste && !isStandardUser) {
            setUsuarioHabilitado(false);
            setHojaVidaId(null);
            setCvNombre('');
            setResultadosIA([]);
            setCursosAsignados([]);
            setDatosCV({
                cedula: cedulaTrim, nombres: '', apellidos: '', fechaNacimiento: '', direccionResidencia: '',
                telefono: '', correoElectronico: '', contactoEmergencia: '',
                telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
                fechaIngreso: '', tipoContrato: '', sedeId: '', cargoId: '', salario: '',
                subsidioTransporte: '', estado: '', fechaRetiro: '', motivoRetiro: '', usuarioId: '',
                perfilVacunacion: ''
            });
            showAlert({ message: 'El usuario no existe. Regístrelo primero en el módulo de Gestión de Usuarios.', status: 'error' });
            return;
        }

        // 2. Obtener datos de Hoja de Vida (laborales y complementarios que haya llenado)
        let hvData = null;
        try {
            const responseHv = await http.get(`/hojas-vida/cedula/${cedulaTrim}`);
            if (responseHv) { // El interceptor ya retorna response.data
                hvData = responseHv.data || responseHv; // Por si viene envuelto, o sino el objeto directo
            }
        } catch (error) {
            // No existe hoja de vida todavía, sólo existen los datos base del usuario.
        }

        setUsuarioHabilitado(true);

        if (hvData) {
            setHojaVidaId(hvData.id);
            const finalNombre = hvData.nombres || baseUserData.nombres;
            const finalApellidos = hvData.apellidos || baseUserData.apellidos;
            setCvNombre(`${finalNombre} ${finalApellidos}`);
            
            setDatosCV({
                cedula: hvData.cedula || cedulaTrim,
                nombres: finalNombre || '',
                apellidos: finalApellidos || '',
                fechaNacimiento: hvData.fechaNacimiento || hvData.fecha_nacimiento || baseUserData.fechaNacimiento || '',
                direccionResidencia: hvData.direccionResidencia || hvData.direccion_residencia || baseUserData.direccionResidencia || '',
                telefono: hvData.telefono || hvData.numero_telefono || baseUserData.telefono || '',
                correoElectronico: hvData.correoElectronico || hvData.correo_electronico || baseUserData.correoElectronico || '',
                contactoEmergencia: hvData.contactoEmergencia || hvData.contacto_emergencia || '',
                telefonoContactoEmergencia: hvData.telefonoContactoEmergencia || hvData.telefono_contacto_emergencia || '',
                arl: hvData.arl || '',
                eps: hvData.eps || '',
                afp: hvData.afp || '',
                cajaCompensacion: hvData.cajaCompensacion || hvData.caja_compensacion || '',
                fechaIngreso: hvData.fechaIngreso || hvData.fecha_ingreso || '',
                tipoContrato: hvData.tipoContrato || hvData.tipo_contrato || '',
                sedeId: hvData.sedes?.length > 0 ? hvData.sedes[0].id : '',
                cargoId: hvData.cargos?.length > 0 ? hvData.cargos[0].id : '',
                salario: hvData.salario || '',
                subsidioTransporte: hvData.subsidioTransporte || hvData.subsidio_transporte || '',
                estado: hvData.estado || '',
                fechaRetiro: hvData.fechaRetiro || hvData.fecha_retiro || '',
                motivoRetiro: hvData.motivoRetiro || hvData.motivo_retiro || '',
                usuarioId: hvData.usuarioId || hvData.usuario_id || baseUserData.usuarioId || '',
                perfilVacunacion: hvData.perfilVacunacion || hvData.perfil_vacunacion || baseUserData.perfilVacunacion || ''
            });

            try {
                const soportesRes = await http.get(`/soportes/hoja-vida/${hvData.id}`);
                if (soportesRes.data) setResultadosIA(Array.isArray(soportesRes.data) ? soportesRes.data : (soportesRes.data.data || []));
            } catch (err) {
                setResultadosIA([]);
            }
            
            if (!isStandardUser) showAlert({ message: 'Se cargaron los datos completos del usuario', status: 'success' });
        } else {
            setHojaVidaId(null);
            const fullNameUnificado = `${baseUserData.nombres} ${baseUserData.apellidos}`.trim();
            setCvNombre(fullNameUnificado);
            setResultadosIA([]);
            setCursosAsignados([]);
            
            setDatosCV({
                cedula: cedulaTrim,
                nombres: baseUserData.nombres || '',
                apellidos: baseUserData.apellidos || '',
                fechaNacimiento: baseUserData.fechaNacimiento || '',
                direccionResidencia: baseUserData.direccionResidencia || '',
                telefono: baseUserData.telefono || '',
                correoElectronico: baseUserData.correoElectronico || '',
                contactoEmergencia: '', telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
                fechaIngreso: '', tipoContrato: '', sedeId: '', cargoId: '', salario: '', subsidioTransporte: '', estado: '', fechaRetiro: '', motivoRetiro: '',
                usuarioId: baseUserData.usuarioId || '',
                perfilVacunacion: baseUserData.perfilVacunacion || ''
            });
            
            if (!isStandardUser) showAlert({ message: 'Usuario encontrado. Complete la información restante para su Hoja de Vida.', status: 'info' });
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        await fetchHojaVida(searchTerm);
        setIsSearching(false);
    };

    const handleCrearCV = async (e) => {
        e.preventDefault();
        try {
            let idActual = hojaVidaId;
            
            const payload = {
                nombres: datosCV.nombres, apellidos: datosCV.apellidos, cedula: datosCV.cedula,
                fechaNacimiento: datosCV.fechaNacimiento || null, direccionResidencia: datosCV.direccionResidencia,
                telefono: datosCV.telefono, contactoEmergencia: datosCV.contactoEmergencia, telefonoContactoEmergencia: datosCV.telefonoContactoEmergencia,
                arl: datosCV.arl, eps: datosCV.eps, afp: datosCV.afp, cajaCompensacion: datosCV.cajaCompensacion,
                salario: datosCV.salario ? parseFloat(datosCV.salario) : null, subsidioTransporte: datosCV.subsidioTransporte,
                fechaIngreso: datosCV.fechaIngreso || null, estado: datosCV.estado, tipoContrato: datosCV.tipoContrato,
                fechaRetiro: datosCV.fechaRetiro || null, motivoRetiro: datosCV.motivoRetiro, correoElectronico: datosCV.correoElectronico || null,
                perfilVacunacion: datosCV.perfilVacunacion, usuarioId: datosCV.usuarioId ? parseInt(datosCV.usuarioId) : null,
                cargosIds: datosCV.cargoId ? [parseInt(datosCV.cargoId)] : [], sedesIds: datosCV.sedeId ? [parseInt(datosCV.sedeId)] : []
            };

            if (idActual) {
                await http.put(`/hojas-vida/${idActual}`, payload);
                showAlert({ message: 'Datos actualizados exitosamente', status: 'success' });
            } else {
                const response = await http.post('/hojas-vida', payload);
                idActual = response.data?.data?.id || response.data?.id || response.id;
                setHojaVidaId(idActual);
                showAlert({ message: 'Hoja de Vida registrada exitosamente', status: 'success' });
            }
            setCvNombre(`${datosCV.nombres} ${datosCV.apellidos}`);
        } catch (error) {
            showAlert({ message: 'Error al guardar la información', status: 'error' });
        }
    };

    const handleManualUpload = async (e, categoria) => {
        const file = e.target.files[0];
        if (!file || !hojaVidaId) return;

        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('datos', new Blob([JSON.stringify({ tipoDocumento: categoria, hojaVidaId: hojaVidaId })], { type: 'application/json' }));

        try {
            const response = await http.post('/soportes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const nuevoDoc = response.data?.data || response.data;
            setResultadosIA(prev => [...prev, nuevoDoc]);
            showAlert({ message: 'Documento subido exitosamente', status: 'success' });
        } catch (error) {
            showAlert({ message: 'Error al subir documento', status: 'error' });
        }
    };

    const handleEliminarDocumento = async (idSoporte) => {
        if (!window.confirm('¿Eliminar este documento de forma permanente?')) return;
        try {
            await http.delete(`/soportes/${idSoporte}`);
            setResultadosIA(prev => prev.filter(doc => doc.id !== idSoporte));
            showAlert({ message: 'Documento eliminado exitosamente', status: 'success' });
        } catch (error) {
            showAlert({ message: 'Error al eliminar documento', status: 'error' });
        }
    };

    const handleGuardarNombre = async (idSoporte) => {
        if (!editDocValue.trim()) return;
        try {
            await http.put(`/soportes/${idSoporte}/tipo?tipoDocumento=${encodeURIComponent(editDocValue)}`);
            setResultadosIA(prev => prev.map(doc => doc.id === idSoporte ? { ...doc, tipoDocumento: editDocValue } : doc));
            setEditingDocId(null);
            showAlert({ message: 'Nombre actualizado', status: 'success' });
        } catch (error) {
            showAlert({ message: 'Error al actualizar nombre', status: 'error' });
        }
    };

    const handleRechazarDocumento = async (e) => {
        e.preventDefault();
        if (!docToReject) return;
        try {
            await http.put(`/soportes/${docToReject.id}/rechazar`, rejectData);
            setResultadosIA(prev => prev.map(doc => doc.id === docToReject.id ? { ...doc, estado: 'Rechazado' } : doc));
            setRejectModalOpen(false);
            setDocToReject(null);
            setRejectData({ motivo: '', fechaLimite: '' });
            showAlert({ message: 'Documento rechazado y notificación enviada', status: 'success' });
        } catch (error) {
            showAlert({ message: 'Error al rechazar el documento', status: 'error' });
        }
    };

    const verDocumento = (rutaArchivo) => {
        window.open(`http://localhost:8080/${rutaArchivo}`, '_blank');
    };

    const handleDescargarDocumento = async (rutaArchivo, nombreArchivo) => {
        try {
            const response = await fetch(`http://localhost:8080/${rutaArchivo}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo || 'documento.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showAlert({ message: 'Error al descargar el documento', status: 'error' });
        }
    };

    const handleCrearCursoCatalogo = async (e) => {
        e.preventDefault();
        try {
            await cursosService.crearCursoCatalogo(nuevoCursoMaestro);
            showAlert({ message: "Curso añadido al catálogo", status: "success" });
            setNuevoCursoMaestro({ nombre: '', descripcion: '', lugarRealizacion: '' });
            cargarCatalogoCursos();
        } catch (error) { showAlert({ message: "Error al crear curso", status: "error" }); }
    };

    const handleAsignarCurso = async (e) => {
        e.preventDefault();
        try {
            await cursosService.asignarCurso({ hojaVidaId: hojaVidaId, cursoMaestroId: datosAsignacion.cursoMaestroId, fechaLimite: datosAsignacion.fechaLimite });
            showAlert({ message: "Curso asignado al colaborador", status: "success" });
            setShowAssignModal(false);
            cargarCursosAsignados();
        } catch (error) { showAlert({ message: "Error al asignar curso", status: "error" }); }
    };

    const handleEliminarAsignacion = async (id) => {
        if (!window.confirm('¿Eliminar esta asignación?')) return;
        try {
            await cursosService.eliminarAsignacion(id);
            showAlert({ message: "Asignación eliminada", status: "success" });
            cargarCursosAsignados();
        } catch (error) { showAlert({ message: "Error al eliminar asignación", status: "error" }); }
    };

    const handleSubirCertificadoCurso = async (cursoAsignadoId, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('datos', new Blob([JSON.stringify({ tipoDocumento: 'Certificado de Formación', cursoAsignadoId: cursoAsignadoId })], { type: 'application/json' }));
        try {
            await http.post('/soportes/curso', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showAlert({ message: 'Certificado entregado', status: 'success' });
            cargarCursosAsignados();
        } catch (error) { showAlert({ message: 'Error al subir certificado', status: 'error' }); }
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white";
    const labelClass = "text-xs font-semibold text-gray-600 mb-1.5 block";
    const readOnlyClass = "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200";

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 relative">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white text-gray-500 hover:bg-gray-100 rounded-full shadow-sm transition-all"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{isStandardUser ? 'Mi Hoja de Vida' : 'Gestión de Hoja de Vida'}</h1>
                        <p className="text-gray-500 text-sm">{hojaVidaId ? `Perfil activo: ${cvNombre}` : (isStandardUser ? 'Verifica y completa tus datos' : 'Actualización de perfil laboral')}</p>
                    </div>
                </div>

                {!isStandardUser && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <form onSubmit={handleSearch} className="flex gap-3 w-full max-w-xl">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Search className="h-4 w-4" /></div>
                                <input type="text" required className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm outline-none" placeholder="Buscar cédula del usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <button type="submit" disabled={isSearching} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px] text-sm">
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                            </button>
                        </form>
                    </div>
                )}

                {!usuarioHabilitado && !isStandardUser ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                        <User size={48} className="text-gray-300 mb-4" />
                        <h2 className="text-lg font-bold text-gray-700">Ningún usuario seleccionado</h2>
                        <p className="text-gray-500 text-sm mt-2 max-w-md">
                            Utilice el buscador superior para cargar los datos de un colaborador. <br/><br/>
                            <span className="text-red-500 font-semibold">Nota:</span> Si el usuario no existe, debe registrarlo primero en el módulo de <b>Gestión de Usuarios</b>.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                            <button onClick={() => setActiveTab('datos')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'datos' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                <User className="w-4 h-4" /> Datos Generales
                            </button>
                            <button disabled={!hojaVidaId} onClick={() => setActiveTab('soportes')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'soportes' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'} ${!hojaVidaId ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                <Folder className="w-4 h-4" /> Soportes Documentales
                            </button>
                            <button disabled={!hojaVidaId} onClick={() => setActiveTab('vacunacion')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'vacunacion' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'} ${!hojaVidaId ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                <Syringe className="w-4 h-4" /> Vacunación
                            </button>
                            <button disabled={!hojaVidaId} onClick={() => setActiveTab('cursos')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'cursos' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'} ${!hojaVidaId ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                <Award className="w-4 h-4" /> Formación y Cursos
                            </button>
                        </div>

                        <div className="p-6">
                            {/* --- TAB: DATOS GENERALES --- */}
                            {activeTab === 'datos' && (
                                <form onSubmit={handleCrearCV} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        <div className="space-y-4">
                                            {/* DATOS PERSONALES - SIEMPRE BLOQUEADOS, VIENEN DEL MODULO USUARIOS */}
                                            <div><label className={labelClass}>Cédula de ciudadanía *</label><input readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.cedula} /></div>
                                            <div><label className={labelClass}>Nombres *</label><input readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.nombres} /></div>
                                            <div><label className={labelClass}>Apellidos *</label><input readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.apellidos} /></div>
                                            <div><label className={labelClass}>Correo electrónico</label><input readOnly type="email" className={`${inputClass} ${readOnlyClass}`} value={datosCV.correoElectronico} /></div>
                                            
                                            <div className="border-t border-gray-100 my-4 pt-4">
                                                <h4 className="text-xs font-bold text-blue-600 mb-4 uppercase">Información Complementaria</h4>
                                                <div><label className={labelClass}>Fecha Nacimiento</label><input type="date" className={inputClass} value={datosCV.fechaNacimiento} onChange={(e) => setDatosCV({...datosCV, fechaNacimiento: e.target.value})} /></div>
                                                <div className="mt-4"><label className={labelClass}>Dirección</label><input type="text" className={inputClass} value={datosCV.direccionResidencia} onChange={(e) => setDatosCV({...datosCV, direccionResidencia: e.target.value})} /></div>
                                                <div className="mt-4"><label className={labelClass}>Teléfono(s)</label><input type="text" className={inputClass} value={datosCV.telefono} onChange={(e) => setDatosCV({...datosCV, telefono: e.target.value})} /></div>
                                                <div className="mt-4"><label className={labelClass}>Contacto de emergencia</label><input type="text" className={inputClass} value={datosCV.contactoEmergencia} onChange={(e) => setDatosCV({...datosCV, contactoEmergencia: e.target.value})} /></div>
                                                <div className="mt-4"><label className={labelClass}>Tel. Contacto Emergencia</label><input type="text" className={inputClass} value={datosCV.telefonoContactoEmergencia} onChange={(e) => setDatosCV({...datosCV, telefonoContactoEmergencia: e.target.value})} /></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-blue-600 mb-4 uppercase">Información Laboral y Salud</h4>
                                            <div>
                                                <label className={labelClass}>Perfil de Vacunación *</label>
                                                <select required className={inputClass} value={datosCV.perfilVacunacion} onChange={(e) => setDatosCV({...datosCV, perfilVacunacion: e.target.value})}>
                                                    <option value="">Seleccione un perfil...</option>
                                                    <option value="Administrativo">Administrativo</option>
                                                    <option value="Asistencial">Asistencial</option>
                                                </select>
                                            </div>
                                            <div><label className={labelClass}>ARL</label><input type="text" className={inputClass} value={datosCV.arl} onChange={(e) => setDatosCV({...datosCV, arl: e.target.value})} /></div>
                                            <div><label className={labelClass}>EPS</label><input type="text" className={inputClass} value={datosCV.eps} onChange={(e) => setDatosCV({...datosCV, eps: e.target.value})} /></div>
                                            <div><label className={labelClass}>AFP</label><input type="text" className={inputClass} value={datosCV.afp} onChange={(e) => setDatosCV({...datosCV, afp: e.target.value})} /></div>
                                            <div><label className={labelClass}>Caja de compensación</label><input type="text" className={inputClass} value={datosCV.cajaCompensacion} onChange={(e) => setDatosCV({...datosCV, cajaCompensacion: e.target.value})} /></div>
                                            <div><label className={labelClass}>Fecha de ingreso</label><input type="date" className={inputClass} value={datosCV.fechaIngreso} onChange={(e) => setDatosCV({...datosCV, fechaIngreso: e.target.value})} /></div>
                                            <div>
                                                <label className={labelClass}>Tipo de contrato</label>
                                                <select className={inputClass} value={datosCV.tipoContrato} onChange={(e) => setDatosCV({...datosCV, tipoContrato: e.target.value})}>
                                                    <option value="">Seleccione...</option>
                                                    <option value="Fijo">Término Fijo</option>
                                                    <option value="Indefinido">Término Indefinido</option>
                                                    <option value="Prestacion">Prestación de Servicios</option>
                                                </select>
                                            </div>
                                            <div><label className={labelClass}>Sede</label><input type="text" className={inputClass} value={datosCV.sedeId} onChange={(e) => setDatosCV({...datosCV, sedeId: e.target.value})} /></div>
                                            <div><label className={labelClass}>Cargo</label><input type="text" className={inputClass} value={datosCV.cargoId} onChange={(e) => setDatosCV({...datosCV, cargoId: e.target.value})} /></div>
                                            <div><label className={labelClass}>Salario</label><input type="number" className={inputClass} value={datosCV.salario} onChange={(e) => setDatosCV({...datosCV, salario: e.target.value})} /></div>
                                            <div>
                                                <label className={labelClass}>Subsidio de transporte</label>
                                                <select className={inputClass} value={datosCV.subsidioTransporte} onChange={(e) => setDatosCV({...datosCV, subsidioTransporte: e.target.value})}>
                                                    <option value="">Seleccione...</option>
                                                    <option value="Si">Sí</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Estado</label>
                                                <select className={inputClass} value={datosCV.estado} onChange={(e) => setDatosCV({...datosCV, estado: e.target.value})}>
                                                    <option value="">Seleccione...</option>
                                                    <option value="Activo">Activo</option>
                                                    <option value="Inactivo">Inactivo</option>
                                                </select>
                                            </div>
                                            <div><label className={labelClass}>Fecha de retiro</label><input type="date" className={inputClass} value={datosCV.fechaRetiro} onChange={(e) => setDatosCV({...datosCV, fechaRetiro: e.target.value})} /></div>
                                            <div><label className={labelClass}>Motivo de retiro</label><input type="text" className={inputClass} value={datosCV.motivoRetiro} onChange={(e) => setDatosCV({...datosCV, motivoRetiro: e.target.value})} /></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-6 border-t border-gray-200">
                                        <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded shadow-sm hover:bg-blue-700 transition-colors">
                                            Guardar Hoja de Vida
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* --- TAB: SOPORTES DOCUMENTALES --- */}
                            {activeTab === 'soportes' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {CATEGORIAS_SOPORTES.map((categoria) => {
                                            const docsCategoria = resultadosIA.filter(d => d.tipoDocumento === categoria || (categoria === "Otros Soportes" && !CATEGORIAS_SOPORTES.includes(d.tipoDocumento)));

                                            return (
                                                <div key={categoria} className="border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col overflow-hidden">
                                                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Folder className="w-5 h-5 text-blue-500 fill-blue-100" />
                                                            <h3 className="font-bold text-gray-800 text-xs truncate" title={categoria}>{categoria}</h3>
                                                        </div>
                                                        <span className="text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                                            {docsCategoria.length}
                                                        </span>
                                                    </div>

                                                    <div className="p-4 flex-1 flex flex-col gap-3 min-h-[120px] bg-gray-50/30">
                                                        {docsCategoria.length === 0 ? (
                                                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                                                <p className="text-xs mb-3">Carpeta vacía</p>
                                                                <label className="cursor-pointer flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors">
                                                                    <Upload className="w-3 h-3" /> Subir Manual
                                                                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleManualUpload(e, categoria)} />
                                                                </label>
                                                            </div>
                                                        ) : (
                                                            docsCategoria.map(doc => (
                                                                <div key={doc.id} className={`bg-white border p-3 rounded shadow-sm flex flex-col gap-2 ${doc.estado === 'Rechazado' ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}>
                                                                    {editingDocId === doc.id ? (
                                                                        <div className="flex gap-1">
                                                                            <input type="text" autoFocus value={editDocValue} onChange={(e) => setEditDocValue(e.target.value)} className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded outline-none" />
                                                                            <button onClick={() => handleGuardarNombre(doc.id)} className="p-1 bg-green-100 text-green-700 rounded"><Save className="w-3 h-3"/></button>
                                                                            <button onClick={() => setEditingDocId(null)} className="p-1 bg-gray-100 text-gray-600 rounded"><X className="w-3 h-3"/></button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                                                <div className="flex items-center gap-2">
                                                                                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                                                                                    <h4 className="font-semibold text-gray-700 text-xs truncate" title={doc.tipoDocumento}>{doc.tipoDocumento}</h4>
                                                                                </div>
                                                                                {doc.estado === 'Rechazado' && (
                                                                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                                                                                        Rechazado
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <button onClick={() => { setEditingDocId(doc.id); setEditDocValue(doc.tipoDocumento); }} className="text-gray-400 hover:text-blue-600 ml-2 shrink-0"><Edit2 className="w-3 h-3"/></button>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className={`grid gap-1.5 mt-1 ${isAdminOrHR ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                                                        <button onClick={() => verDocumento(doc.rutaArchivo)} className="py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 flex justify-center items-center" title="Previsualizar">
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button onClick={() => handleDescargarDocumento(doc.rutaArchivo, doc.nombreArchivo)} className="py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 flex justify-center items-center" title="Descargar">
                                                                            <DownloadCloud className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        
                                                                        {isAdminOrHR && (
                                                                            <button onClick={() => { setDocToReject(doc); setRejectModalOpen(true); }} className="py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded hover:bg-orange-100 flex justify-center items-center" title="Rechazar Documento">
                                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        )}
                                                                        
                                                                        <button onClick={() => handleEliminarDocumento(doc.id)} className="py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 flex justify-center items-center" title="Eliminar">
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}

                                                        {docsCategoria.length > 0 && (
                                                            <label className="mt-auto cursor-pointer flex items-center justify-center gap-1 text-xs font-bold text-gray-500 bg-white border border-dashed border-gray-300 px-2 py-1.5 rounded hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                                                <Plus className="w-3 h-3" /> Añadir otro
                                                                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleManualUpload(e, categoria)} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: VACUNACION --- */}
                            {activeTab === 'vacunacion' && (
                                <div className="space-y-6">
                                    {!datosCV.perfilVacunacion ? (
                                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                            <Syringe size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-semibold text-gray-500">Perfil de Vacunación no definido</p>
                                            <p className="text-sm mt-1">Seleccione el perfil en la pestaña de Datos Generales.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {(datosCV.perfilVacunacion === 'Administrativo' ? VACUNAS_ADMINISTRATIVO : VACUNAS_ASISTENCIAL).map((vacuna) => {
                                                const categoria = `Vacuna: ${vacuna}`;
                                                const docsCategoria = resultadosIA.filter(d => d.tipoDocumento === categoria);

                                                return (
                                                    <div key={categoria} className="border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col overflow-hidden">
                                                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Syringe className="w-5 h-5 text-blue-500 fill-blue-100" />
                                                                <h3 className="font-bold text-gray-800 text-xs truncate" title={vacuna}>{vacuna}</h3>
                                                            </div>
                                                            <span className="text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                                                {docsCategoria.length}
                                                            </span>
                                                        </div>

                                                        <div className="p-4 flex-1 flex flex-col gap-3 min-h-[120px] bg-gray-50/30">
                                                            {docsCategoria.length === 0 ? (
                                                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                                                    <p className="text-xs mb-3">Sin soporte</p>
                                                                    <label className="cursor-pointer flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors">
                                                                        <Upload className="w-3 h-3" /> Subir Soporte
                                                                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleManualUpload(e, categoria)} />
                                                                    </label>
                                                                </div>
                                                            ) : (
                                                                docsCategoria.map(doc => (
                                                                    <div key={doc.id} className={`bg-white border p-3 rounded shadow-sm flex flex-col gap-2 ${doc.estado === 'Rechazado' ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}>
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                                                <div className="flex items-center gap-2">
                                                                                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                                                                                    <h4 className="font-semibold text-gray-700 text-xs truncate">Soporte Cargado</h4>
                                                                                </div>
                                                                                {doc.estado === 'Rechazado' && (
                                                                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Rechazado</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className={`grid gap-1.5 mt-1 ${isAdminOrHR ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                                                            <button onClick={() => verDocumento(doc.rutaArchivo)} className="py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 flex justify-center items-center" title="Previsualizar">
                                                                                <Eye className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            <button onClick={() => handleDescargarDocumento(doc.rutaArchivo, doc.nombreArchivo)} className="py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 flex justify-center items-center" title="Descargar">
                                                                                <DownloadCloud className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            {isAdminOrHR && (
                                                                                <button onClick={() => { setDocToReject(doc); setRejectModalOpen(true); }} className="py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded hover:bg-orange-100 flex justify-center items-center" title="Rechazar Documento">
                                                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            )}
                                                                            <button onClick={() => handleEliminarDocumento(doc.id)} className="py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 flex justify-center items-center" title="Eliminar">
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                            {docsCategoria.length > 0 && (
                                                                <label className="mt-auto cursor-pointer flex items-center justify-center gap-1 text-xs font-bold text-gray-500 bg-white border border-dashed border-gray-300 px-2 py-1.5 rounded hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                                                    <Plus className="w-3 h-3" /> Añadir otro
                                                                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleManualUpload(e, categoria)} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- TAB: CURSOS Y FORMACIÓN --- */}
                            {activeTab === 'cursos' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800">Requerimientos de Formación</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {isAdminOrHR ? "Asigne cursos obligatorios al colaborador y gestione el catálogo." : "Cursos requeridos por la institución. Suba su certificado."}
                                            </p>
                                        </div>
                                        {isAdminOrHR && (
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button onClick={() => { cargarCatalogoCursos(); setShowCatalogModal(true); }} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded text-xs font-bold hover:bg-gray-50">Catálogo</button>
                                                <button onClick={() => { cargarCatalogoCursos(); setShowAssignModal(true); }} className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"><Plus size={14} /> Asignar</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {cursosAsignados.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                                <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-sm font-semibold">No hay cursos asignados a este perfil</p>
                                            </div>
                                        ) : (
                                            cursosAsignados.map((asignacion) => (
                                                <div key={asignacion.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-sm font-bold text-gray-800">{asignacion.cursoMaestro.nombre}</h4>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${asignacion.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{asignacion.estado}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600">{asignacion.cursoMaestro.descripcion}</p>
                                                        <div className="flex gap-3 pt-2">
                                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100"><MapPin size={12} className="text-gray-400" /> {asignacion.cursoMaestro.lugarRealizacion}</div>
                                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100"><Clock size={12} className="text-gray-400" /> Límite: {asignacion.fechaLimite}</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full md:w-48 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                                                        {asignacion.estado === 'ENTREGADO' || asignacion.certificado ? (
                                                            <div className="bg-green-50 text-green-700 rounded p-3 text-center border border-green-200">
                                                                <CheckCircle size={20} className="mx-auto mb-1" />
                                                                <p className="text-xs font-bold">Certificado Entregado</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <label className="cursor-pointer flex justify-center items-center gap-2 w-full py-2 bg-blue-50 text-blue-700 rounded font-bold text-xs border border-blue-200 hover:bg-blue-100 transition-colors">
                                                                    <Upload size={14} /> Subir Certificado
                                                                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleSubirCertificadoCurso(asignacion.id, e)} />
                                                                </label>
                                                                {isAdminOrHR && <button onClick={() => handleEliminarAsignacion(asignacion.id)} className="w-full py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded">Retirar Asignación</button>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {rejectModalOpen && docToReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" /> Rechazar Documento
                            </h3>
                            <button onClick={() => setRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleRechazarDocumento} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Estás rechazando: <span className="font-bold text-gray-800">{docToReject.tipoDocumento}</span>. Se enviará una notificación a <strong>{datosCV.correoElectronico || 'correo no registrado'}</strong>.
                            </p>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 block">Motivo del rechazo *</label>
                                <textarea required rows={3} className={inputClass} placeholder="Ej. El documento es ilegible o le faltan firmas..." value={rejectData.motivo} onChange={(e) => setRejectData({...rejectData, motivo: e.target.value})} />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha límite para subir corrección *</label>
                                <input required type="date" className={inputClass} value={rejectData.fechaLimite} onChange={(e) => setRejectData({...rejectData, fechaLimite: e.target.value})} />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 font-medium">Cancelar</button>
                                <button type="submit" className="px-4 py-2 text-sm text-white bg-orange-500 rounded hover:bg-orange-600 font-bold">Confirmar Rechazo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL ASIGNAR CURSO --- */}
            {isAdminOrHR && showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-sm">Asignar Curso</h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAsignarCurso} className="p-6 space-y-4">
                            <div>
                                <label className={labelClass}>Curso</label>
                                <select required className={inputClass} value={datosAsignacion.cursoMaestroId} onChange={e => setDatosAsignacion({...datosAsignacion, cursoMaestroId: e.target.value})}>
                                    <option value="">Seleccione...</option>
                                    {catalogoCursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div><label className={labelClass}>Fecha Límite</label><input required type="date" className={inputClass} value={datosAsignacion.fechaLimite} onChange={e => setDatosAsignacion({...datosAsignacion, fechaLimite: e.target.value})} /></div>
                            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded font-bold mt-4 text-sm hover:bg-blue-700">Asignar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL CATÁLOGO DE CURSOS --- */}
            {isAdminOrHR && showCatalogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-sm">Catálogo Maestro</h3>
                            <button onClick={() => setShowCatalogModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>
                        <div className="p-6 border-b border-gray-100 bg-white">
                            <form onSubmit={handleCrearCursoCatalogo} className="space-y-4">
                                <div><input required type="text" placeholder="Nombre del curso (Ej. Alturas)" className={inputClass} value={nuevoCursoMaestro.nombre} onChange={e => setNuevoCursoMaestro({...nuevoCursoMaestro, nombre: e.target.value})} /></div>
                                <div><textarea required rows={2} placeholder="Descripción..." className={inputClass} value={nuevoCursoMaestro.descripcion} onChange={e => setNuevoCursoMaestro({...nuevoCursoMaestro, descripcion: e.target.value})} /></div>
                                <div><input required type="text" placeholder="Lugar o Entidad" className={inputClass} value={nuevoCursoMaestro.lugarRealizacion} onChange={e => setNuevoCursoMaestro({...nuevoCursoMaestro, lugarRealizacion: e.target.value})} /></div>
                                <button type="submit" className="px-6 py-2 bg-gray-800 text-white rounded font-bold text-xs hover:bg-gray-900">Añadir al Catálogo</button>
                            </form>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                            <div className="space-y-3">
                                {catalogoCursos.map(c => (
                                    <div key={c.id} className="p-4 bg-white border border-gray-200 rounded shadow-sm">
                                        <h5 className="font-bold text-gray-800 text-sm">{c.nombre}</h5>
                                        <p className="text-xs text-gray-500 mt-1">{c.lugarRealizacion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};