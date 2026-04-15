import React, { useState } from 'react';
import { vacunacionService } from '../services/vacunacion.service';
import { useAlert } from '../../../providers/AlertProvider';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ImportarVacunas = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
        } else {
            showAlert("Seleccione un archivo Excel .xlsx válido", "error");
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        try {
            await vacunacionService.importarExcel(file);
            showAlert("Registros de vacunación actualizados", "success");
            setFile(null);
        } catch (error) {
            showAlert("Error al procesar el archivo Excel", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <FileSpreadsheet className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Carga Masiva de Vacunación</h2>
                        <p className="text-slate-500 text-sm">Sincronice el listado de dosis del talento humano.</p>
                    </div>
                </div>

                <div className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50'}`}>
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept=".xlsx" disabled={loading} />
                    <div className="flex flex-col items-center">
                        {file ? <CheckCircle className="w-12 h-12 text-green-500 mb-4" /> : <Upload className="w-12 h-12 text-slate-400 mb-4" />}
                        <p className="text-lg font-medium text-slate-700">{file ? file.name : "Subir archivo .xlsx"}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={handleUpload} disabled={!file || loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? "Procesando..." : "Cargar Datos"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportarVacunas;