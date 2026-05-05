import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Download, Trash2, Edit } from 'lucide-react';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

export const Incapacidades = () => {
    const { showAlert } = useAlert();
    const [busqueda, setBusqueda] = useState('');
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [incapacidades, setIncapacidades] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Formulario
    const [formData, setFormData] = useState({
        epsArl: '', tipoIncapacidad: '', codigo: '', dx: '',
        fechaInicio: '', fechaFin: '', diasOtorgados: '', diasAprobados: '',
        fechaReporteTH: '', fechaRadicado: '', estado: '', numeroRadicacion: '',
        ibc: '', diasPagadosIps: '', valorLiquidadoIps: '',
        diasPagadosEps: '', valorLiquidadoEps: '', diasPagadosArl: '',
        campo30: '', campo60: '', campo90: '', campo180: '',
        observaciones: '', valorPago: '', fechaPago: '', numeroComprobantePago: ''
    });
    const [archivoSoporte, setArchivoSoporte] = useState(null);

    const buscarUsuario = async () => {
        if (!busqueda) return;
        setCargando(true);
        try {
            // Utilizamos el endpoint que busca incapacidades por documento, o buscamos el usuario primero.
            // Wait, we need the user's ID to save a new incapacidad.
            // Is there an endpoint to find a user by document?
            const resUser = await http.get(`/usuarios/documento/${busqueda}`).catch(() => null);
            let user = resUser?.data?.data || resUser?.data || resUser;
            
            if (Array.isArray(user)) {
                user = user[0];
            }
            
            if (!user) {
                showAlert({ message: 'Usuario no encontrado', status: 'warning' });
                setUsuarioActual(null);
                setIncapacidades([]);
                return;
            }

            setUsuarioActual(user);
            cargarIncapacidades(user.persona?.numeroDocumento || busqueda);
        } catch (error) {
            console.error(error);
            showAlert({ message: 'Error buscando usuario', status: 'error' });
        } finally {
            setCargando(false);
        }
    };

    const cargarIncapacidades = async (documento) => {
        try {
            const res = await http.get(`/incapacidades/documento/${documento}`);
            const data = Array.isArray(res) ? res : (res.data?.data || res.data || []);
            setIncapacidades(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!usuarioActual) return;

        setCargando(true);
        try {
            const formDataMultipart = new FormData();
            
            // Adjuntamos el JSON como un blob tipo application/json
            const dto = { ...formData };
            // Auto calculate diasOtorgados si están vacíos? El backend ya lo hace.
            formDataMultipart.append('usuarioId', usuarioActual.id);
            formDataMultipart.append('data', new Blob([JSON.stringify(dto)], { type: "application/json" }));
            
            if (archivoSoporte) {
                formDataMultipart.append('archivo', archivoSoporte);
            }

            await http.post('/incapacidades', formDataMultipart, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showAlert({ message: 'Incapacidad registrada exitosamente', status: 'success' });
            setMostrarModal(false);
            setArchivoSoporte(null);
            cargarIncapacidades(usuarioActual.persona?.numeroDocumento || busqueda);
        } catch (error) {
            console.error(error);
            showAlert({ message: 'Error guardando incapacidad', status: 'error' });
        } finally {
            setCargando(false);
        }
    };

    const eliminarIncapacidad = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta incapacidad?')) return;
        try {
            await http.delete(`/incapacidades/${id}`);
            showAlert({ message: 'Eliminada', status: 'success' });
            cargarIncapacidades(usuarioActual.persona?.numeroDocumento || busqueda);
        } catch (e) {
            showAlert({ message: 'Error al eliminar', status: 'error' });
        }
    };

    const descargarArchivo = async (ruta) => {
        try {
            const res = await http.get(`/incapacidades/descargar-archivo?ruta=${encodeURIComponent(ruta)}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data || res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', ruta.split('/').pop() || 'soporte.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            showAlert({ message: 'Error al descargar el archivo', status: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Incapacidades</h1>
                    <p className="text-sm text-gray-500 mt-1">Gestión de incapacidades del personal</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute inset-y-0 left-0 pl-3.5 top-2.5 flex items-center pointer-events-none text-gray-400" size={20} />
                            <input 
                                type="text" 
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && buscarUsuario()}
                                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ingresar Número de Documento..."
                            />
                        </div>
                        <button 
                            onClick={buscarUsuario}
                            disabled={cargando}
                            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                        >
                            Buscar
                        </button>
                    </div>

                    {usuarioActual && (
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-indigo-900 text-lg">{usuarioActual.persona?.nombres} {usuarioActual.persona?.apellidos}</h3>
                                <p className="text-sm text-indigo-700">Documento: {usuarioActual.persona?.numeroDocumento} | Cargo: {usuarioActual.perfiles?.[0]?.nombre || 'No asignado'}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setFormData({ epsArl: '', tipoIncapacidad: '', codigo: '', dx: '', fechaInicio: '', fechaFin: '', diasOtorgados: '', diasAprobados: '', fechaReporteTH: '', fechaRadicado: '', estado: '', numeroRadicacion: '', ibc: '', diasPagadosIps: '', valorLiquidadoIps: '', diasPagadosEps: '', valorLiquidadoEps: '', diasPagadosArl: '', campo30: '', campo60: '', campo90: '', campo180: '', observaciones: '', valorPago: '', fechaPago: '', numeroComprobantePago: '' });
                                    setArchivoSoporte(null);
                                    setMostrarModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                            >
                                <Plus size={18} /> Nueva Incapacidad
                            </button>
                        </div>
                    )}
                </div>

                {usuarioActual && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-800">Historial de Incapacidades</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[11px] text-gray-500 uppercase tracking-wider bg-white border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Fechas</th>
                                        <th className="px-4 py-3 font-semibold">Tipo</th>
                                        <th className="px-4 py-3 font-semibold">Diagnóstico (DX)</th>
                                        <th className="px-4 py-3 font-semibold">Días</th>
                                        <th className="px-4 py-3 font-semibold">Estado</th>
                                        <th className="px-4 py-3 font-semibold">Soporte</th>
                                        <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {incapacidades.length === 0 ? (
                                        <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No hay registros de incapacidad.</td></tr>
                                    ) : incapacidades.map((inc) => (
                                        <tr key={inc.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-700">{inc.fechaInicio} al {inc.fechaFin}</td>
                                            <td className="px-4 py-3 text-gray-700">{inc.tipoIncapacidad}</td>
                                            <td className="px-4 py-3 text-gray-700">{inc.codigo} - {inc.dx}</td>
                                            <td className="px-4 py-3 text-gray-700">{inc.diasOtorgados} otg. / {inc.diasAprobados || 0} apr.</td>
                                            <td className="px-4 py-3 font-semibold text-gray-700">{inc.estado}</td>
                                            <td className="px-4 py-3">
                                                {inc.rutaArchivo ? (
                                                    <button onClick={() => descargarArchivo(inc.rutaArchivo)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-semibold">
                                                        <FileText size={16} /> Ver Soporte
                                                    </button>
                                                ) : <span className="text-gray-400 text-xs">-</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => eliminarIncapacidad(inc.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Formulario */}
            {mostrarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h2 className="text-xl font-bold text-gray-800">Registrar Incapacidad</h2>
                            <button onClick={() => setMostrarModal(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="incapacidad-form" onSubmit={handleGuardar} className="space-y-6">
                                
                                <div>
                                    <h3 className="font-semibold text-indigo-800 border-b pb-2 mb-4 text-sm uppercase">1. Información Médica</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">EPS/ARL</label>
                                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.epsArl} onChange={e => setFormData({...formData, epsArl: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Incapacidad</label>
                                            <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.tipoIncapacidad} onChange={e => setFormData({...formData, tipoIncapacidad: e.target.value})} required>
                                                <option value="">Seleccione...</option>
                                                <option value="EG">Enfermedad General (EG)</option>
                                                <option value="AT">Accidente de Trabajo (AT)</option>
                                                <option value="LM">Licencia Maternidad (LM)</option>
                                                <option value="LP">Licencia Paternidad (LP)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Código CIE-10</label>
                                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Diagnóstico (DX)</label>
                                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.dx} onChange={e => setFormData({...formData, dx: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-indigo-800 border-b pb-2 mb-4 text-sm uppercase">2. Tiempos y Estado</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                            <input type="date" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin</label>
                                            <input type="date" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Días Otorgados (Auto)</label>
                                            <input type="number" disabled className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-sm outline-none" placeholder="Calculado" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Días Aprobados</label>
                                            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.diasAprobados} onChange={e => setFormData({...formData, diasAprobados: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Reporte TH</label>
                                            <input type="date" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.fechaReporteTH} onChange={e => setFormData({...formData, fechaReporteTH: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Radicado</label>
                                            <input type="date" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.fechaRadicado} onChange={e => setFormData({...formData, fechaRadicado: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                                            <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} required>
                                                <option value="">Seleccione...</option>
                                                <option value="RADICADA">Radicada</option>
                                                <option value="PENDIENTE">Pendiente</option>
                                                <option value="TRANSCRITA">Transcrita</option>
                                                <option value="OBJETADA">Objetada</option>
                                                <option value="RECHAZADA">Rechazada</option>
                                                <option value="PENDIENTE PARA PAGO">Pendiente para pago</option>
                                                <option value="PAGADA">Pagada</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">N° Radicación</label>
                                            <input type="text" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.numeroRadicacion} onChange={e => setFormData({...formData, numeroRadicacion: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-indigo-800 border-b pb-2 mb-4 text-sm uppercase">3. Liquidación y Pagos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">IBC ($)</label>
                                            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.ibc} onChange={e => setFormData({...formData, ibc: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Valor Liquidado IPS</label>
                                            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.valorLiquidadoIps} onChange={e => setFormData({...formData, valorLiquidadoIps: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Valor Liquidado EPS</label>
                                            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.valorLiquidadoEps} onChange={e => setFormData({...formData, valorLiquidadoEps: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Valor del Pago Final</label>
                                            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.valorPago} onChange={e => setFormData({...formData, valorPago: e.target.value})} />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Días Pagados IPS</label>
                                            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.diasPagadosIps} onChange={e => setFormData({...formData, diasPagadosIps: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Días Pagados EPS</label>
                                            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.diasPagadosEps} onChange={e => setFormData({...formData, diasPagadosEps: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Días Pagados ARL</label>
                                            <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.diasPagadosArl} onChange={e => setFormData({...formData, diasPagadosArl: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Pago</label>
                                            <input type="date" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.fechaPago} onChange={e => setFormData({...formData, fechaPago: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-indigo-800 border-b pb-2 mb-4 text-sm uppercase">4. Soportes y Observaciones</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Soporte Adjunto (PDF/Imagen)</label>
                                            <input type="file" onChange={e => setArchivoSoporte(e.target.files[0])} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" accept=".pdf,image/*" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
                                            <textarea rows="3" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})}></textarea>
                                        </div>
                                        
                                        {/* Casillas 30, 60, 90, 180 */}
                                        <div className="md:col-span-2 grid grid-cols-4 gap-2 border bg-gray-50 p-3 rounded">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1 text-center font-bold">Casilla 30</label>
                                                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none text-center" value={formData.campo30} onChange={e => setFormData({...formData, campo30: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1 text-center font-bold">Casilla 60</label>
                                                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none text-center" value={formData.campo60} onChange={e => setFormData({...formData, campo60: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1 text-center font-bold">Casilla 90</label>
                                                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none text-center" value={formData.campo90} onChange={e => setFormData({...formData, campo90: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1 text-center font-bold">Casilla 180</label>
                                                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none text-center" value={formData.campo180} onChange={e => setFormData({...formData, campo180: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>
                        
                        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                            <button type="button" onClick={() => setMostrarModal(false)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 font-semibold rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button type="submit" form="incapacidad-form" disabled={cargando} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">Guardar Registro</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
