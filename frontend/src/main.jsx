import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router"
import { ToastContainer } from 'react-toastify'
import router from './routes/Router.jsx'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
    <ToastContainer position="top-right" autoClose={4000} />
  </StrictMode>,
)
