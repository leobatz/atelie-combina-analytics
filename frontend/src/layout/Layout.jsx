import Header from "../components/Header.jsx";
import { Navigate, Outlet } from "react-router";

function Layout() {
    if (!localStorage.getItem('token')) {
        return <Navigate to="/login" replace />;
    }
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <Outlet />
        </div>
    );
};

export default Layout;
