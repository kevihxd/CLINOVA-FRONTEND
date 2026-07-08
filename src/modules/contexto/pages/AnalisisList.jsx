import React, { useState, useEffect } from 'react';
import http from '../../../services/httpClient';

const abrirArchivoConToken = async (url) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            alert('No se encontró el archivo en el servidor.');
            return;
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
    } catch (e) {
        alert('Error al abrir el archivo.');
    }
};

export const AnalisisList = () => {
    const [data, setData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', fechaCreacion: '', fechaModificacion: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await http.get('/contexto/analisis');
            const items = response?.data?.data || response?.data || response || [];
            setData(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(data.map(d => d.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const payload = {
                ...formData,
                fechaCreacion: formData.fechaCreacion || dateStr,
                fechaModificacion: dateStr
            };
            await http.post('/contexto/analisis', payload);
            setShowModal(false);
            setFormData({ nombre: '', fechaCreacion: '', fechaModificacion: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating data', error);
        }
    };

    const handleVer = () => {
        if (selectedIds.length !== 1) {
            alert('Seleccione un único registro para ver su documento.');
            return;
        }
        abrirArchivoConToken(`http://localhost:8080/api/v1/contexto/analisis/descargar/${selectedIds[0]}`);
    };

    return (
        <div className="w-full bg-white min-h-screen">
            {/* Breadcrumb */}
            <div className="w-full px-4 py-2 border-b border-slate-200">
                <p className="text-sm">
                    <span className="text-blue-800 font-bold">Contexto de la organización</span>
                    <span className="text-slate-500 mx-2">{'>'}</span>
                    <span className="text-blue-800 font-bold">Análisis del contexto</span>
                </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full px-4 py-3 bg-slate-50 border-b border-slate-200 flex gap-2">
                <button onClick={() => setShowModal(true)} className="px-3 py-1 bg-gradient-to-b from-white to-slate-100 border border-slate-300 rounded text-slate-700 text-sm hover:bg-slate-50 transition-colors shadow-sm">Insertar</button>
                <button className="px-3 py-1 bg-gradient-to-b from-white to-slate-100 border border-slate-300 rounded text-slate-700 text-sm hover:bg-slate-50 transition-colors shadow-sm">Modificar</button>
                <button onClick={handleVer} className="px-3 py-1 bg-gradient-to-b from-white to-slate-100 border border-slate-300 rounded text-slate-700 text-sm hover:bg-slate-50 transition-colors shadow-sm">Ver</button>
                <button className="px-3 py-1 bg-gradient-to-b from-white to-slate-100 border border-slate-300 rounded text-slate-700 text-sm hover:bg-slate-50 transition-colors shadow-sm">Eliminar</button>
                <button className="px-3 py-1 bg-gradient-to-b from-white to-slate-100 border border-slate-300 rounded text-slate-700 text-sm hover:bg-slate-50 transition-colors shadow-sm">Análisis</button>
                <button className="px-3 py-1 bg-gradient-to-b from-white to-slate-100 border border-slate-300 rounded text-slate-700 text-sm hover:bg-slate-50 transition-colors shadow-sm">Exportar</button>
            </div>

            <div className="p-4">
                {/* Controls Bar */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span>Mostrar</span>
                        <select className="border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-500">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-700">Buscar:</span>
                        <input type="text" className="border border-slate-300 rounded px-2 py-1 w-64 focus:outline-none focus:border-blue-500" />
                    </div>
                </div>

                {/* Table */}
                <div className="w-full border border-slate-200 rounded-t overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#e9e9e9] text-slate-700 border-b border-slate-300 font-semibold">
                            <tr>
                                <th className="py-2 px-3 w-10 border-r border-slate-300 text-center">
                                    <input type="checkbox" onChange={handleSelectAll} checked={data.length > 0 && selectedIds.length === data.length} className="w-3.5 h-3.5 cursor-pointer rounded-sm border-slate-300" />
                                </th>
                                <th className="py-2 px-4 text-center border-r border-slate-300 w-16">ID</th>
                                <th className="py-2 px-4 text-center border-r border-slate-300">Nombre del análisis de contexto</th>
                                <th className="py-2 px-4 text-center border-r border-slate-300">Fecha creación</th>
                                <th className="py-2 px-4 text-center">Fecha última modificación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan="5" className="py-8 text-center text-slate-500 bg-white">No hay datos disponibles en la tabla</td></tr>
                            ) : (
                                data.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    return (
                                        <tr key={item.id} className={`border-b border-slate-200 ${isSelected ? 'bg-orange-500 text-white' : 'bg-white hover:bg-slate-50 text-slate-700'} transition-colors`}>
                                            <td className="py-2 px-3 border-r border-slate-200 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => handleSelect(item.id)}
                                                    className="w-3.5 h-3.5 cursor-pointer rounded-sm border-slate-300" 
                                                />
                                            </td>
                                            <td className="py-2 px-4 border-r border-slate-200 text-center">{item.id}</td>
                                            <td className="py-2 px-4 border-r border-slate-200">{item.nombre}</td>
                                            <td className="py-2 px-4 border-r border-slate-200 text-center">{item.fechaCreacion}</td>
                                            <td className="py-2 px-4 text-center">{item.fechaModificacion}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 text-sm text-slate-600">
                    <div>1 a {data.length} de {data.length}</div>
                    <div className="flex gap-1">
                        <button className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:bg-slate-200">&lt;&lt;</button>
                        <button className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:bg-slate-200">&lt;</button>
                        <button className="px-3 py-1 bg-orange-500 text-white rounded font-bold">1</button>
                        <button className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:bg-slate-200">&gt;</button>
                        <button className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:bg-slate-200">&gt;&gt;</button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Insertar Análisis del Contexto</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del análisis</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    value={formData.nombre}
                                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Creación (opcional)</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    value={formData.fechaCreacion}
                                    onChange={e => setFormData({...formData, fechaCreacion: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition-colors font-medium text-sm"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors font-medium text-sm"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
