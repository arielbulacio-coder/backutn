const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Curso = sequelize.define('Curso', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // '1° A', '6° 2a', etc.
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: true // 1-7
    },
    division: {
        type: DataTypes.STRING,
        allowNull: true // A, B, C...
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = Curso;
