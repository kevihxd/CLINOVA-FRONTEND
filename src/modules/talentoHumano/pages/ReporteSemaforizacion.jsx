import React, { useState, useEffect } from 'react';
import { Download, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import * as XLSX from 'xlsx';

export const ReporteSemaforizacion = () => {
    const [reporte, setReporte] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroSede, setFiltroSede] = useState('TODAS');

    useEffect(() => {
        fetchReporte();
    }, []);

    const fetchReporte = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/v1/reportes/semaforizacion`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReporte(response.data.data || []);
        } catch (err) {
            console.error("Error cargando semaforizacion:", err);
            setError("No se pudo cargar el reporte de semaforización.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'VIGENTE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'PROXIMO A VENCER': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'VENCIDO': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'NO ASIGNADO':
            case 'NO DEFINIDO': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const sedes = ['TODAS', ...new Set(reporte.map(item => item.sede).filter(Boolean))];

    const filteredReporte = reporte.filter(item => {
        const matchName = item.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.identificacion?.includes(searchTerm);
        const matchSede = filtroSede === 'TODAS' || item.sede === filtroSede;
        return matchName && matchSede;
    });

    const exportToExcel = () => {
        const dataToExport = filteredReporte.map(item => {
            const row = {
                'IDENTIFICACIÓN': item.identificacion,
                'NOMBRE COMPLETO': item.nombreCompleto,
                'CARGO': item.cargo,
                'SEDE': item.sede,
                'TIPO DE CONTRATO': item.tipoContrato || 'N/A',
                'VALOR DE CONTRATO': item.valorContrato || 'N/A',
                'DURACIÓN CONTRATO': item.tiempoDuracionContrato || 'N/A',
                'INICIO CONTRATO': item.fechaContratoInicial || 'N/A',
                'FIN CONTRATO': item.fechaFinalizacionContrato || 'N/A',
                'DÍAS RESTANTES CONTRATO': item.diasFinalizacionContrato !== null ? item.diasFinalizacionContrato : 'N/A',
                'ESTADO CONTRATO': item.estadoContrato
            };
            
            if (item.cursos && item.cursos.length > 0) {
                item.cursos.forEach(curso => {
                    row[`${curso.nombreCurso} (FIN)`] = curso.fechaExpiracion || 'N/A';
                    row[`${curso.nombreCurso} (DÍAS)`] = curso.diasRestantes !== null ? curso.diasRestantes : 'N/A';
                    row[`${curso.nombreCurso} (ESTADO)`] = curso.estado;
                });
            }
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Semaforizacion");
        XLSX.writeFile(wb, "Reporte_Semaforizacion_Contratos_Cursos.xlsx");
    };

    // Extract unique course names for table headers
    const courseHeaders = reporte.length > 0 && reporte[0].cursos ? reporte[0].cursos.map(c => c.nombreCurso) : [];

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Semaforización de Personal</h1>
                        <p className="text-sm text-slate-500 mt-1">Control de vencimientos de contratos y cursos obligatorios</p>
                    </div>
                    <button 
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
                    >
                        <Download size={16} />
                        Exportar Excel
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o identificación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={filtroSede}
                            onChange={(e) => setFiltroSede(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                        >
                            {sedes.map(sede => (
                                <option key={sede} value={sede}>{sede}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-64 text-slate-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                                Cargando información...
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center h-64 text-rose-500 flex-col gap-2">
                                <AlertCircle size={32} />
                                <p>{error}</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Empleado</th>
                                        <th className="px-4 py-3">Sede</th>
                                        <th className="px-4 py-3 border-x border-slate-200 bg-blue-50/50">Contrato (Días)</th>
                                        {courseHeaders.map((header, idx) => (
                                            <th key={idx} className="px-4 py-3 text-center border-r border-slate-200">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredReporte.map((item, index) => (
                                        <tr key={item.hojaVidaId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                                                <div className="font-bold text-slate-800">{item.nombreCompleto}</div>
                                                <div className="text-xs text-slate-500">{item.identificacion} • {item.cargo}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-xs">
                                                {item.sede}
                                            </td>
                                            
                                            {/* Contrato */}
                                            <td className="px-4 py-3 border-x border-slate-100 bg-blue-50/10">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(item.estadoContrato)}`}>
                                                        {item.estadoContrato}
                                                    </span>
                                                    <span className="text-xs font-mono text-center font-medium text-slate-700">
                                                        {item.diasFinalizacionContrato !== null ? `${item.diasFinalizacionContrato} días` : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            
                                            {/* Cursos */}
                                            {item.cursos && item.cursos.map((curso, idx) => (
                                                <td key={idx} className="px-4 py-3 border-r border-slate-100 text-center align-middle">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(curso.estado)}`}>
                                                            {curso.estado}
                                                        </span>
                                                        <span className="text-[11px] font-mono font-medium text-slate-600">
                                                            {curso.diasRestantes !== null ? `${curso.diasRestantes} d` : '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {filteredReporte.length === 0 && (
                                        <tr>
                                            <td colSpan={3 + courseHeaders.length} className="px-4 py-8 text-center text-slate-500">
                                                No se encontraron registros que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
