import Header from "../components/Header.jsx";
import { Outlet } from "react-router";

function Layout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <Outlet />
        </div>
    );
};

export default Layout;