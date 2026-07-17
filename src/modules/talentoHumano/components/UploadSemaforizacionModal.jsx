import { useState, useRef, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, LinearProgress, Alert,
    List, ListItem, ListItemIcon, ListItemText, Chip, IconButton
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    InsertDriveFile as FileIcon,
    Close as CloseIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import httpClient from '../../../services/httpClient';

export const UploadSemaforizacionModal = ({ open, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const resetState = useCallback(() => {
        setFile(null);
        setResult(null);
        setError(null);
        setUploading(false);
    }, []);

    const handleClose = () => {
        if (uploading) return;
        resetState();
        onClose();
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError(null);
        setResult(null);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
        } else {
            setError('Solo se aceptan archivos .csv');
        }
    };

    const handleFileSelect = (e) => {
        setError(null);
        setResult(null);
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await httpClient.post('/semaforizacion/upload-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const data = res?.data ?? res;
            setResult(data);

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            const msg = err?.response?.data?.message
                ?? err?.response?.data?.data?.message
                ?? err?.message
                ?? 'Error desconocido al subir el archivo.';
            setError(msg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Carga Masiva de Cursos (CSV)
                </Typography>
                <IconButton onClick={handleClose} disabled={uploading} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {/* Drag & Drop Zone */}
                {!result && (
                    <Box
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        sx={{
                            border: '2px dashed',
                            borderColor: dragActive ? 'primary.main' : file ? 'success.main' : 'grey.400',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: dragActive ? 'action.hover' : file ? 'success.light' : 'grey.50',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'action.hover',
                            }
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {file ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <FileIcon color="success" />
                                <Typography variant="body1" fontWeight="bold">
                                    {file.name}
                                </Typography>
                                <Chip
                                    label={`${(file.size / 1024).toFixed(1)} KB`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            </Box>
                        ) : (
                            <>
                                <UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                                <Typography variant="body1" color="textSecondary">
                                    Arrastra tu archivo CSV aquí
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    o haz clic para seleccionar
                                </Typography>
                            </>
                        )}
                    </Box>
                )}

                {/* Formato esperado */}
                {!result && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="caption" fontWeight="bold">Formato del CSV:</Typography>
                        <Typography variant="caption" display="block">
                            documento_empleado, nombre_curso, fecha_realizacion, fecha_vencimiento_fija (opcional)
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Fechas en formato DD/MM/YYYY. Separador: coma o punto y coma.
                        </Typography>
                    </Alert>
                )}

                {/* Progress */}
                {uploading && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                            Procesando archivo...
                        </Typography>
                    </Box>
                )}

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Results */}
                {result && (
                    <Box sx={{ mt: 1 }}>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Archivo procesado correctamente
                        </Alert>

                        <List dense>
                            <ListItem>
                                <ListItemIcon><SuccessIcon color="success" /></ListItemIcon>
                                <ListItemText
                                    primary={`${result.nuevas ?? 0} asignaciones nuevas`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                                <ListItemText
                                    primary={`${result.actualizadas ?? 0} actualizadas`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                                <ListItemText
                                    primary={`${result.errores ?? 0} errores`}
                                />
                            </ListItem>
                        </List>

                        {result.advertencias?.length > 0 && (
                            <Alert severity="warning" sx={{ mt: 1, maxHeight: 150, overflow: 'auto' }}>
                                <Typography variant="caption" fontWeight="bold">Advertencias:</Typography>
                                {result.advertencias.map((w, i) => (
                                    <Typography key={i} variant="caption" display="block">{w}</Typography>
                                ))}
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={uploading} color="inherit">
                    {result ? 'Cerrar' : 'Cancelar'}
                </Button>
                {!result && (
                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        variant="contained"
                        startIcon={<UploadIcon />}
                    >
                        {uploading ? 'Procesando...' : 'Cargar CSV'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
