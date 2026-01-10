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
    },
    ciclo_lectivo: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear()
    },
    trimestre: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    unidad: {
        type: DataTypes.STRING,
        allowNull: true
    },
    visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Actividad;
