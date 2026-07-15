import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Search, Filter, XCircle, ChevronDown, CheckCircle2, AlertTriangle, ArrowDownToLine, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CURSOS_MAESTROS = [
    "VICTIMA DE CONFLICTO ARMADO",
    "PRIMERA AYUDA PSICOLOGICA",
    "SEGURIDAD DEL PACIENTE",
    "HUMANIZACION EN SALUD",
    "HIGIENE DE MANOS"
];

const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const s = String(dateStr).trim();
    if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return s;
};

const getStatusForDate = (dateStr) => {
    if (!dateStr || dateStr.toUpperCase() === 'NO ASIGNADO' || dateStr === '-') return { estado: 'NO ASIGNADO', dias: null };
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return { estado: 'NO ASIGNADO', dias: null };
    const today = new Date();
    today.setHours(0,0,0,0);
    targetDate.setHours(0,0,0,0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { estado: 'VENCIDO', dias: diffDays };
    if (diffDays <= 30) return { estado: 'PROXIMO A VENCER', dias: diffDays };
    return { estado: 'VIGENTE', dias: diffDays };
};

const getStatusColor = (estado) => {
    if (estado === 'VIGENTE') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (estado === 'PROXIMO A VENCER') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (estado === 'VENCIDO') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
};

export function ReporteSemaforizacion() {
    const [employees, setEmployees] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState({
        sede: 'TODAS',
        cargo: 'TODOS',
        estadoContrato: 'TODOS',
        ...CURSOS_MAESTROS.reduce((acc, curr) => ({ ...acc, [curr]: 'TODOS' }), {})
    });

    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let allEmployees = [...employees];

        for (const file of files) {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

            let headerIdx = -1;
            for (let i = 0; i < Math.min(20, json.length); i++) {
                const rowStr = JSON.stringify(json[i] || []).toUpperCase();
                if (rowStr.includes('IDENTIFICACI') || rowStr.includes('DOCUMENTO') || rowStr.includes('NOMBRE COMPLETO')) {
                    headerIdx = i;
                    break;
                }
            }

            if (headerIdx === -1) {
                if (json[0] && json[0].length > 5) headerIdx = 0;
                else continue;
            }

            const headers = json[headerIdx].map(h => String(h || '').toUpperCase().trim());
            const cedulaCol = headers.findIndex(h => h.includes('IDENTIFICACI') || h.includes('DOCUMENTO'));
            const nombreCol = headers.findIndex(h => h.includes('NOMBRE COMPLETO') || h === 'NOMBRES');
            const apellidoCol = headers.findIndex(h => h === 'APELLIDOS');
            const cargoCol = headers.findIndex(h => h === 'CARGO');
            const sedeCol = headers.findIndex(h => h === 'SEDE');
            const contratoFinCol = headers.findIndex(h => h.includes('FECHA FIN CONTRATO') || (h.includes('CONTRATO') && !h.includes('TIPO') && !h.includes('VALOR') && !h.includes('INICIO')));

            const courseCols = {};
            CURSOS_MAESTROS.forEach(cm => {
                const parts = cm.split(' ');
                const kw = parts[0].length > 4 ? parts[0] : parts[1];
                const colIdx = headers.findIndex(h => h.includes(kw));
                if (colIdx !== -1) courseCols[cm] = colIdx;
            });

            for (let i = headerIdx + 1; i < json.length; i++) {
                const row = json[i];
                if (!row || row.length === 0) continue;
                
                let cedula = cedulaCol !== -1 ? String(row[cedulaCol] || '').trim() : '';
                if (!cedula && nombreCol !== -1) {
                    const maybeCedula = String(row[2] || '').trim();
                    if (/^\d{6,11}$/.test(maybeCedula)) cedula = maybeCedula;
                }
                
                cedula = cedula.replace(/\.0$/, '');
                if (!/^\d{6,15}$/.test(cedula)) continue;

                const n = nombreCol !== -1 ? String(row[nombreCol] || '').trim() : '';
                const a = apellidoCol !== -1 ? String(row[apellidoCol] || '').trim() : '';
                const nombre = n + (a ? ' ' + a : '') || String(row[0] || '').trim();
                const cargo = cargoCol !== -1 ? String(row[cargoCol] || '').trim() : String(row[1] || '').trim();
                const sede = (sedeCol !== -1 ? String(row[sedeCol] || '').trim() : String(row[3] || '').trim()) || 'SIN SEDE';

                // Contrato status
                let contratoFin = null;
                if (contratoFinCol !== -1 && row[contratoFinCol]) {
                    contratoFin = parseDateString(row[contratoFinCol]);
                }
                const contratoStatus = getStatusForDate(contratoFin);

                const cursos = {};
                CURSOS_MAESTROS.forEach(cm => {
                    const colIdx = courseCols[cm];
                    if (colIdx !== undefined && colIdx !== -1) {
                        const dateVal = parseDateString(row[colIdx]);
                        const st = getStatusForDate(dateVal);
                        cursos[cm] = { fecha: dateVal, estado: st.estado, dias: st.dias };
                    } else {
                        cursos[cm] = { fecha: null, estado: 'NO ASIGNADO', dias: null };
                    }
                });

                const existingIdx = allEmployees.findIndex(emp => emp.cedula === cedula);
                const newEmp = { cedula, nombre, cargo, sede, contratoFin, contratoEstado: contratoStatus.estado, cursos };
                
                if (existingIdx >= 0) allEmployees[existingIdx] = { ...allEmployees[existingIdx], ...newEmp };
                else allEmployees.push(newEmp);
            }
        }

        setEmployees(allEmployees);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const clearData = () => {
        if(window.confirm("¿Estás seguro de limpiar la tabla?")) {
            setEmployees([]);
        }
    };

    // Derived lists for dropdowns
    const sedesList = useMemo(() => ['TODAS', ...Array.from(new Set(employees.map(e => e.sede))).sort()], [employees]);
    const cargosList = useMemo(() => ['TODOS', ...Array.from(new Set(employees.map(e => e.cargo))).sort()], [employees]);
    const estadosBasicos = ['TODOS', 'VIGENTE', 'PROXIMO A VENCER', 'VENCIDO', 'NO ASIGNADO'];

    // Filtered data
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            if (searchTerm && !emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && !emp.cedula.includes(searchTerm)) return false;
            if (filtros.sede !== 'TODAS' && emp.sede !== filtros.sede) return false;
            if (filtros.cargo !== 'TODOS' && emp.cargo !== filtros.cargo) return false;
            if (filtros.estadoContrato !== 'TODOS' && emp.contratoEstado !== filtros.estadoContrato) return false;
            
            for (const cm of CURSOS_MAESTROS) {
                if (filtros[cm] !== 'TODOS' && emp.cursos[cm].estado !== filtros[cm]) return false;
            }
            return true;
        });
    }, [employees, searchTerm, filtros]);

    const handleFilterChange = (key, val) => setFiltros(prev => ({ ...prev, [key]: val }));

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="text-indigo-600" />
                        Tabla General de Semaforización
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Carga tus archivos de Excel y visualízalos exactamente como son, con filtros por columna.</p>
                </div>
                
                <div className="flex gap-3">
                    {employees.length > 0 && (
                        <button onClick={clearData} className="px-4 py-2 flex items-center gap-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-medium transition-colors border border-rose-200">
                            <Trash2 size={16} /> Limpiar Tabla
                        </button>
                    )}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5"
                    >
                        <ArrowDownToLine size={18} /> Cargar Archivos Excel
                    </button>
                    <input type="file" multiple accept=".xlsx, .xls, .csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                </div>
            </div>

            {employees.length === 0 ? (
                // Empty State Dropzone
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`mt-10 border-2 border-dashed rounded-2xl p-16 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-slate-400 bg-white'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if(e.dataTransfer.files.length > 0) handleFileUpload({ target: { files: e.dataTransfer.files }});
                    }}
                >
                    <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                        <FileSpreadsheet size={40} className="text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No hay datos cargados en la tabla</h3>
                    <p className="text-slate-500 mt-2 max-w-lg mx-auto">
                        Arrastra y suelta aquí todos los archivos Excel que tengas. El sistema los consolidará automáticamente en una tabla interactiva donde podrás filtrar cada columna.
                    </p>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-8 px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
                    >
                        Seleccionar Archivos
                    </button>
                </motion.div>
            ) : (
                // Table View
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
                    
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" placeholder="Buscar empleado o cédula..." 
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            />
                        </div>
                        <div className="text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                            Mostrando {filteredEmployees.length} registros
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="overflow-x-auto w-full" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                        <table className="w-full text-left text-sm whitespace-nowrap relative border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-30 shadow-sm">
                                <tr>
                                    {/* EMPLEADO (Sticky) */}
                                    <th className="px-5 py-3 sticky left-0 bg-slate-100 z-40 border-b border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[250px]">
                                        Empleado
                                    </th>
                                    
                                    {/* SEDE */}
                                    <th className="px-3 py-2 border-b border-r border-slate-200 bg-white min-w-[160px]">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="px-2 text-slate-800">Sede</span>
                                            <select 
                                                value={filtros.sede} onChange={e => handleFilterChange('sede', e.target.value)}
                                                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded p-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {sedesList.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </th>

                                    {/* CARGO */}
                                    <th className="px-3 py-2 border-b border-r border-slate-200 bg-white min-w-[180px]">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="px-2 text-slate-800">Cargo</span>
                                            <select 
                                                value={filtros.cargo} onChange={e => handleFilterChange('cargo', e.target.value)}
                                                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded p-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {cargosList.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </th>

                                    {/* CONTRATO */}
                                    <th className="px-3 py-2 border-b border-r border-indigo-200 bg-indigo-50 min-w-[160px]">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="px-2 text-indigo-900 font-extrabold">Estado Contrato</span>
                                            <select 
                                                value={filtros.estadoContrato} onChange={e => handleFilterChange('estadoContrato', e.target.value)}
                                                className="w-full text-xs font-bold bg-white border border-indigo-300 rounded p-1.5 outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-800"
                                            >
                                                {estadosBasicos.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </th>

                                    {/* CURSOS */}
                                    {CURSOS_MAESTROS.map((cm, idx) => (
                                        <th key={idx} className="px-3 py-2 border-b border-r border-slate-200 bg-white min-w-[170px]">
                                            <div className="flex flex-col h-full gap-2 justify-between">
                                                <span className="px-2 text-slate-800 whitespace-normal leading-tight text-center">{cm}</span>
                                                <select 
                                                    value={filtros[cm]} onChange={e => handleFilterChange(cm, e.target.value)}
                                                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded p-1.5 outline-none focus:ring-2 focus:ring-indigo-500 mt-auto"
                                                >
                                                    {estadosBasicos.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-slate-200">
                                {filteredEmployees.map((emp, index) => (
                                    <tr key={index} className="hover:bg-indigo-50/40 transition-colors group">
                                        
                                        {/* EMPLEADO (Sticky) */}
                                        <td className="px-5 py-3 sticky left-0 bg-white group-hover:bg-indigo-50/40 z-20 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="font-extrabold text-slate-900">{emp.nombre}</div>
                                            <div className="text-xs text-slate-500 font-medium mt-0.5">{emp.cedula}</div>
                                        </td>
                                        
                                        {/* SEDE */}
                                        <td className="px-5 py-3 text-slate-700 font-semibold text-xs border-r border-slate-100 bg-white group-hover:bg-transparent">
                                            {emp.sede}
                                        </td>

                                        {/* CARGO */}
                                        <td className="px-5 py-3 text-slate-600 font-medium text-[11px] border-r border-slate-100 bg-slate-50/30 group-hover:bg-transparent whitespace-normal min-w-[180px]">
                                            {emp.cargo}
                                        </td>
                                        
                                        {/* CONTRATO */}
                                        <td className="px-5 py-3 border-r border-indigo-100 bg-indigo-50/30">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider shadow-sm ${getStatusColor(emp.contratoEstado)}`}>
                                                    {emp.contratoEstado}
                                                </span>
                                                {emp.contratoFin && (
                                                    <span className="text-[11px] font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                        {emp.contratoFin}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* CURSOS */}
                                        {CURSOS_MAESTROS.map((cm, idx) => {
                                            const curso = emp.cursos[cm];
                                            return (
                                                <td key={idx} className="px-5 py-3 border-r border-slate-100 text-center align-middle bg-white group-hover:bg-transparent">
                                                    {curso.estado !== 'NO ASIGNADO' ? (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider shadow-sm ${getStatusColor(curso.estado)}`}>
                                                                {curso.estado}
                                                            </span>
                                                            {curso.fecha && (
                                                                <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                                                    {curso.fecha}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 font-bold text-lg">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={4 + CURSOS_MAESTROS.length} className="px-5 py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Filter size={32} className="text-slate-300 mb-2"/>
                                                <span className="text-lg font-semibold">No se encontraron registros</span>
                                                <span className="text-sm">Intenta ajustar los filtros de las columnas o el buscador.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
