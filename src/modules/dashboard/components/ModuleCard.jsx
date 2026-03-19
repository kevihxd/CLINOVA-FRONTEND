import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRightClickMenu } from '../../../hooks/useRightClickMenu';
import { ConceptMapPreview } from './ConceptMapPreview';

export const ModuleCard = ({ card, onDragEnd, onClick, containerRef, options }) => {
    const Icon = card.icon;
    const { showMenu, handleContextMenu } = useRightClickMenu();

    return (
        <motion.div
            drag
            dragConstraints={containerRef}
            dragMomentum={false}
            dragElastic={0.1}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick(card.id);
            }}
            onContextMenu={handleContextMenu}
            initial={{ x: card.position.x, y: card.position.y, opacity: 0, scale: 0.9 }}
            animate={{ x: card.position.x, y: card.position.y, opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, zIndex: 50, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing', boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}
            onDragEnd={(event, info) => {
                const newPosition = {
                    x: card.position.x + info.offset.x,
                    y: card.position.y + info.offset.y
                };
                onDragEnd(card.id, newPosition);
            }}
            className="absolute w-72 p-5 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-md flex flex-col gap-4 cursor-grab group"
        >
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${card.color} text-white shadow-sm`}>
                    <Icon size={24} />
                </div>
                <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-green-400 transition-colors" />
            </div>

            <div>
                <h3 className="font-bold text-slate-800 text-lg">{card.title}</h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                    {card.description}
                </p>
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium">
                {/* <span>Actualizado hoy</span> */}
                {/* <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:border-slate-200 transition-colors">
                    ID: {card.id}
                </span> */}
            </div>

            {/* Desktop Only Preview Map */}
            <AnimatePresence>
                {showMenu && options && (
                    <div className="hidden md:block">
                        <ConceptMapPreview options={options} title={card.title} />
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
