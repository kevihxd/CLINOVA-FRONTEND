export const AuthFooter = ({ version = "0.0.0" }) => {
    return (
        <div className="mt-12 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Gestión Documental IPS. Versión {version}
        </div>
    );
};
