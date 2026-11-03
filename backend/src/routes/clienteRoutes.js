import { Router } from 'express';
import verificarToken from '../middlewares/verificarToken.js';
import { criarCliente, listarClientes } from '../controllers/clienteController.js';

const router = Router();
router.use(verificarToken);
router.get('/', listarClientes);
router.post('/', criarCliente);

export default router;
