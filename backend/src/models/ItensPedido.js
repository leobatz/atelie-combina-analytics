import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const ItensPedido = database.define('ItensPedido', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    pedidoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    nome: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true },
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
    precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
});

export default ItensPedido;
