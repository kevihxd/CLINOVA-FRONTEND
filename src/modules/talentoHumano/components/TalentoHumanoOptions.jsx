import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/routes.const';
import { FileText, Users, HeartPulse, GraduationCap } from 'lucide-react';
import CanAccess from '../../../components/CanAccess';

const TalentoHumanoOptions = () => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            
            {/* Opción visible para TODOS los usuarios (incluyendo su propia hoja de vida) */}
            <div 
                onClick={() => navigate(ROUTES.TALENTO_HUMANO.HOJA_VIDA)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3"
            >
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <FileText size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Hoja de Vida</h3>
                    <p className="text-xs text-gray-500 mt-1">Gestión de tu información personal y profesional</p>
                </div>
            </div>

            {/* Opciones Restringidas (Solo roles administrativos) */}
            <CanAccess requiredRole={['ADMIN', 'TALENTO_HUMANO']}>
                <div 
                    onClick={() => navigate(ROUTES.TALENTO_HUMANO.PERFILES_CARGOS)}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3"
                >
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <Users size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Perfiles y Cargos</h3>
                        <p className="text-xs text-gray-500 mt-1">Administración de perfiles y roles institucionales</p>
                    </div>
                </div>

                <div 
                    onClick={() => navigate(ROUTES.TALENTO_HUMANO.INCAPACIDADES)}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3"
                >
                    <div className="p-3 bg-red-50 rounded-full text-red-600">
                        <HeartPulse size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Incapacidades</h3>
                        <p className="text-xs text-gray-500 mt-1">Registro y control de ausentismos médicos</p>
                    </div>
                </div>

                <div 
                    onClick={() => navigate(ROUTES.TALENTO_HUMANO.CURSOS)}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3"
                >
                    <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                        <GraduationCap size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Cursos</h3>
                        <p className="text-xs text-gray-500 mt-1">Gestión de capacitaciones y certificaciones</p>
                    </div>
                </div>
            </CanAccess>

        </div>
    );
};

export default TalentoHumanoOptions;
