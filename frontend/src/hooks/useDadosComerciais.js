import { useEffect, useState } from 'react';
import { listarClientes } from '../services/clientesApi.js';
import { listarPedidos } from '../services/pedidosApi.js';
import { mensagemErro } from '../utils/pedidos.js';

export default function useDadosComerciais() {
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([listarClientes(controller.signal), listarPedidos(controller.signal)])
      .then(([clientesRecebidos, pedidosRecebidos]) => {
        if (!controller.signal.aborted) {
          setClientes(clientesRecebidos);
          setPedidos(pedidosRecebidos);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setErro(mensagemErro(error, 'Não foi possível carregar os dados. Verifique a conexão com o servidor.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });
    return () => controller.abort();
  }, [tentativa]);

  function recarregar() {
    setCarregando(true);
    setErro('');
    setTentativa((valor) => valor + 1);
  }

  return { clientes, pedidos, carregando, erro, recarregar, setClientes };
}
