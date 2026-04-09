import React, { useState, useEffect } from 'react';
import { Search, User, ArrowLeft, FileText, Trash2, Edit2, Save, X, Eye, Upload, Folder, Plus, DownloadCloud, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';

const CATEGORIAS_SOPORTES = [
    "Acta de grado Profesional", "Acta grado de Bachiller", "Acta grado Título Especialista",
    "Afiliación ARL", "Afiliación EPS", "Afiliación Pensión", "Antecedentes",
    "Caja de compensación", "Carnet vacunación", "Cédula de ciudadanía", "Certificación Bancaria",
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
    const [activeTab, setActiveTab] = useState('datos');
    const [hojaVidaId, setHojaVidaId] = useState(null);
    const [cvNombre, setCvNombre] = useState('');

    const [datosCV, setDatosCV] = useState({
        cedula: '', nombres: '', apellidos: '', fechaNacimiento: '', direccionResidencia: '',
        telefono: '', correoElectronico: '', contactoEmergencia: '',
        telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
        fechaIngreso: '', tipoContrato: '', sedeId: '', cargoId: '', salario: '',
        subsidioTransporte: '', estado: '', fechaRetiro: '', motivoRetiro: '', usuarioId: ''
    });
    
    const [resultadosIA, setResultadosIA] = useState([]);
    const [editingDocId, setEditingDocId] = useState(null);
    const [editDocValue, setEditDocValue] = useState('');

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [docToReject, setDocToReject] = useState(null);
    const [rejectData, setRejectData] = useState({ motivo: '', fechaLimite: '' });

    useEffect(() => {
        if (isStandardUser && userCedula) {
            setSearchTerm(userCedula);
            fetchHojaVida(userCedula);
        }
    }, [isStandardUser, userCedula]);

    const fetchHojaVida = async (cedula) => {
        const cedulaTrim = cedula.trim();
        if (!cedulaTrim) return;

        try {
            const response = await http.get(`/hojas-vida/cedula/${cedulaTrim}`);
            if (response.data) {
                const hv = response.data.data || response.data;
                setHojaVidaId(hv.id);
                setCvNombre(`${hv.nombres} ${hv.apellidos}`);
                setDatosCV({
                    cedula: hv.cedula || '', 
                    nombres: hv.nombres || '', 
                    apellidos: hv.apellidos || '', 
                    fechaNacimiento: hv.fechaNacimiento || '', 
                    direccionResidencia: hv.direccionResidencia || '', 
                    telefono: hv.telefono || '', 
                    correoElectronico: hv.correoElectronico || '', 
                    contactoEmergencia: hv.contactoEmergencia || '', 
                    telefonoContactoEmergencia: hv.telefonoContactoEmergencia || '', 
                    arl: hv.arl || '', 
                    eps: hv.eps || '', 
                    afp: hv.afp || '', 
                    cajaCompensacion: hv.cajaCompensacion || '',
                    fechaIngreso: hv.fechaIngreso || '', 
                    tipoContrato: hv.tipoContrato || '', 
                    sedeId: hv.sedes && hv.sedes.length > 0 ? hv.sedes[0].id : '', 
                    cargoId: hv.cargos && hv.cargos.length > 0 ? hv.cargos[0].id : '', 
                    salario: hv.salario || '', 
                    subsidioTransporte: hv.subsidioTransporte || '',
                    estado: hv.estado || '', 
                    fechaRetiro: hv.fechaRetiro || '', 
                    motivoRetiro: hv.motivoRetiro || '',
                    usuarioId: hv.usuarioId || ''
                });

                try {
                    const soportesRes = await http.get(`/soportes/hoja-vida/${hv.id}`);
                    if (soportesRes.data) setResultadosIA(Array.isArray(soportesRes.data) ? soportesRes.data : (soportesRes.data.data || []));
                } catch (err) {
                    setResultadosIA([]);
                }
                
                if (!isStandardUser) showAlert({ message: 'Hoja de Vida encontrada', status: 'success' });
            }
        } catch (error) {
            let prefillData = {
                nombres: '', apellidos: '', correo: '', telefono: '', direccion: '', fechaNac: '', usuarioId: ''
            };

            if (isStandardUser) {
                const p = user?.persona || {};
                prefillData.nombres = p.primerNombre ? `${p.primerNombre} ${p.segundoNombre || ''}`.trim() : '';
                prefillData.apellidos = p.primerApellido ? `${p.primerApellido} ${p.segundoApellido || ''}`.trim() : '';
                prefillData.correo = p.correoElectronico || user?.email || '';
                prefillData.telefono = p.numeroTelefono || '';
                prefillData.direccion = p.direccionResidencia || '';
                prefillData.fechaNac = p.fechaNacimiento || '';
                prefillData.usuarioId = user?.id || '';
            } else {
                try {
                    const resUsers = await http.get('/usuarios');
                    const allUsers = Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.data || []);
                    const foundUser = allUsers.find(u => (u.persona?.numeroDocumento === cedulaTrim) || (u.username === cedulaTrim));
                    
                    if (foundUser) {
                        prefillData.usuarioId = foundUser.id || '';
                        if (foundUser.persona) {
                            const p = foundUser.persona;
                            prefillData.nombres = p.primerNombre ? `${p.primerNombre} ${p.segundoNombre || ''}`.trim() : '';
                            prefillData.apellidos = p.primerApellido ? `${p.primerApellido} ${p.segundoApellido || ''}`.trim() : '';
                            prefillData.correo = p.correoElectronico || '';
                            prefillData.telefono = p.numeroTelefono || '';
                            prefillData.direccion = p.direccionResidencia || '';
                            prefillData.fechaNac = p.fechaNacimiento || '';
                        }
                    }
                } catch (err) {
                    console.error("Error buscando datos previos del usuario", err);
                }
            }

            setDatosCV({
                cedula: cedulaTrim,
                nombres: prefillData.nombres,
                apellidos: prefillData.apellidos,
                fechaNacimiento: prefillData.fechaNac,
                direccionResidencia: prefillData.direccion,
                telefono: prefillData.telefono,
                correoElectronico: prefillData.correo,
                usuarioId: prefillData.usuarioId,
                contactoEmergencia: '', telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
                fechaIngreso: '', tipoContrato: '', sedeId: '', cargoId: '', salario: '', subsidioTransporte: '', estado: '', fechaRetiro: '', motivoRetiro: ''
            });
            
            setHojaVidaId(null);
            setCvNombre('');
            setResultadosIA([]);
            
            if (!isStandardUser) {
                if (prefillData.nombres) {
                    showAlert({ message: 'Usuario encontrado en el sistema. Datos personales precargados.', status: 'info' });
                } else {
                    showAlert({ message: 'No existe registro previo. Ingrese los datos manualmente.', status: 'warning' });
                }
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchHojaVida(searchTerm);
    };

    const handleCrearCV = async (e) => {
        e.preventDefault();
        try {
            let idActual = hojaVidaId;
            
            const payload = {
                nombres: datosCV.nombres,
                apellidos: datosCV.apellidos,
                cedula: datosCV.cedula,
                fechaNacimiento: datosCV.fechaNacimiento || null,
                direccionResidencia: datosCV.direccionResidencia,
                telefono: datosCV.telefono,
                contactoEmergencia: datosCV.contactoEmergencia,
                telefonoContactoEmergencia: datosCV.telefonoContactoEmergencia,
                arl: datosCV.arl,
                eps: datosCV.eps,
                afp: datosCV.afp,
                cajaCompensacion: datosCV.cajaCompensacion,
                salario: datosCV.salario ? parseFloat(datosCV.salario) : null,
                subsidioTransporte: datosCV.subsidioTransporte,
                fechaIngreso: datosCV.fechaIngreso || null,
                estado: datosCV.estado,
                tipoContrato: datosCV.tipoContrato,
                fechaRetiro: datosCV.fechaRetiro || null,
                motivoRetiro: datosCV.motivoRetiro,
                correoElectronico: datosCV.correoElectronico || null,
                usuarioId: datosCV.usuarioId ? parseInt(datosCV.usuarioId) : null,
                cargosIds: datosCV.cargoId ? [parseInt(datosCV.cargoId)] : [],
                sedesIds: datosCV.sedeId ? [parseInt(datosCV.sedeId)] : []
            };

            if (idActual) {
                await http.put(`/hojas-vida/${idActual}`, payload);
                showAlert({ message: 'Datos actualizados exitosamente', status: 'success' });
            } else {
                const response = await http.post('/hojas-vida', payload);
                idActual = response.data?.data?.id || response.data?.id || response.id;
                setHojaVidaId(idActual);
                showAlert({ message: 'Hoja de Vida creada y vinculada exitosamente', status: 'success' });
            }
            setCvNombre(`${datosCV.nombres} ${datosCV.apellidos}`);
        } catch (error) {
            let finalMsg = 'Error al guardar la Hoja de Vida';
            if (error.response?.data?.message) finalMsg = error.response.data.message;
            if (error.response?.data?.errors) {
                finalMsg = Object.values(error.response.data.errors).join(' | ');
            }
            showAlert({ message: finalMsg, status: 'error' });
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

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white";
    const labelClass = "text-xs font-semibold text-gray-600 mb-1.5 block";

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 relative">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white text-gray-500 hover:bg-gray-100 rounded-full shadow-sm transition-all"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{isStandardUser ? 'Mi Hoja de Vida' : 'Gestión de Hoja de Vida'}</h1>
                        <p className="text-gray-500 text-sm">{hojaVidaId ? `Perfil activo: ${cvNombre}` : (isStandardUser ? 'Verifica y completa tus datos' : 'Registro de nuevo colaborador')}</p>
                    </div>
                </div>

                {!isStandardUser && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <form onSubmit={handleSearch} className="relative w-full max-w-xl">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Search className="h-4 w-4" /></div>
                            <input type="text" className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm outline-none" placeholder="Buscar empleado por número de cédula o presione Enter vacío para crear..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        <button onClick={() => setActiveTab('datos')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'datos' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                            <User className="w-4 h-4" /> Datos Generales
                        </button>
                        <button disabled={!hojaVidaId} onClick={() => setActiveTab('soportes')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'soportes' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'} ${!hojaVidaId ? 'opacity-40 cursor-not-allowed' : ''}`}>
                            <Folder className="w-4 h-4" /> Soportes Documentales
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'datos' && (
                            <form onSubmit={handleCrearCV} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    <div className="space-y-4">
                                        <div><label className={labelClass}>Cédula de ciudadanía *</label><input required readOnly={isStandardUser} type="text" className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.cedula} onChange={(e) => setDatosCV({...datosCV, cedula: e.target.value})} /></div>
                                        <div><label className={labelClass}>Nombres *</label><input required readOnly={isStandardUser && !!hojaVidaId} type="text" className={`${inputClass} ${isStandardUser && !!hojaVidaId ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.nombres} onChange={(e) => setDatosCV({...datosCV, nombres: e.target.value})} /></div>
                                        <div><label className={labelClass}>Apellidos *</label><input required readOnly={isStandardUser && !!hojaVidaId} type="text" className={`${inputClass} ${isStandardUser && !!hojaVidaId ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.apellidos} onChange={(e) => setDatosCV({...datosCV, apellidos: e.target.value})} /></div>
                                        <div><label className={labelClass}>Fecha Nacimiento</label><input type="date" className={inputClass} value={datosCV.fechaNacimiento} onChange={(e) => setDatosCV({...datosCV, fechaNacimiento: e.target.value})} /></div>
                                        <div><label className={labelClass}>Dirección</label><input type="text" className={inputClass} value={datosCV.direccionResidencia} onChange={(e) => setDatosCV({...datosCV, direccionResidencia: e.target.value})} /></div>
                                        <div><label className={labelClass}>Teléfono(s)</label><input type="text" className={inputClass} value={datosCV.telefono} onChange={(e) => setDatosCV({...datosCV, telefono: e.target.value})} /></div>
                                        <div><label className={labelClass}>Correo electrónico</label><input type="email" className={inputClass} value={datosCV.correoElectronico} onChange={(e) => setDatosCV({...datosCV, correoElectronico: e.target.value})} /></div>
                                        <div><label className={labelClass}>Contacto de emergencia</label><input type="text" className={inputClass} value={datosCV.contactoEmergencia} onChange={(e) => setDatosCV({...datosCV, contactoEmergencia: e.target.value})} /></div>
                                        <div><label className={labelClass}>Tel. Contacto Emergencia</label><input type="text" className={inputClass} value={datosCV.telefonoContactoEmergencia} onChange={(e) => setDatosCV({...datosCV, telefonoContactoEmergencia: e.target.value})} /></div>
                                        <div><label className={labelClass}>ARL</label><input type="text" className={inputClass} value={datosCV.arl} onChange={(e) => setDatosCV({...datosCV, arl: e.target.value})} /></div>
                                        <div><label className={labelClass}>EPS</label><input type="text" className={inputClass} value={datosCV.eps} onChange={(e) => setDatosCV({...datosCV, eps: e.target.value})} /></div>
                                    </div>

                                    <div className="space-y-4">
                                        <div><label className={labelClass}>AFP</label><input type="text" className={inputClass} value={datosCV.afp} onChange={(e) => setDatosCV({...datosCV, afp: e.target.value})} /></div>
                                        <div><label className={labelClass}>Caja de compensación</label><input type="text" className={inputClass} value={datosCV.cajaCompensacion} onChange={(e) => setDatosCV({...datosCV, cajaCompensacion: e.target.value})} /></div>
                                        <div><label className={labelClass}>Fecha de ingreso</label><input type="date" className={inputClass} value={datosCV.fechaIngreso} onChange={(e) => setDatosCV({...datosCV, fechaIngreso: e.target.value})} /></div>
                                        <div>
                                            <label className={labelClass}>Tipo de contrato</label>
                                            <select disabled={isStandardUser} className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.tipoContrato} onChange={(e) => setDatosCV({...datosCV, tipoContrato: e.target.value})}>
                                                <option value="">Seleccione...</option>
                                                <option value="Fijo">Término Fijo</option>
                                                <option value="Indefinido">Término Indefinido</option>
                                                <option value="Prestacion">Prestación de Servicios</option>
                                            </select>
                                        </div>
                                        <div><label className={labelClass}>Sede</label><input readOnly={isStandardUser} type="text" className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.sedeId} onChange={(e) => setDatosCV({...datosCV, sedeId: e.target.value})} /></div>
                                        <div><label className={labelClass}>Cargo</label><input readOnly={isStandardUser} type="text" className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.cargoId} onChange={(e) => setDatosCV({...datosCV, cargoId: e.target.value})} /></div>
                                        <div><label className={labelClass}>Salario</label><input readOnly={isStandardUser} type="number" className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.salario} onChange={(e) => setDatosCV({...datosCV, salario: e.target.value})} /></div>
                                        <div>
                                            <label className={labelClass}>Subsidio de transporte</label>
                                            <select disabled={isStandardUser} className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.subsidioTransporte} onChange={(e) => setDatosCV({...datosCV, subsidioTransporte: e.target.value})}>
                                                <option value="">Seleccione...</option>
                                                <option value="Si">Sí</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Estado</label>
                                            <select disabled={isStandardUser} className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.estado} onChange={(e) => setDatosCV({...datosCV, estado: e.target.value})}>
                                                <option value="">Seleccione...</option>
                                                <option value="Activo">Activo</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        </div>
                                        <div><label className={labelClass}>Fecha de retiro</label><input readOnly={isStandardUser} type="date" className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.fechaRetiro} onChange={(e) => setDatosCV({...datosCV, fechaRetiro: e.target.value})} /></div>
                                        <div><label className={labelClass}>Motivo de retiro</label><input readOnly={isStandardUser} type="text" className={`${inputClass} ${isStandardUser ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={datosCV.motivoRetiro} onChange={(e) => setDatosCV({...datosCV, motivoRetiro: e.target.value})} /></div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded shadow-sm hover:bg-blue-700 transition-colors">
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        )}

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
                    </div>
                </div>
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
        </div>
    );
};