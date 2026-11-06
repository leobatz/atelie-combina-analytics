import Clientes from './Clientes.js';
import Pedidos from './Pedidos.js';
import ItensPedido from './ItensPedido.js';
import Usuarios from './Usuarios.js';

Clientes.hasMany(Pedidos, {
    foreignKey: 'clienteId', 
    as: 'pedidos', 
    onDelete: 'RESTRICT',
});
Pedidos.belongsTo(Clientes, {
    foreignKey: 'clienteId', 
    as: 'cliente', 
    onDelete: 'RESTRICT',
});

Pedidos.hasMany(ItensPedido, {
    foreignKey: 'pedidoId', 
    as: 'itens', 
    onDelete: 'CASCADE',
});
ItensPedido.belongsTo(Pedidos, {
    foreignKey: 'pedidoId', 
    as: 'pedido', 
    onDelete: 'CASCADE',
});

export { 
    Clientes, 
    Pedidos, 
    ItensPedido, 
    Usuarios 
};
