import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.use('/login', authRoutes);
app.use('/clientes', clienteRoutes);
app.use('/pedidos', pedidoRoutes);

export default app;
