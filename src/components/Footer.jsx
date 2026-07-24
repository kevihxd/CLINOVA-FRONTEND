export const AuthFooter = ({ version = "0.0.0" }) => {
    return (
        <div className="mt-12 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5 select-none">
            <div>&copy; {new Date().getFullYear()} Gestión Documental IPS. Versión {version}</div>
            <div className="text-[11px] text-slate-400/70 flex items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                <span>Desarrollado con</span>
                <span className="text-red-500 text-xs inline-block animate-pulse">❤️</span>
                <span>por el Departamento de Sistemas</span>
            </div>
        </div>
    );
};
