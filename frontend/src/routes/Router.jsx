import { createBrowserRouter } from "react-router";
import Layout from "../layout/Layout.jsx";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";

let router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { 
        path: "/", 
        element: <Dashboard />
      },
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
]);

export default router;