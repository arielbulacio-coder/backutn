const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Actividad = sequelize.define('Actividad', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    curso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    materia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_entrega: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
});

module.exports = Actividad;
