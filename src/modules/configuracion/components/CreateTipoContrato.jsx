import { X, Save } from 'lucide-react';
import { useState } from 'react';
import { useAlert } from '../../../providers/AlertProvider';

export const CreateTipoContrato = ({ isOpen, onClose, onSaved }) => {
    const { showAlert } = useAlert();
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        descripcion: '',
        activo: true
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        showAlert({
            message: 'Tipo de contrato creado correctamente',
            status: 'success'
        });
        setFormData({
            nombre: '',
            codigo: '',
            descripcion: '',
            activo: true
        });

        if (onSaved) onSaved();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-lg font-semibold text-slate-900">Nuevo Tipo de Contrato</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                                Nombre <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                placeholder="Ej. Indefinido"
                                value={formData.nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="codigo" className="text-sm font-medium text-slate-700">
                                Código
                            </label>
                            <input
                                type="text"
                                id="codigo"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                placeholder="Ej. CIND"
                                value={formData.codigo}
                                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="descripcion" className="text-sm font-medium text-slate-700">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion"
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
                            placeholder="Descripción del tipo de contrato..."
                            value={formData.descripcion}
                            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="activo"
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            checked={formData.activo}
                            onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                        />
                        <label htmlFor="activo" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Activo
                        </label>
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
