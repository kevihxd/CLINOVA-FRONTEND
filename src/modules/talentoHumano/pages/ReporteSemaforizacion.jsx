import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Paper, Chip, Tooltip, IconButton, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarFilterButton } from '@mui/x-data-grid';
import {
    Download as DownloadIcon,
    FileDownload as ExcelIcon,
    CloudUpload as UploadIcon
} from '@mui/icons-material';
import httpClient from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { UploadSemaforizacionModal } from '../components/UploadSemaforizacionModal';
import * as XLSX from 'xlsx';

// Definición de grupos y sus nombres asociados en la DB
const GROUPS = {
    'TODOS': 'TODOS',
    'Enfermeria': 'ENFERMERIA',
    'Medicos': 'MEDICOS',
    'Otros profesionales': 'OTROS_PROFESIONALES',
    'FISIOTERAPIA DOM': 'FISIOTERAPIA_DOM',
    'FONOAUDIOLOGÍA DOM': 'FONOAUDIOLOGIA_DOM',
    'T. OCUPACIONAL DOM': 'T_OCUPACIONAL_DOM',
    'Administrativo': 'ADMINISTRATIVO',
    'Adm.Fundacion': 'ADM_FUNDACION'
};

// Custom Toolbar with Excel export + CSV upload
function CustomToolbar({ onExportExcel, onOpenUpload }) {
    return (
        <GridToolbarContainer sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
                <GridToolbarFilterButton />
                <Button
                    startIcon={<ExcelIcon />}
                    onClick={onExportExcel}
                    size="small"
                    sx={{ ml: 1 }}
                >
                    Exportar a Excel
                </Button>
                <Button
                    startIcon={<UploadIcon />}
                    onClick={onOpenUpload}
                    size="small"
                    color="secondary"
                    sx={{ ml: 1 }}
                >
                    Cargar CSV
                </Button>
            </Box>
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
}

const getEstadoColor = (estado) => {
    switch (estado) {
        case 'VIGENTE':    return 'success';
        case 'POR_VENCER': return 'warning';
        case 'VENCIDO':    return 'error';
        case 'NO_APLICA':  return 'info';
        default:           return 'default';
    }
};

export const ReporteSemaforizacion = () => {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [filterGroup, setFilterGroup] = useState('TODOS');
    const { showAlert } = useAlert();

    const fetchReporte = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const dbArea = GROUPS[filterGroup] || 'TODOS';
            const res = await httpClient.get(`/semaforizacion/reporte?area=${dbArea}`);
            const list = res?.data ?? res ?? [];
            setRawData(list);
        } catch (err) {
            setError('No se pudo cargar el reporte de semaforización.');
            showAlert("Error al cargar la semaforización", "error");
        } finally {
            setLoading(false);
        }
    }, [filterGroup, showAlert]);

    useEffect(() => {
        fetchReporte();
    }, [fetchReporte]);

    const handleUploadSuccess = useCallback(() => {
        showAlert("CSV procesado exitosamente. Recargando datos...", "success");
        fetchReporte();
    }, [fetchReporte, showAlert]);

    const handleFilterChange = (event, newGroup) => {
        if (newGroup !== null) {
            setFilterGroup(newGroup);
        }
    };

    // PIVOT DATA: Flat list -> One row per person
    const { rows, dynamicColumns, uniqueCourses } = useMemo(() => {
        if (!rawData || rawData.length === 0) return { rows: [], dynamicColumns: [], uniqueCourses: [] };

        const personMap = new Map();
        const courseSet = new Set();

        rawData.forEach((item) => {
            // Solo agregar la columna si el curso aplica para al menos una persona en esta vista
            if (item.estadoCurso !== 'NO_APLICA') {
                courseSet.add(item.cursoRequerido);
            }
            
            if (!personMap.has(item.usuarioId)) {
                personMap.set(item.usuarioId, {
                    id: item.usuarioId,
                    documento: item.documento,
                    nombreCompleto: item.nombreCompleto,
                    cargo: item.cargo,
                    estadoEmpleado: item.estadoEmpleado
                });
            }

            const person = personMap.get(item.usuarioId);
            person[`estado_${item.cursoRequerido}`] = item.estadoCurso;
            person[`fecha_${item.cursoRequerido}`] = item.fechaVencimiento;
            person[`url_${item.cursoRequerido}`] = item.soporteUrl;
        });

        const courses = Array.from(courseSet).sort();

        const cols = courses.map(curso => ({
            field: `estado_${curso}`,
            headerName: curso,
            minWidth: 160,
            flex: 1,
            renderCell: (params) => {
                const estado = params.value || 'FALTANTE';
                const url = params.row[`url_${curso}`];
                const fecha = params.row[`fecha_${curso}`];

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                        <Tooltip title={fecha ? `Vence: ${fecha}` : 'Sin fecha'}>
                            <Chip
                                label={estado.replace('_', ' ')}
                                color={getEstadoColor(estado)}
                                size="small"
                                sx={{ fontWeight: 'bold', fontSize: '0.7rem', height: 24 }}
                            />
                        </Tooltip>
                        {url && (
                            <Tooltip title="Descargar Certificado">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(url, '_blank');
                                    }}
                                    sx={{ padding: 0.5 }}
                                >
                                    <DownloadIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        }));

        return {
            rows: Array.from(personMap.values()),
            dynamicColumns: cols,
            uniqueCourses: courses
        };
    }, [rawData]);

    const handleExportExcel = () => {
        if (rows.length === 0) return;

        const excelData = rows.map(row => {
            const rowData = {
                'Documento': row.documento,
                'Colaborador': row.nombreCompleto,
                'Cargo': row.cargo
            };

            uniqueCourses.forEach(curso => {
                const estado = row[`estado_${curso}`] || 'FALTANTE';
                const fecha = row[`fecha_${curso}`] || 'N/A';
                rowData[curso] = `${estado.replace('_', ' ')} (${fecha})`;
            });

            return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Semaforizacion_${filterGroup}`);
        
        const colWidths = [
            { wch: 15 },
            { wch: 35 },
            { wch: 25 },
            ...uniqueCourses.map(() => ({ wch: 25 }))
        ];
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `Semaforizacion_${filterGroup}_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const baseColumns = [
        { field: 'documento',      headerName: 'Documento',      width: 120 },
        { field: 'nombreCompleto', headerName: 'Colaborador',    width: 200 },
        { field: 'cargo',          headerName: 'Cargo',          width: 180 },
    ];

    const allColumns = [...baseColumns, ...dynamicColumns];

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#013C5A' }}>
                    Matriz de Semaforización de Requisitos
                </Typography>

                {/* Filtros rápidos por grupo */}
                <ToggleButtonGroup
                    value={filterGroup}
                    exclusive
                    onChange={handleFilterChange}
                    aria-label="Filtro de grupos"
                    size="small"
                    sx={{ flexWrap: 'wrap' }}
                >
                    {Object.keys(GROUPS).map((group) => (
                        <ToggleButton key={group} value={group} sx={{ px: 2, fontWeight: 'bold' }}>
                            {group}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Paper elevation={3} sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={allColumns}
                    loading={loading}
                    slots={{ toolbar: CustomToolbar }}
                    slotProps={{
                        toolbar: {
                            onExportExcel: handleExportExcel,
                            onOpenUpload: () => setUploadOpen(true)
                        }
                    }}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f1f5f9',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#f0f4ff',
                        },
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                        }
                    }}
                />
            </Paper>

            {/* Modal de carga CSV */}
            <UploadSemaforizacionModal
                open={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </Box>
    );
};
