import { createBrowserRouter } from "react-router";
import Layout from "../layout/Layout.jsx";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Pedidos from "../pages/Pedidos.jsx";
import Clientes from "../pages/Clientes.jsx";

let router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { 
        path: "/", 
        element: <Dashboard />
      },
      { 
        path: "/pedidos", 
        element: <Pedidos />
      },
      {
        path: "/clientes",
        element: <Clientes />
      },
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
]);

export default router;
