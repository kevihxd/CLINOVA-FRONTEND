import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OptionSidebar = ({ isOpen, onClose, selectedModule, OptionsComponent }) => {
    return (
        <AnimatePresence>
            {isOpen && selectedModule && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 border-l border-slate-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className={`p-6 ${selectedModule.color.replace('bg-', 'bg-')}/10 border-b border-slate-100 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedModule.color} text-white shadow-sm`}>
                                    <selectedModule.icon size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">{selectedModule.title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50">
                            {OptionsComponent ? (
                                <OptionsComponent />
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    <p>No hay opciones configuradas para este módulo aún.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white text-center text-xs text-slate-300">
                            {/* Módulo ID: {selectedModule.id} */}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
