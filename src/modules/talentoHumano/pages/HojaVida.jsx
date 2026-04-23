import React, { useState, useEffect } from 'react';
import { Search, User, ArrowLeft, FileText, Trash2, Edit2, Save, X, Eye, Upload, Folder, Plus, DownloadCloud, AlertCircle, Calendar, Award, CheckCircle, MapPin, BookOpen, Clock, Syringe, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

    const [catalogoVacunasGlobal, setCatalogoVacunasGlobal] = useState([]);

    const [datosCV, setDatosCV] = useState({
        cedula: '', nombres: '', apellidos: '', fechaNacimiento: '', direccionResidencia: '',
        telefono: '', correoElectronico: '', contactoEmergencia: '',
        telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
        fechaIngreso: '', tipoContrato: '', sedeId: '', cargoId: '', salario: '',
        subsidioTransporte: '', estado: '', fechaRetiro: '', motivoRetiro: '', usuarioId: '',
        perfilVacunacion: '', detalleVacunas: []
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
        const loadVacunas = async () => {
            try {
                const res = await http.get('/vacunacion/catalogo');
                let data = res.data || res;
                if (!Array.isArray(data)) data = data?.content || [];
                if (!Array.isArray(data)) data = [];
                setCatalogoVacunasGlobal(data);
            } catch (e) {}
        };
        loadVacunas();
    }, []);

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
            setCursosAsignados(res.data || res || []);
        } catch (error) {}
    };

    const cargarCatalogoCursos = async () => {
        try {
            const res = await cursosService.listarCatalogo();
            setCatalogoCursos(res.data || res || []);
        } catch (error) {}
    };

    const fetchHojaVida = async (cedula) => {
        const cedulaTrim = cedula.trim();
        if (!cedulaTrim) return;

        try {
            const data = await http.get(`/hojas-vida/cedula/${cedulaTrim}`);
            if (data) {
                const hv = data.data || data; 
                setHojaVidaId(hv.id);
                setUsuarioHabilitado(true);
                
                let parsedVacunas = [];
                if (hv.detalleVacunas) {
                    try { 
                        parsedVacunas = JSON.parse(hv.detalleVacunas); 
                        parsedVacunas = parsedVacunas.map(v => {
                            if (v.fechas === undefined) {
                                return {
                                    nombre: v.nombre, dosisRequeridas: v.dosisRequeridas || 1, 
                                    fechas: [v.fechaAplicacion || ""], requiereRefuerzo: v.requiereRefuerzo || false, fechaRefuerzo: ""
                                };
                            }
                            return v;
                        });
                    } catch(e) {}
                }

                let freshPerfil = hv.perfilVacunacion || '';
                let freshNombres = hv.nombres || '';
                let freshApellidos = hv.apellidos || '';
                let freshCorreo = hv.correoElectronico || '';

                if (isStandardUser) {
                    const p = user?.persona || {};
                    freshPerfil = p.perfilVacunacion || freshPerfil;
                    const nombre1 = p.primerNombre || '';
                    const nombre2 = p.segundoNombre ? ` ${p.segundoNombre}` : '';
                    const apellido1 = p.primerApellido || '';
                    const apellido2 = p.segundoApellido ? ` ${p.segundoApellido}` : '';
                    const n = `${nombre1}${nombre2}`.trim();
                    const a = `${apellido1}${apellido2}`.trim();
                    freshNombres = n || freshNombres;
                    freshApellidos = a || freshApellidos;
                    freshCorreo = p.correoElectronico || user?.email || freshCorreo;
                } else {
                    try {
                        const token = localStorage.getItem('token');
                        let allUsers = [];
                        try {
                            const rawUsers = await axios.get('http://localhost:8080/api/usuarios', { headers: { Authorization: `Bearer ${token}` } });
                            allUsers = rawUsers.data?.content || rawUsers.data?.data || rawUsers.data || [];
                        } catch (e) {
                            const rawUsersV1 = await axios.get('http://localhost:8080/api/v1/usuarios', { headers: { Authorization: `Bearer ${token}` } });
                            allUsers = rawUsersV1.data?.content || rawUsersV1.data?.data || rawUsersV1.data || [];
                        }
                        if (!Array.isArray(allUsers)) allUsers = [];
                        const foundUser = allUsers.find(u => {
                            const strBuscar = String(cedulaTrim);
                            return String(u?.persona?.numeroDocumento) === strBuscar || String(u?.numeroDocumento) === strBuscar || String(u?.username) === strBuscar || String(u?.cedula) === strBuscar;
                        });
                        
                        if (foundUser) {
                            const p = foundUser.persona || {};
                            freshPerfil = p.perfilVacunacion || freshPerfil;
                            const nombre1 = p.primerNombre || '';
                            const nombre2 = p.segundoNombre ? ` ${p.segundoNombre}` : '';
                            const apellido1 = p.primerApellido || '';
                            const apellido2 = p.segundoApellido ? ` ${p.segundoApellido}` : '';
                            freshNombres = foundUser.nombres || `${nombre1}${nombre2}`.trim() || freshNombres;
                            freshApellidos = foundUser.apellidos || `${apellido1}${apellido2}`.trim() || freshApellidos;
                            freshCorreo = p.correoElectronico || foundUser.email || foundUser.username || freshCorreo;
                        }
                    } catch (err) {}
                }

                setCvNombre(`${freshNombres} ${freshApellidos}`);

                setDatosCV({
                    cedula: hv.cedula || '', nombres: freshNombres, apellidos: freshApellidos, fechaNacimiento: hv.fechaNacimiento || '', 
                    direccionResidencia: hv.direccionResidencia || '', telefono: hv.telefono || '', correoElectronico: freshCorreo, 
                    contactoEmergencia: hv.contactoEmergencia || '', telefonoContactoEmergencia: hv.telefonoContactoEmergencia || '', 
                    arl: hv.arl || '', eps: hv.eps || '', afp: hv.afp || '', cajaCompensacion: hv.cajaCompensacion || '',
                    fechaIngreso: hv.fechaIngreso || '', tipoContrato: hv.tipoContrato || '', sedeId: hv.sedes && hv.sedes.length > 0 ? hv.sedes[0].id : '', 
                    cargoId: hv.cargos && hv.cargos.length > 0 ? hv.cargos[0].id : '', salario: hv.salario || '', subsidioTransporte: hv.subsidioTransporte || '',
                    estado: hv.estado || '', fechaRetiro: hv.fechaRetiro || '', motivoRetiro: hv.motivoRetiro || '', usuarioId: hv.usuarioId || '', 
                    perfilVacunacion: freshPerfil, detalleVacunas: parsedVacunas
                });

                try {
                    const soportesData = await http.get(`/soportes/hoja-vida/${hv.id}`);
                    setResultadosIA(Array.isArray(soportesData) ? soportesData : (soportesData.data || []));
                } catch (err) { setResultadosIA([]); }
            }
        } catch (error) {
            setHojaVidaId(null);
            setCvNombre('');
            setResultadosIA([]);
            setCursosAsignados([]);
            setActiveTab('datos'); 
            
            if (!isStandardUser) {
                try {
                    const token = localStorage.getItem('token');
                    let allUsers = [];
                    
                    try {
                        const rawUsers = await axios.get('http://localhost:8080/api/usuarios', { headers: { Authorization: `Bearer ${token}` } });
                        allUsers = rawUsers.data?.content || rawUsers.data?.data || rawUsers.data || [];
                    } catch (e) {
                        const rawUsersV1 = await axios.get('http://localhost:8080/api/v1/usuarios', { headers: { Authorization: `Bearer ${token}` } });
                        allUsers = rawUsersV1.data?.content || rawUsersV1.data?.data || rawUsersV1.data || [];
                    }

                    if (!Array.isArray(allUsers)) allUsers = [];

                    const foundUser = allUsers.find(u => {
                        const strBuscar = String(cedulaTrim);
                        return String(u?.persona?.numeroDocumento) === strBuscar || String(u?.numeroDocumento) === strBuscar || String(u?.username) === strBuscar || String(u?.cedula) === strBuscar;
                    });
                    
                    if (foundUser) {
                        const p = foundUser.persona || {};
                        const nombre1 = p.primerNombre || '';
                        const nombre2 = p.segundoNombre ? ` ${p.segundoNombre}` : '';
                        const apellido1 = p.primerApellido || '';
                        const apellido2 = p.segundoApellido ? ` ${p.segundoApellido}` : '';

                        const finalNombres = foundUser.nombres || `${nombre1}${nombre2}`.trim() || 'Usuario';
                        const finalApellidos = foundUser.apellidos || `${apellido1}${apellido2}`.trim() || 'Nuevo';
                        const finalCorreo = p.correoElectronico || foundUser.email || foundUser.username || null;
                        const fallbackIngreso = new Date().toISOString().split('T')[0];
                        const prePerfil = p.perfilVacunacion || '';

                        const payload = {
                            nombres: finalNombres, apellidos: finalApellidos, cedula: cedulaTrim, fechaNacimiento: null, 
                            direccionResidencia: p.direccionResidencia || null, telefono: p.numeroTelefono || null, contactoEmergencia: null, 
                            telefonoContactoEmergencia: null, arl: null, eps: null, afp: null, cajaCompensacion: null, 
                            salario: null, subsidioTransporte: null, fechaIngreso: fallbackIngreso, estado: null, tipoContrato: null, 
                            fechaRetiro: null, motivoRetiro: null, correoElectronico: finalCorreo, perfilVacunacion: prePerfil || null, 
                            detalleVacunas: '[]', usuarioId: foundUser.id ? parseInt(foundUser.id) : null, cargosIds: [], sedesIds: []
                        };

                        const responseData = await http.post('/hojas-vida', payload);
                        const idActual = responseData.data?.id || responseData.id;
                        
                        setHojaVidaId(idActual);
                        setCvNombre(`${finalNombres} ${finalApellidos}`);
                        setUsuarioHabilitado(true);

                        setDatosCV({
                            cedula: cedulaTrim, nombres: finalNombres, apellidos: finalApellidos, fechaNacimiento: '', 
                            direccionResidencia: p.direccionResidencia || '', telefono: p.numeroTelefono || '', correoElectronico: finalCorreo || '', 
                            contactoEmergencia: '', telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
                            fechaIngreso: fallbackIngreso, tipoContrato: '', sedeId: '', cargoId: '', salario: '', subsidioTransporte: '',
                            estado: '', fechaRetiro: '', motivoRetiro: '', usuarioId: foundUser.id || '', perfilVacunacion: prePerfil, detalleVacunas: []
                        });

                    } else {
                        setUsuarioHabilitado(false);
                        showAlert({ message: 'No existe usuario con esa cédula en Gestión de Usuarios.', status: 'error' });
                    }
                } catch (err) {
                    setUsuarioHabilitado(false);
                    showAlert({ message: 'Error interno consultando usuarios.', status: 'error' });
                }
            } else {
                setUsuarioHabilitado(true);
                const p = user?.persona || {};
                const prePerfil = p.perfilVacunacion || '';
                const prefillData = {
                    nombres: p.primerNombre ? `${p.primerNombre} ${p.segundoNombre || ''}`.trim() : '',
                    apellidos: p.primerApellido ? `${p.primerApellido} ${p.segundoApellido || ''}`.trim() : '',
                    correoElectronico: p.correoElectronico || user?.email || '',
                    usuarioId: user?.id || ''
                };
                setDatosCV({
                    ...prefillData, cedula: cedulaTrim, fechaNacimiento: '', direccionResidencia: '', telefono: '', 
                    contactoEmergencia: '', telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
                    fechaIngreso: '', tipoContrato: '', sedeId: '', cargoId: '', salario: '', subsidioTransporte: '', estado: '', fechaRetiro: '', motivoRetiro: '', 
                    perfilVacunacion: prePerfil, detalleVacunas: []
                });
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        await fetchHojaVida(searchTerm);
        setIsSearching(false);
    };

    const handleCrearCV = async (e) => {
        if(e) e.preventDefault();
        try {
            const payload = {
                nombres: datosCV.nombres || null, apellidos: datosCV.apellidos || null, cedula: datosCV.cedula,
                fechaNacimiento: datosCV.fechaNacimiento || null, direccionResidencia: datosCV.direccionResidencia || null,
                telefono: datosCV.telefono || null, contactoEmergencia: datosCV.contactoEmergencia || null, telefonoContactoEmergencia: datosCV.telefonoContactoEmergencia || null,
                arl: datosCV.arl || null, eps: datosCV.eps || null, afp: datosCV.afp || null, cajaCompensacion: datosCV.cajaCompensacion || null,
                salario: datosCV.salario ? parseFloat(datosCV.salario) : null, subsidioTransporte: datosCV.subsidioTransporte || null,
                fechaIngreso: datosCV.fechaIngreso || null, estado: datosCV.estado || null, tipoContrato: datosCV.tipoContrato || null,
                fechaRetiro: datosCV.fechaRetiro || null, motivoRetiro: datosCV.motivoRetiro || null, correoElectronico: datosCV.correoElectronico || null,
                perfilVacunacion: datosCV.perfilVacunacion || null, detalleVacunas: JSON.stringify(datosCV.detalleVacunas),
                usuarioId: datosCV.usuarioId ? parseInt(datosCV.usuarioId) : null, cargosIds: datosCV.cargoId ? [parseInt(datosCV.cargoId)] : [], sedesIds: datosCV.sedeId ? [parseInt(datosCV.sedeId)] : []
            };

            if (hojaVidaId) {
                await http.put(`/hojas-vida/${hojaVidaId}`, payload);
                showAlert({ message: 'Datos guardados exitosamente', status: 'success' });
            } else {
                const responseData = await http.post('/hojas-vida', payload);
                setHojaVidaId(responseData.data?.id || responseData.id);
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
            const data = await http.post('/soportes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const nuevoDoc = data.data || data;
            setResultadosIA(prev => [...prev, nuevoDoc]);
            showAlert({ message: 'Documento subido exitosamente', status: 'success' });
        } catch (error) {}
    };

    const handleEliminarDocumento = async (idSoporte) => {
        if (!window.confirm('¿Eliminar este documento de forma permanente?')) return;
        try {
            await http.delete(`/soportes/${idSoporte}`);
            setResultadosIA(prev => prev.filter(doc => doc.id !== idSoporte));
            showAlert({ message: 'Documento eliminado', status: 'success' });
        } catch (error) {}
    };

    const handleGuardarNombre = async (idSoporte) => {
        if (!editDocValue.trim()) return;
        try {
            await http.put(`/soportes/${idSoporte}/tipo?tipoDocumento=${encodeURIComponent(editDocValue)}`);
            setResultadosIA(prev => prev.map(doc => doc.id === idSoporte ? { ...doc, tipoDocumento: editDocValue } : doc));
            setEditingDocId(null);
            showAlert({ message: 'Nombre actualizado', status: 'success' });
        } catch (error) {}
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
            showAlert({ message: 'Documento rechazado y notificado', status: 'success' });
        } catch (error) {}
    };

    const getCleanUrl = (ruta) => {
        let clean = ruta;
        if (clean.includes('api/v1/')) clean = clean.split('api/v1/')[1];
        if (clean.startsWith('/')) clean = clean.substring(1);
        return `http://localhost:8080/${clean}`;
    };

    const verDocumento = (rutaArchivo) => {
        window.open(getCleanUrl(rutaArchivo), '_blank');
    };

    const handleDescargarDocumento = (rutaArchivo, nombreArchivo) => {
        const link = document.createElement('a');
        link.href = getCleanUrl(rutaArchivo);
        link.download = nombreArchivo || 'documento.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCrearCursoCatalogo = async (e) => {
        e.preventDefault();
        try {
            await cursosService.crearCursoCatalogo(nuevoCursoMaestro);
            showAlert({ message: "Curso añadido al catálogo", status: "success" });
            setNuevoCursoMaestro({ nombre: '', descripcion: '', lugarRealizacion: '' });
            cargarCatalogoCursos();
        } catch (error) {}
    };

    const handleAsignarCurso = async (e) => {
        e.preventDefault();
        try {
            await cursosService.asignarCurso({ hojaVidaId: hojaVidaId, cursoMaestroId: datosAsignacion.cursoMaestroId, fechaLimite: datosAsignacion.fechaLimite });
            showAlert({ message: "Curso asignado", status: "success" });
            setShowAssignModal(false);
            cargarCursosAsignados();
        } catch (error) {}
    };

    const handleEliminarAsignacion = async (id) => {
        if (!window.confirm('¿Eliminar esta asignación?')) return;
        try {
            await cursosService.eliminarAsignacion(id);
            showAlert({ message: "Asignación eliminada", status: "success" });
            cargarCursosAsignados();
        } catch (error) {}
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
        } catch (error) {}
    };

    const handleToggleVacuna = (vacunaBackend) => {
        setDatosCV(prev => {
            const currentDetalle = prev.detalleVacunas || [];
            const existe = currentDetalle.find(v => v.nombre === vacunaBackend.nombre);
            if (existe) {
                return { ...prev, detalleVacunas: currentDetalle.filter(v => v.nombre !== vacunaBackend.nombre) };
            } else {
                return { ...prev, detalleVacunas: [...currentDetalle, { 
                    nombre: vacunaBackend.nombre, 
                    dosisRequeridas: vacunaBackend.dosisRequeridas,
                    requiereRefuerzo: vacunaBackend.requiereRefuerzo,
                    fechas: Array(vacunaBackend.dosisRequeridas).fill(""),
                    fechaRefuerzo: ""
                }] };
            }
        });
    };

    const handleFechaDosis = (vacunaIndex, dosisIndex, fecha) => {
        setDatosCV(prev => {
            const nuevas = [...prev.detalleVacunas];
            nuevas[vacunaIndex].fechas[dosisIndex] = fecha;
            return { ...prev, detalleVacunas: nuevas };
        });
    };

    const handleFechaRefuerzo = (vacunaIndex, fecha) => {
         setDatosCV(prev => {
            const nuevas = [...prev.detalleVacunas];
            nuevas[vacunaIndex].fechaRefuerzo = fecha;
            return { ...prev, detalleVacunas: nuevas };
        });
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white";
    const labelClass = "text-xs font-semibold text-gray-600 mb-1.5 block";
    const readOnlyClass = "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 font-medium";

    const vacunasPerfil = catalogoVacunasGlobal.filter(v => v.perfil === datosCV.perfilVacunacion);

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
                            <button type="submit" disabled={isSearching} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[100px] text-sm">
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
                            <button onClick={() => setActiveTab('soportes')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'soportes' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Folder className="w-4 h-4" /> Soportes Documentales
                            </button>
                            <button onClick={() => setActiveTab('vacunacion')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'vacunacion' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Syringe className="w-4 h-4" /> Vacunación
                            </button>
                            <button onClick={() => setActiveTab('cursos')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'cursos' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Award className="w-4 h-4" /> Formación y Cursos
                            </button>
                        </div>

                        <div className="p-6">
                            {/* --- TAB: DATOS GENERALES --- */}
                            {activeTab === 'datos' && (
                                <form onSubmit={handleCrearCV} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        <div className="space-y-4">
                                            <div><label className={labelClass}>Cédula de ciudadanía</label><input required readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.cedula} /></div>
                                            <div><label className={labelClass}>Nombres</label><input required readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.nombres} /></div>
                                            <div><label className={labelClass}>Apellidos</label><input required readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.apellidos} /></div>
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
                                                <label className={labelClass}>Perfil de Vacunación</label>
                                                <input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={datosCV.perfilVacunacion || 'No definido'} title="Se configura desde Gestión de Usuarios" />
                                            </div>
                                            <div className="mt-4"><label className={labelClass}>ARL</label><input type="text" className={inputClass} value={datosCV.arl} onChange={(e) => setDatosCV({...datosCV, arl: e.target.value})} /></div>
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
                                        {CATEGORIAS_SOPORTES.filter(c => c !== 'Carnet vacunación').map((categoria) => {
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
                                                                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Rechazado</span>
                                                                                )}
                                                                            </div>
                                                                            <button onClick={() => { setEditingDocId(doc.id); setEditDocValue(doc.tipoDocumento); }} className="text-gray-400 hover:text-blue-600 ml-2 shrink-0"><Edit2 className="w-3 h-3"/></button>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className={`grid gap-1.5 mt-1 ${isAdminOrHR ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                                                        <button type="button" onClick={() => verDocumento(doc.rutaArchivo)} className="py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 flex justify-center items-center" title="Previsualizar">
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button type="button" onClick={() => handleDescargarDocumento(doc.rutaArchivo, doc.nombreArchivo)} className="py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 flex justify-center items-center" title="Descargar">
                                                                            <DownloadCloud className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        {isAdminOrHR && (
                                                                            <button type="button" onClick={() => { setDocToReject(doc); setRejectModalOpen(true); }} className="py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded hover:bg-orange-100 flex justify-center items-center" title="Rechazar Documento">
                                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        )}
                                                                        <button type="button" onClick={() => handleEliminarDocumento(doc.id)} className="py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 flex justify-center items-center" title="Eliminar">
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
                                            <p className="text-sm mt-1">Este usuario no tiene un perfil configurado en Gestión de Usuarios.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="w-full md:w-1/3 space-y-4">
                                                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                                                    <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2 mb-2"><Syringe size={18}/> Carnet de Vacunación</h3>
                                                    <p className="text-xs text-blue-700 mb-5">Suba el archivo PDF escaneado con todas sus vacunas registradas.</p>
                                                    
                                                    {(() => {
                                                        const carnetDoc = resultadosIA.find(d => d.tipoDocumento === 'Carnet vacunación');
                                                        if (carnetDoc) {
                                                            return (
                                                                <div className="bg-white border border-blue-200 p-4 rounded shadow-sm flex flex-col gap-3">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <FileText className="w-5 h-5 text-red-500 shrink-0" />
                                                                        <h4 className="font-semibold text-gray-800 text-xs truncate">{carnetDoc.tipoDocumento}</h4>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                                        <button type="button" onClick={() => verDocumento(carnetDoc.rutaArchivo)} className="py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 flex justify-center"><Eye size={14}/></button>
                                                                        <button type="button" onClick={() => handleEliminarDocumento(carnetDoc.id)} className="py-2 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 flex justify-center"><Trash2 size={14}/></button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-dashed border-blue-300 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-50 transition-colors">
                                                                    <Upload size={18} /> Seleccionar PDF
                                                                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleManualUpload(e, 'Carnet vacunación')} />
                                                                </label>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="w-full md:w-2/3 space-y-4">
                                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                    <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center">
                                                        <h3 className="font-bold text-gray-800 text-sm">Registro de Dosis - {datosCV.perfilVacunacion}</h3>
                                                    </div>
                                                    
                                                    <div className="p-5 space-y-4">
                                                        {vacunasPerfil.length === 0 ? (
                                                            <div className="text-center py-6 text-gray-400 text-sm">No hay vacunas configuradas para el perfil {datosCV.perfilVacunacion}.</div>
                                                        ) : (
                                                            vacunasPerfil.map((vacuna, vIndex) => {
                                                                const vacunaData = (datosCV.detalleVacunas || []).find(v => v.nombre === vacuna.nombre);
                                                                const isChecked = !!vacunaData;

                                                                return (
                                                                    <div key={vIndex} className={`p-4 rounded-lg border transition-colors ${isChecked ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-gray-50/50'} relative`}>
                                                                        <label className="flex items-center gap-3 cursor-pointer select-none mb-3">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                                                checked={isChecked}
                                                                                onChange={() => handleToggleVacuna(vacuna)}
                                                                            />
                                                                            <h4 className={`font-bold ${isChecked ? 'text-blue-900' : 'text-gray-600'}`}>{vacuna.nombre} <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">{vacuna.dosisRequeridas} Dosis {vacuna.requiereRefuerzo && '+ Refuerzo'}</span></h4>
                                                                        </label>
                                                                        
                                                                        {isChecked && (
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
                                                                                {(vacunaData.fechas || []).map((fecha, dIndex) => (
                                                                                    <div key={dIndex} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
                                                                                        <span className="text-xs font-bold text-gray-600 w-16">Dosis {dIndex + 1}:</span>
                                                                                        <input 
                                                                                            type="date" 
                                                                                            className="flex-1 px-2 py-1 text-xs font-medium border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                                            value={fecha}
                                                                                            onChange={(e) => {
                                                                                                const vIdxEnDetalle = datosCV.detalleVacunas.findIndex(v => v.nombre === vacuna.nombre);
                                                                                                if(vIdxEnDetalle !== -1) handleFechaDosis(vIdxEnDetalle, dIndex, e.target.value);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                                {vacuna.requiereRefuerzo && (
                                                                                    <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-200 shadow-sm">
                                                                                        <span className="text-xs font-bold text-blue-800 w-16">Refuerzo:</span>
                                                                                        <input 
                                                                                            type="date" 
                                                                                            className="flex-1 px-2 py-1 text-xs font-medium border border-blue-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                                                                                            value={vacunaData.fechaRefuerzo || ''}
                                                                                            onChange={(e) => {
                                                                                                const vIdxEnDetalle = datosCV.detalleVacunas.findIndex(v => v.nombre === vacuna.nombre);
                                                                                                if(vIdxEnDetalle !== -1) handleFechaRefuerzo(vIdxEnDetalle, e.target.value);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                    <div className="p-4 bg-white border-t border-gray-200 flex justify-end">
                                                        <button type="button" onClick={handleCrearCV} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded shadow-sm text-sm hover:bg-blue-700 transition-colors">
                                                            Guardar Registro de Vacunas
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
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
                                                <button type="button" onClick={() => { cargarCatalogoCursos(); setShowCatalogModal(true); }} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded text-xs font-bold hover:bg-gray-50">Catálogo</button>
                                                <button type="button" onClick={() => { cargarCatalogoCursos(); setShowAssignModal(true); }} className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"><Plus size={14} /> Asignar</button>
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
                                                                {isAdminOrHR && <button type="button" onClick={() => handleEliminarAsignacion(asignacion.id)} className="w-full py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded">Retirar Asignación</button>}
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
                            <button type="button" onClick={() => setRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
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
                            <button type="button" onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
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
                            <button type="button" onClick={() => setShowCatalogModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
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