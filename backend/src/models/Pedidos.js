import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const Pedidos = database.define('Pedidos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    dataEntrega: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM('pendente', 'atrasado', 'concluido'),
        allowNull: false,
        defaultValue: 'pendente'
    },

    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    valorTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },

    // Cancelamento lógico: mantém os dados, mas retira o pedido da lista ativa.
    canceladoEm: {
        type: DataTypes.DATE,
        allowNull: true
    },
    
});

export default Pedidos;
