import { useRef } from 'react';
import { useBoard } from '../hooks/useBoard';
import { ModuleCard } from '../components/ModuleCard';
import { OptionSidebar } from '../components/OptionSidebar';
import { LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '../utils/dashboardVariants';
import { OPTIONS_MAP, DATA_MAP } from '../constants/dashboardMaps';
import { useDashboardConfig } from '../../../providers/DashboardConfigProvider';

const Dashboard = () => {
    const { cards, updatePosition, selectedModule, selectModule, closeSidebar } = useBoard();
    const containerRef = useRef(null);
    const { viewMode, toggleViewMode } = useDashboardConfig();

    return (
        <div ref={containerRef} className="w-full h-[calc(100vh-80px)] relative overflow-hidden bg-slate-50">
            <div className="absolute inset-0 w-full h-full opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="absolute top-4 right-4 z-50">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleViewMode}
                    className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all duration-300 border border-white/50 group"
                    title={viewMode === 'default' ? "Cambiar a vista de menú" : "Cambiar a vista libre"}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={viewMode}
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            {viewMode === 'default' ? (
                                <List className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                            ) : (
                                <LayoutGrid className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'default' ? (
                    <motion.div
                        key="default-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full absolute inset-0"
                    >
                        {cards.map(card => (
                            <ModuleCard
                                key={card.id}
                                card={card}
                                onDragEnd={updatePosition}
                                onClick={selectModule}
                                containerRef={containerRef}
                                options={DATA_MAP[card.id]}
                            />
                        ))}

                        <OptionSidebar
                            isOpen={!!selectedModule}
                            onClose={closeSidebar}
                            selectedModule={selectedModule}
                            OptionsComponent={selectedModule ? OPTIONS_MAP[selectedModule.id] : null}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="menu-view"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-full h-full flex items-center justify-center p-8 overflow-y-auto relative z-10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
                            {cards.map((card) => (
                                <motion.div
                                    key={card.id}
                                    variants={itemVariants}
                                    onClick={() => selectModule(card.id)}
                                    className="group relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.12)] cursor-pointer"
                                    whileHover={{ y: -8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                            <div className="text-4xl">
                                                {card.title === 'Talento Humano' ? '👥' :
                                                    card.title === 'Calidad' ? '⭐' :
                                                        card.title === 'Configuración' ? '⚙️' : '📄'}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                                                {card.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                                                Módulo de Gestión
                                            </p>
                                        </div>

                                        <div className="w-12 h-1 bg-slate-200 rounded-full group-hover:w-24 group-hover:bg-indigo-500 transition-all duration-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <OptionSidebar
                            isOpen={!!selectedModule}
                            onClose={closeSidebar}
                            selectedModule={selectedModule}
                            OptionsComponent={selectedModule ? OPTIONS_MAP[selectedModule.id] : null}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
