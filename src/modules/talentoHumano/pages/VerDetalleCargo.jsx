import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, GraduationCap, Award, Briefcase, FileText, CheckCircle2, Star, Lightbulb } from 'lucide-react';

const MOCK_DETAIL = {
    general: {
        cargo: 'Fisioterapeuta',
        jefeInmediato: 'Coordinador de atención Domiciliaria',
        version: '1',
        fecha: 'Enero 13-2026'
    },
    asistenciales: [
        'Evaluar integralmente la condición del movimiento del cuerpo de las personas...',
        'Realizar valoración para poder aplicar los tratamientos basados en técnicas...',
        'Diligenciamiento de consentimiento informado y explicación de procedimiento.',
        'Ingreso de historia clínica para: Verificación de diagnóstico, anamnesis...',
        'Ejecución del plan de manejo indicado y según diagnostico medico.',
        'Brindar educación al paciente y familiar según su necesidad.',
        'Asegurar que durante la prestación del servicio se mantenga una adecuada relación...'
    ],
    domiciliaria: [
        'Realizar valoración funcional integral del paciente en el domicilio...',
        'Evaluar movilidad, fuerza muscular, equilibrio, marcha, postura, capacidad respiratoria...'
    ],
    educacion: {
        nivel: 'Profesional',
        titulo: 'Fisioterapeuta',
        puntaje: 15,
        minimo: 15
    },
    formacion: [
        { programa: 'Soporte Vital Basico (BLS)', puntaje: 2 },
        { programa: 'Atención Integral de Victimas de violencia sexual', puntaje: 2 },
        { programa: 'Atención Integral a Victimas del Conflicto Armado (PAPSIVI)', puntaje: 2 },
        { programa: 'Atención Integral a Victimas de Ataques con Agentes Químicos', puntaje: 2 },
        { programa: 'Curso Manejo del Dolor y Cuidado Paliativo', puntaje: 2 }
    ],
    habilidades: [
        'Habilidad 1',
        'Habilidad 2',
        'Habilidad 3'
    ],
    experiencia: {
        cargo: 'Fisioterapeuta',
        duracion: 'Mínimo un año',
        puntaje: 15,
        minimo: 40
    }
};

const SectionCard = ({ title, icon: Icon, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
        <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Icon size={20} />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </motion.div>
);

export const VerDetalleCargo = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans animate-fade-in">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors group"
                >
                    <div className="p-2 bg-white rounded-full shadow-sm border border-slate-200 group-hover:border-indigo-200 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-medium">Volver a listado</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0.8, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight"
                        >
                            {MOCK_DETAIL.general.cargo}
                        </motion.h1>
                        <p className="text-slate-500 mt-2 text-lg">Detalle del perfil y requisitos del cargo</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Versión {MOCK_DETAIL.general.version}
                        </span>
                        <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100 flex items-center gap-2">
                            <Star size={16} /> Puntos Totales: {15 + 10 + 15}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* General Info Grid */}
                <SectionCard title="Información General" icon={FileText} delay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Cargo</span>
                            <span className="text-lg font-medium text-slate-800">{MOCK_DETAIL.general.cargo}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Jefe Inmediato</span>
                            <span className="text-lg font-medium text-slate-800">{MOCK_DETAIL.general.jefeInmediato}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Versión</span>
                            <span className="text-lg font-medium text-slate-800">{MOCK_DETAIL.general.version}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Fecha</span>
                            <span className="text-lg font-medium text-slate-800">{MOCK_DETAIL.general.fecha}</span>
                        </div>
                    </div>
                </SectionCard>

                {/* Duties Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SectionCard title="Funciones Asistenciales" icon={Briefcase} delay={0.2}>
                        <ul className="space-y-3">
                            {MOCK_DETAIL.asistenciales.map((item, i) => (
                                <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <div className="min-w-[6px] h-[6px] rounded-full bg-indigo-400 mt-2" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </SectionCard>

                    <div className="space-y-8">
                        <SectionCard title="Atención Domiciliaria" icon={Briefcase} delay={0.3}>
                            <ul className="space-y-3">
                                {MOCK_DETAIL.domiciliaria.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="min-w-[6px] h-[6px] rounded-full bg-emerald-400 mt-2" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </SectionCard>

                        <SectionCard title="Educación" icon={GraduationCap} delay={0.4}>
                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3">Nivel</th>
                                            <th className="px-4 py-3">Título</th>
                                            <th className="px-4 py-3 text-right">Puntaje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        <tr>
                                            <td className="px-4 py-3 font-medium text-slate-800">{MOCK_DETAIL.educacion.nivel}</td>
                                            <td className="px-4 py-3 text-slate-600">{MOCK_DETAIL.educacion.titulo}</td>
                                            <td className="px-4 py-3 text-right font-medium text-indigo-600">{MOCK_DETAIL.educacion.puntaje}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-slate-50/50 border-t border-slate-100">
                                        <tr>
                                            <td colSpan="2" className="px-4 py-2 text-xs text-slate-500 font-medium">Puntaje mínimo requerido</td>
                                            <td className="px-4 py-2 text-right text-xs font-bold text-slate-700">{MOCK_DETAIL.educacion.minimo}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* Training & Experience & Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SectionCard title="Formación Continua" icon={BookOpen} delay={0.5}>
                        <div className="overflow-hidden rounded-xl border border-slate-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Programa</th>
                                        <th className="px-4 py-3 text-right">Ptos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {MOCK_DETAIL.formacion.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 text-slate-600">{item.programa}</td>
                                            <td className="px-4 py-3 text-right font-medium text-indigo-600">{item.puntaje}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50/50 border-t border-slate-100">
                                    <tr>
                                        <td className="px-4 py-2 text-xs text-slate-500 font-medium">Total Puntos Formación</td>
                                        <td className="px-4 py-2 text-right text-xs font-bold text-slate-700">10</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </SectionCard>

                    <div className="space-y-8">
                        <SectionCard title="Experiencia Laboral" icon={Award} delay={0.6}>
                            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{MOCK_DETAIL.experiencia.cargo}</h4>
                                        <span className="text-sm text-slate-500 block mt-1">Duración requerida: <span className="font-medium text-slate-700">{MOCK_DETAIL.experiencia.duracion}</span></span>
                                    </div>
                                    <div className="text-center bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                                        <span className="block text-xl font-bold text-orange-600">{MOCK_DETAIL.experiencia.puntaje}</span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Puntos</span>
                                    </div>
                                </div>
                                <div className="w-full bg-orange-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-orange-400 h-full rounded-full w-[40%]" />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Puntaje Base</span>
                                    <span>Min. Requerido: {MOCK_DETAIL.experiencia.minimo}</span>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Habilidades" icon={Lightbulb} delay={0.7}>
                            {MOCK_DETAIL.habilidades.length > 0 ? (
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {MOCK_DETAIL.habilidades.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition-all">
                                            <div className="h-2 w-2 rounded-full bg-yellow-400 flex-shrink-0" />
                                            <span className="font-medium text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-sm italic">No hay habilidades registradas</p>
                            )}
                        </SectionCard>
                    </div>
                </div>

            </div>
        </div>
    );
};
