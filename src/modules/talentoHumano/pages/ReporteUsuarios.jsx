import React, { useState, useEffect } from 'react';
import { Download, Search, Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { exportReportToExcel } from '../../../utils/excelExporter';

export const ReporteUsuarios = () => {
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('ACTIVO'); // Ocultar inactivos por defecto
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/api/v1/usuarios/reportes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsuarios(response.data || []);
            } catch (err) {
                console.error("Error cargando reporte:", err);
                setError("No se pudo cargar la información de los usuarios.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    const roleString = String(user?.rol || user?.role || user?.roles?.[0] || '').toUpperCase();
    const permisos = user?.permisos || user?.authorities || [];
    const isAdmin = roleString === 'ADMIN' || roleString === 'ROLE_ADMIN' || permisos.includes('ROLE_ADMIN');
    const isLider = roleString === 'LIDER_DE_PROCESO' || roleString === 'ROLE_LIDER_DE_PROCESO' || permisos.includes('ROLE_LIDER_DE_PROCESO') || permisos.includes('LIDER_DE_PROCESO') || permisos.includes('LIDER DE PROCESO') || roleString === 'LIDER DE PROCESO';
    
    const puedeVer = isAdmin || isLider;

    if (!puedeVer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-red-100 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                    <p className="text-gray-500 text-sm">No tienes los permisos necesarios para ver el reporte de talento humano.</p>
                </div>
            </div>
        );
    }

    const usuariosFiltrados = usuarios.filter(u => {
        const matchEstado = filtroEstado === 'TODOS' || (u.estado?.toUpperCase() || 'INACTIVO') === filtroEstado;
        const searchLower = searchTerm.toLowerCase();
        const matchSearch = (u.nombre || '').toLowerCase().includes(searchLower) ||
                            (u.documento || '').toLowerCase().includes(searchLower);
        return matchEstado && matchSearch;
    });

    const totalActivos = usuarios.filter(u => (u.estado?.toUpperCase() || 'INACTIVO') === 'ACTIVO').length;
    const totalInactivos = usuarios.filter(u => (u.estado?.toUpperCase() || 'INACTIVO') === 'INACTIVO').length;

    const exportToExcel = () => {
        const headers = ['Documento', 'Nombre Completo', 'Cargo', 'Sede', 'Estado'];
        const rows = usuariosFiltrados.map(u => [
            u.documento || '',
            u.nombre || '',
            u.cargo || 'N/A',
            u.sede || 'N/A',
            u.estado?.toUpperCase() || 'INACTIVO'
        ]);

        exportReportToExcel({
            title: 'REPORTE DE PERSONAL Y TALENTO HUMANO',
            subtitle: 'Clinova IPS - Sistema de Gestión de Personal Vigente',
            sheetName: 'Talento_Humano',
            filename: `Reporte_Talento_Humano_${new Date().toISOString().split('T')[0]}.xlsx`,
            headers,
            rows,
            themeColor: '1E3A8A'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                            <span>Inicio</span> / <span>Talento Humano</span> / <span className="text-gray-500">Reportes</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Estado de Personal</h1>
                        <p className="text-sm text-gray-500 mt-1">Generación de informes de usuarios activos e inactivos.</p>
                    </div>
                    
                    <button 
                        onClick={exportToExcel}
                        disabled={loading || usuariosFiltrados.length === 0}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" /> Exportar Excel
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4 shadow-sm">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Personal</p>
                            <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4 shadow-sm">
                        <div className="p-3 rounded-full bg-green-100 text-green-600"><UserCheck className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Activos</p>
                            <p className="text-2xl font-bold text-gray-900">{totalActivos}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4 shadow-sm">
                        <div className="p-3 rounded-full bg-red-100 text-red-600"><UserX className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Inactivos</p>
                            <p className="text-2xl font-bold text-gray-900">{totalInactivos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                        
                        <div className="flex bg-gray-100 p-1 rounded-md max-w-fit">
                            <button 
                                onClick={() => setFiltroEstado('TODOS')}
                                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${filtroEstado === 'TODOS' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                            >Todos</button>
                            <button 
                                onClick={() => setFiltroEstado('ACTIVO')}
                                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${filtroEstado === 'ACTIVO' ? 'bg-white text-green-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                            >Activos</button>
                            <button 
                                onClick={() => setFiltroEstado('INACTIVO')}
                                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${filtroEstado === 'INACTIVO' ? 'bg-white text-red-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                            >Inactivos</button>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute inset-y-0 left-0 pl-3 flex items-center h-full text-gray-400 w-8" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm outline-none" 
                                placeholder="Buscar por nombre, cédula..." 
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto max-h-[600px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-48 text-gray-500 text-sm">Cargando reporte...</div>
                        ) : error ? (
                            <div className="flex justify-center items-center h-48 text-red-500 text-sm">{error}</div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 shadow-sm z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Documento</th>
                                        <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                                        <th className="px-6 py-4 font-semibold">Sede</th>
                                        <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {usuariosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No se encontraron usuarios que coincidan con los filtros.
                                            </td>
                                        </tr>
                                    ) : (
                                        usuariosFiltrados.map((u, index) => (
                                            <tr key={u.id || index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{u.documento}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{u.nombre || 'Sin Nombre'}</td>
                                                <td className="px-6 py-4 text-gray-600 truncate max-w-[150px]" title={u.sede}>{u.sede}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                        (u.estado?.toUpperCase() || 'INACTIVO') === 'ACTIVO' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {u.estado?.toUpperCase() || 'INACTIVO'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
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
