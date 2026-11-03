import { Router } from 'express';
import verificarToken from '../middlewares/verificarToken.js';
import { atualizarStatus, cancelarPedido, criarPedido, detalharPedido, listarPedidos } from '../controllers/pedidoController.js';

const router = Router();
router.use(verificarToken);
router.get('/', listarPedidos);
router.get('/:id', detalharPedido);
router.post('/', criarPedido);
router.patch('/:id/status', atualizarStatus);
router.patch('/:id/cancelar', cancelarPedido);

export default router;
