import { Router } from 'express';
import verificarToken from '../middlewares/verificarToken.js';
import { criarCliente, deletarCliente, editarCliente, listarClientes } from '../controllers/clienteController.js';

const router = Router();
router.use(verificarToken);
router.get('/', listarClientes);
router.post('/', criarCliente);
router.patch('/:id', editarCliente);
router.delete('/:id', deletarCliente);

export default router;
