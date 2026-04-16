import React, { useState, useEffect } from 'react';
import { vacunacionService } from '../services/vacunacion.service';
import { useAlert } from '../../../providers/AlertProvider';
import { Plus, Loader2, CheckCircle2, AlertTriangle, X, Trash2, Edit3, Settings } from 'lucide-react';

const ImportarVacunas = () => {
    const [documento, setDocumento] = useState("");
    const [colaborador, setColaborador] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [dosisData, setDosisData] = useState({ fechaAplicacion: "", fechaVencimiento: "", detalleDosis: "Dosis Única" });

    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [catalogo, setCatalogo] = useState([]);
    const [nuevaVacuna, setNuevaVacuna] = useState("");
    const [editingVacuna, setEditingVacuna] = useState({ id: null, nombre: "" });

    const { showAlert } = useAlert();

    const fetchColaborador = async (doc) => {
        try {
            const data = await vacunacionService.buscarPorDocumento(doc);
            setColaborador(data);
        } catch (error) {
            showAlert("Colaborador no encontrado", "error");
            setColaborador(null);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!documento) return;
        setLoading(true);
        await fetchColaborador(documento);
        setLoading(false);
    };

    const handleOpenDosisModal = (req, editMode = false) => {
        setSelectedReq(req);
        setIsEditing(editMode);
        if (editMode) {
            setDosisData({
                fechaAplicacion: req.fechaAplicacion || "",
                fechaVencimiento: req.fechaVencimiento || "",
                detalleDosis: req.detalleDosis || ""
            });
        } else {
            setDosisData({ fechaAplicacion: "", fechaVencimiento: "", detalleDosis: "Dosis Única" });
        }
        setShowModal(true);
    };

    const handleSubmitDosis = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                personaId: colaborador.personaId,
                nombreVacuna: selectedReq.nombre,
                ...dosisData
            };

            if (isEditing) {
                await vacunacionService.editarDosis(selectedReq.registroId, payload);
                showAlert("Dosis actualizada", "success");
            } else {
                await vacunacionService.registrarDosis(payload);
                showAlert("Dosis registrada", "success");
            }
            setShowModal(false);
            fetchColaborador(documento);
        } catch (error) {
            showAlert("Error al guardar la dosis", "error");
        }
    };

    const handleEliminarDosis = async (registroId) => {
        if (!window.confirm("¿Eliminar este registro de vacunación del colaborador?")) return;
        try {
            await vacunacionService.eliminarDosis(registroId);
            showAlert("Registro eliminado", "success");
            fetchColaborador(documento);
        } catch (e) { showAlert("Error al eliminar", "error"); }
    };

    const openCatalogo = async () => {
        setShowCatalogModal(true);
        cargarCatalogo();
    };

    const cargarCatalogo = async () => {
        try {
            const data = await vacunacionService.getCatalogo();
            setCatalogo(data);
        } catch (e) { showAlert("Error al cargar catálogo", "error"); }
    };

    const handleAddVacuna = async () => {
        if (!nuevaVacuna.trim()) return;
        try {
            await vacunacionService.addVacunaAlCatalogo(nuevaVacuna);
            setNuevaVacuna("");
            cargarCatalogo();
            showAlert("Vacuna añadida", "success");
        } catch (e) { showAlert("Error", "error"); }
    };

    const handleEditVacuna = async (id) => {
        if (!editingVacuna.nombre.trim()) return;
        try {
            await vacunacionService.editarVacunaCatalogo(id, editingVacuna.nombre);
            setEditingVacuna({ id: null, nombre: "" });
            cargarCatalogo();
            if (colaborador) fetchColaborador(documento);
            showAlert("Vacuna actualizada", "success");
        } catch (e) { showAlert("Error", "error"); }
    };

    const handleEliminarVacuna = async (id) => {
        if (!window.confirm("¿Eliminar esta vacuna del catálogo global?")) return;
        try {
            await vacunacionService.eliminarVacunaCatalogo(id);
            cargarCatalogo();
            if (colaborador) fetchColaborador(documento);
            showAlert("Vacuna eliminada", "success");
        } catch (e) { 
            const errorMsg = e.response?.data?.message || "Error al eliminar la vacuna.";
            showAlert(errorMsg, "error"); 
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-800">Módulo de Vacunación</h2>
                    <p className="text-slate-500 text-sm">Gestión de esquemas, vencimientos y catálogo global</p>
                </div>
                <button onClick={openCatalogo} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-sm hover:shadow-md">
                    <Settings size={18} /> Gestionar Catálogo
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input 
                        type="text" placeholder="Ingrese Documento de identidad..." 
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                        value={documento} onChange={(e) => setDocumento(e.target.value)}
                    />
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center min-w-[140px]">
                        {loading ? <Loader2 className="animate-spin" /> : "Buscar"}
                    </button>
                </form>
            </div>

            {colaborador && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-6">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                            {colaborador.nombreCompleto.charAt(0)}
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 text-center mb-1">{colaborador.nombreCompleto}</h3>
                        <p className="text-slate-500 text-center text-sm mb-6">CC {colaborador.numeroDocumento}</p>
                        
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Cargo Vinculado</p>
                            <p className="text-slate-700 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">{colaborador.perfil}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {colaborador.requisitos.map((req, idx) => (
                            <div key={idx} className={`p-5 rounded-2xl border transition-all ${req.completado ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-slate-800 text-lg leading-tight">{req.nombre}</span>
                                    {req.completado ? <CheckCircle2 className="text-emerald-600 shrink-0" size={24} /> : <AlertTriangle className="text-amber-400 shrink-0" size={24} />}
                                </div>
                                {req.completado ? (
                                    <>
                                        <div className="text-sm text-slate-600 space-y-1.5 mb-4 bg-white/50 p-3 rounded-lg">
                                            <p className="font-medium text-slate-700">{req.detalleDosis}</p>
                                            <p className="flex justify-between"><span>Aplicada:</span> <span className="font-medium">{req.fechaAplicacion}</span></p>
                                            {req.fechaVencimiento && (
                                                <p className={`flex justify-between ${req.vencido ? "text-red-600 font-bold" : ""}`}>
                                                    <span>Vencimiento:</span> <span>{req.fechaVencimiento}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => handleOpenDosisModal(req, true)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"><Edit3 size={18}/></button>
                                            <button onClick={() => handleEliminarDosis(req.registroId)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex items-end mt-4">
                                        <button onClick={() => handleOpenDosisModal(req, false)} className="w-full py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                                            Registrar Aplicación
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal Dosis */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-slate-800">{isEditing ? 'Editar Registro' : 'Nueva Aplicación'} - {selectedReq?.nombre}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmitDosis} className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">Detalle de la Dosis</label>
                                <input type="text" required placeholder="Ej: 1ra Dosis, Refuerzo Anual" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" value={dosisData.detalleDosis} onChange={e => setDosisData({...dosisData, detalleDosis: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Aplicación</label>
                                    <input type="date" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={dosisData.fechaAplicacion} onChange={e => setDosisData({...dosisData, fechaAplicacion: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Vencimiento <span className="font-normal text-slate-400">(Opcional)</span></label>
                                    <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={dosisData.fechaVencimiento} onChange={e => setDosisData({...dosisData, fechaVencimiento: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold mt-2 hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
                                {isEditing ? 'Actualizar Dosis' : 'Guardar Registro'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Catálogo Global */}
            {showCatalogModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[50] p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-slate-800">Catálogo Global de Biológicos</h3>
                            <button onClick={() => setShowCatalogModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                        </div>
                        
                        <div className="flex gap-2 mb-6">
                            <input 
                                type="text" placeholder="Crear nueva vacuna..." 
                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                value={nuevaVacuna} onChange={e => setNuevaVacuna(e.target.value)}
                            />
                            <button onClick={handleAddVacuna} className="px-6 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-sm">
                                Añadir
                            </button>
                        </div>

                        <div className="overflow-y-auto pr-2 flex-1">
                            <div className="space-y-3">
                                {catalogo.map(v => (
                                    <div key={v.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors">
                                        {editingVacuna.id === v.id ? (
                                            <input 
                                                autoFocus
                                                type="text" className="flex-1 p-2 bg-indigo-50 border border-indigo-200 rounded-lg font-medium text-indigo-900 outline-none mr-3"
                                                value={editingVacuna.nombre} onChange={e => setEditingVacuna({...editingVacuna, nombre: e.target.value})}
                                                onKeyDown={e => e.key === 'Enter' && handleEditVacuna(v.id)}
                                            />
                                        ) : (
                                            <span className="font-bold text-slate-700 flex-1">{v.nombre}</span>
                                        )}

                                        <div className="flex gap-2">
                                            {editingVacuna.id === v.id ? (
                                                <button onClick={() => handleEditVacuna(v.id)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700">Guardar</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => setEditingVacuna({ id: v.id, nombre: v.nombre })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit3 size={18}/></button>
                                                    <button onClick={() => handleEliminarVacuna(v.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportarVacunas;