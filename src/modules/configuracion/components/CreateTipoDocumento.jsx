import { X, Save } from 'lucide-react';
import { useState } from 'react';
import { useAlert } from '../../../providers/AlertProvider';

export const CreateTipoDocumento = ({ isOpen, onClose, onSaved }) => {
    const { showAlert } = useAlert();
    const [formData, setFormData] = useState({
        sigla: '',
        nombre: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simulación de guardado
        // Aquí iría la llamada al servicio real

        showAlert({
            message: 'Tipo de documento creado correctamente',
            status: 'success'
        });

        // Limpiar form
        setFormData({ sigla: '', nombre: '' });

        // Notificar al padre y cerrar
        if (onSaved) onSaved();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-lg font-semibold text-slate-900">Nuevo Tipo de Documento</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="sigla" className="text-sm font-medium text-slate-700">
                            Sigla <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="sigla"
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            placeholder="Ej. CC, TI"
                            value={formData.sigla}
                            onChange={(e) => setFormData(prev => ({ ...prev, sigla: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                            Nombre <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            placeholder="Ej. Cédula de Ciudadanía"
                            value={formData.nombre}
                            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        />
                    </div>

                    {/* Footer */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
