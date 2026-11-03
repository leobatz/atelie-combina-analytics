import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const Clientes = database.define('Clientes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: true },
    },
    telefone: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: { notEmpty: true },
    },
});

export default Clientes;
