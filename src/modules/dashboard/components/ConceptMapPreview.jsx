import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const ConceptMapPreview = ({ options = [], title }) => {
    const navigate = useNavigate();

    if (!options.length) return null;

    // Radius for the circular layout
    const radius = 120;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none z-50 flex items-center justify-center">
            {/* Backdrop Blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full"
            />

            {/* Central Node (Module Title) */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="absolute z-10 w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center text-center p-2 border-4 border-indigo-100"
            >
                <span className="text-xs font-bold text-slate-700">{title}</span>
            </motion.div>

            {/* Satellite Nodes (Options) */}
            {options.map((opt, index) => {
                const angle = (index / options.length) * 2 * Math.PI;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <motion.div
                        key={index}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{ scale: 1, x, y }}
                        whileHover={{ scale: 1.2, zIndex: 60 }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent bubbling if needed
                            navigate(opt.page);
                        }}
                        transition={{
                            type: "spring",
                            damping: 15,
                            stiffness: 200,
                            delay: index * 0.1
                        }}
                        className="absolute w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-indigo-50 cursor-pointer pointer-events-auto group hover:border-indigo-300 hover:shadow-indigo-200/50 transition-colors"
                    >
                        {/* Connecting Line (Pseudo-element approach is hard in absolute items, drawing SVG lines is better but simplified here) */}
                        <div className="absolute top-1/2 left-1/2 w-full h-[2px] bg-indigo-200/50 -z-10 origin-left pointer-events-none"
                            style={{
                                width: radius,
                                transform: `rotate(${Math.atan2(-y, -x) * (180 / Math.PI)}deg) translate(0px, -50%)`, // Rotating to point to center
                                left: '50%',
                                top: '50%'
                            }}
                        />

                        <opt.icon className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600" />

                        {/* Tooltip for option name */}
                        <div className="absolute top-full mt-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg font-medium">
                            {opt.title}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
