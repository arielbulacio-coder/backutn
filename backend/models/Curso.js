const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Curso = sequelize.define('Curso', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // '1A', '6o 2a', etc.
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Curso;
