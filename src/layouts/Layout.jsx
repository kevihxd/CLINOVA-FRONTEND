import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans">
            <Navbar />
            <main className="w-full pt-20">
                <div className="w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
