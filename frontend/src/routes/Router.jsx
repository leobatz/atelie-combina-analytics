import { createBrowserRouter } from "react-router";
import Login from "../pages/Login";

let router = createBrowserRouter([
  {
    path: "/login",
    Component: <Login />
  },
]);

export default router;