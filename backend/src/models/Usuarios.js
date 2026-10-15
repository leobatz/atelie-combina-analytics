import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const Usuarios = database.define('Usuarios', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    username: {
        type: DataTypes.STRING,
        allowNull: false
    },

    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
});

export default Usuarios;